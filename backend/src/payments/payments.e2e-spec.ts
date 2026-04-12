import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductImageEntity } from '../products/entities/product-image.entity';
import { ProductVariationEntity } from '../products/entities/product-variation.entity';
import { CartEntity } from '../carts/entities/cart.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { StoreSettingsEntity } from '../store-settings/entities/store-settings.entity';
import { StripeEventEntity } from './entities/stripe-event.entity';
import { AdminUserEntity } from '../admin-users/entities/admin-user.entity';
import { PaymentsModule } from './payments.module';
import { AuthModule } from '../auth/auth.module';

const mockStripeCheckoutCreate = jest.fn();
const mockStripeWebhookConstruct = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeCheckoutCreate,
      },
    },
    webhooks: {
      constructEvent: mockStripeWebhookConstruct,
    },
  }));
});

const ALL_ENTITIES = [
  UserEntity,
  AdminUserEntity,
  CategoryEntity,
  ProductEntity,
  ProductImageEntity,
  ProductVariationEntity,
  CartEntity,
  OrderEntity,
  OrderItemEntity,
  StoreSettingsEntity,
  StripeEventEntity,
];

async function createTestApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.DB_HOST ?? 'localhost',
        port: 3306,
        username: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? 'password',
        database: process.env.DB_TEST_NAME ?? 'ec_db_test',
        entities: ALL_ENTITIES,
        synchronize: true,
        dropSchema: true,
      }),
      // テストデータ投入用に追加リポジトリを登録
      TypeOrmModule.forFeature([
        UserEntity,
        ProductEntity,
        ProductVariationEntity,
      ]),
      AuthModule,
      PaymentsModule,
    ],
  }).compile();

  const app = module.createNestApplication({ rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

jest.setTimeout(30000);

describe('Payments E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  let productRepository: Repository<ProductEntity>;
  let variationRepository: Repository<ProductVariationEntity>;
  let cartRepository: Repository<CartEntity>;
  let orderRepository: Repository<OrderEntity>;
  let storeSettingsRepository: Repository<StoreSettingsEntity>;
  let stripeEventRepository: Repository<StripeEventEntity>;

  // userId=1: カートあり（checkout正常テスト用）
  // userId=2: カートなし（空カートテスト用）
  // userId=3: カートあり + pending注文あり（webhookテスト用）
  let userWithCartToken: string;
  let userWithoutCartToken: string;
  let variationId: number;
  let webhookOrderId: number;
  const shippingAddress = {
    zip: '150-0001',
    prefecture: '東京都',
    city: '渋谷区',
    address1: '渋谷1-1-1',
  };

  beforeAll(async () => {
    app = await createTestApp();

    jwtService = app.get<JwtService>(JwtService);
    userRepository = app.get('UserEntityRepository');
    productRepository = app.get('ProductEntityRepository');
    variationRepository = app.get('ProductVariationEntityRepository');
    cartRepository = app.get('CartEntityRepository');
    orderRepository = app.get('OrderEntityRepository');
    storeSettingsRepository = app.get('StoreSettingsEntityRepository');
    stripeEventRepository = app.get('StripeEventEntityRepository');

    // テストユーザー作成（JWTのsub用、パスワードは検証しない）
    const user1 = userRepository.create({
      email: 'user1@example.com',
      password: 'hashed',
      name: 'ユーザー1',
    });
    const user2 = userRepository.create({
      email: 'user2@example.com',
      password: 'hashed',
      name: 'ユーザー2',
    });
    const user3 = userRepository.create({
      email: 'user3@example.com',
      password: 'hashed',
      name: 'ユーザー3',
    });
    const savedUser1 = await userRepository.save(user1);
    await userRepository.save(user2);
    const savedUser3 = await userRepository.save(user3);

    // JWTトークン生成
    userWithCartToken = jwtService.sign({ sub: savedUser1.id, type: 'user' });
    userWithoutCartToken = jwtService.sign({ sub: 2, type: 'user' });

    // 商品・バリエーション作成
    const product = await productRepository.save(
      productRepository.create({
        name: 'テスト商品',
        price: 1500,
        isPublished: true,
      }),
    );
    const variation = await variationRepository.save(
      variationRepository.create({
        productId: product.id,
        size: 'M',
        color: 'ブラック',
        price: 1500,
        stock: 10,
      }),
    );
    variationId = variation.id;

    // 店舗設定作成
    const settings = new StoreSettingsEntity();
    settings.shippingFixedFee = 800;
    settings.shippingFreeThreshold = 5000;
    await storeSettingsRepository.save(settings);

    // userId=1のカートアイテム（checkout正常テスト用）
    await cartRepository.save(
      cartRepository.create({
        sessionId: String(savedUser1.id),
        variationId: variation.id,
        quantity: 1,
        reservedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        status: 'reserved',
      }),
    );

    // userId=3のカートアイテム + pending注文（webhookテスト用）
    await cartRepository.save(
      cartRepository.create({
        sessionId: String(savedUser3.id),
        variationId: variation.id,
        quantity: 2,
        reservedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        status: 'reserved',
      }),
    );
    const webhookOrder = await orderRepository.save(
      orderRepository.create({
        userId: savedUser3.id,
        status: 'pending',
        shippingAddress,
        shippingFee: 800,
        totalAmount: 3800,
        stripeSessionId: 'cs_test_webhook_order',
      }),
    );
    webhookOrderId = webhookOrder.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // POST /payments/checkout
  // -------------------------------------------------------------------
  describe('POST /payments/checkout', () => {
    const validBody = {
      zip: '150-0001',
      prefecture: '東京都',
      city: '渋谷区',
      address1: '渋谷1-1-1',
    };

    it('JWTなしで401を返すこと', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/checkout')
        .send(validBody);

      expect(response.status).toBe(401);
    });

    it('カートが空のユーザーがリクエストすると400を返すこと', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/checkout')
        .set('Authorization', `Bearer ${userWithoutCartToken}`)
        .send(validBody);

      expect(response.status).toBe(400);
    });

    it('カートに商品があるユーザーがリクエストするとStripe checkout URLを返すこと', async () => {
      const mockUrl = 'https://checkout.stripe.com/cs_test_xxx';
      mockStripeCheckoutCreate.mockResolvedValue({
        id: 'cs_test_xxx',
        url: mockUrl,
      });

      const response = await request(app.getHttpServer())
        .post('/payments/checkout')
        .set('Authorization', `Bearer ${userWithCartToken}`)
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url', mockUrl);
      expect(mockStripeCheckoutCreate).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------
  // POST /payments/webhook
  // -------------------------------------------------------------------
  describe('POST /payments/webhook', () => {
    const buildCheckoutEvent = (eventId: string, orderId: number) => ({
      id: eventId,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook_order',
          metadata: { orderId: String(orderId) },
        },
      },
    });

    it('無効なStripe署名の場合400を返すこと', async () => {
      mockStripeWebhookConstruct.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'invalid-sig')
        .send(JSON.stringify({ type: 'checkout.session.completed' }));

      expect(response.status).toBe(400);
    });

    it('checkout.session.completed以外のイベントは無視して200を返すこと', async () => {
      const otherEvent = {
        id: 'evt_other',
        type: 'payment_intent.created',
        data: { object: {} },
      };
      mockStripeWebhookConstruct.mockReturnValue(otherEvent);

      const response = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'test-sig')
        .send(JSON.stringify(otherEvent));

      expect(response.status).toBe(200);
    });

    it('checkout.session.completedで注文ステータスがpaidに更新されること', async () => {
      const event = buildCheckoutEvent('evt_paid_order', webhookOrderId);
      mockStripeWebhookConstruct.mockReturnValue(event);

      const response = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'test-sig')
        .send(JSON.stringify(event));

      expect(response.status).toBe(200);
      const order = await orderRepository.findOneBy({ id: webhookOrderId });
      expect(order?.status).toBe('paid');
    });

    it('checkout.session.completedでカートがpurchasedに更新されること', async () => {
      // 前テストで既にpaidになっているため、stripeEventをリセットして再確認
      // カートのstatusはwebhookで'purchased'になっているはずなので確認
      const carts = await cartRepository.find({
        where: { sessionId: '3' },
      });
      expect(carts.every((c) => c.status === 'purchased')).toBe(true);
    });

    it('同一イベントIDを2回受信しても二重処理しないこと（冪等性）', async () => {
      // 別の注文を用意（冪等性テスト専用）
      const idempotentOrder = await orderRepository.save(
        orderRepository.create({
          userId: 2,
          status: 'pending',
          shippingAddress,
          shippingFee: 800,
          totalAmount: 2300,
          stripeSessionId: 'cs_test_idempotent',
        }),
      );

      const event = buildCheckoutEvent('evt_idempotent', idempotentOrder.id);
      mockStripeWebhookConstruct.mockReturnValue(event);

      // 1回目
      await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'test-sig')
        .send(JSON.stringify(event));

      // 2回目（同じevent_id）
      const response = await request(app.getHttpServer())
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'test-sig')
        .send(JSON.stringify(event));

      expect(response.status).toBe(200);

      // stripeEventsに1件だけ記録されていること
      const events = await stripeEventRepository.find({
        where: { eventId: 'evt_idempotent' },
      });
      expect(events).toHaveLength(1);
    });
  });
});
