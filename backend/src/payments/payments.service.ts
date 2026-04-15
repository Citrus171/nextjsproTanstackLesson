import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, QueryFailedError } from "typeorm";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require("stripe");
import { CartEntity } from "../carts/entities/cart.entity";
import { OrderEntity } from "../orders/entities/order.entity";
import { OrderItemEntity } from "../orders/entities/order-item.entity";
import { StoreSettingsEntity } from "../store-settings/entities/store-settings.entity";
import { StripeEventEntity } from "./entities/stripe-event.entity";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { MailService, OrderWithRelations } from "../mail/mail.service";

@Injectable()
export class PaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(StoreSettingsEntity)
    private readonly storeSettingsRepository: Repository<StoreSettingsEntity>,
    @InjectRepository(StripeEventEntity)
    private readonly stripeEventRepository: Repository<StripeEventEntity>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {
    this.stripe = new StripeLib(
      process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy",
      { apiVersion: "2026-03-25.dahlia" },
    );
  }

  async createCheckoutSession(
    userId: number,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const sessionId = String(userId);

    // カート取得
    const cartItems = await this.cartRepository.find({
      where: { sessionId, status: "reserved" },
      relations: { variation: { product: true } },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException("カートが空です");
    }

    // 店舗設定取得（配送料計算用）
    const settings = await this.storeSettingsRepository.findOneBy({ id: 1 });
    if (!settings) {
      throw new BadRequestException("店舗設定が見つかりません");
    }

    // 合計金額・配送料計算
    const subtotal = cartItems.reduce(
      (
        sum: number,
        item: CartEntity & {
          variation: {
            price: number;
            product: { id: number; name: string };
            size: string;
            color: string;
          };
        },
      ) => sum + item.variation.price * item.quantity,
      0,
    );
    const shippingFee =
      subtotal >= settings.shippingFreeThreshold
        ? 0
        : settings.shippingFixedFee;
    const totalAmount = subtotal + shippingFee;

    // 注文レコードを pending で作成
    const order = await this.orderRepository.save({
      userId,
      status: "pending" as const,
      shippingAddress: {
        zip: dto.zip,
        prefecture: dto.prefecture,
        city: dto.city,
        address1: dto.address1,
        address2: dto.address2,
      },
      shippingFee,
      totalAmount,
      stripeSessionId: null,
    });

    // order_items を価格スナップショットとして保存
     
    await this.orderItemRepository.save(
      cartItems.map((item: any) => ({
        orderId: order.id,
        variationId: item.variationId,
        productId: item.variation.product.id,
        productName: item.variation.product.name,
        size: item.variation.size,
        color: item.variation.color,
        quantity: item.quantity,
        price: item.variation.price,
      })),
    );

    // Stripe Checkout Session 作成
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: `${item.variation.product.name} (${item.variation.size}/${item.variation.color})`,
        },
        unit_amount: item.variation.price,
      },
      quantity: item.quantity,
    }));

    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "jpy",
          product_data: { name: "配送料" },
          unit_amount: shippingFee,
        },
        quantity: 1,
      });
    }

    let session: { id: string; url?: string };

    try {
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/checkout/complete`,
        cancel_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/checkout`,
        metadata: { orderId: String(order.id) },
      });
    } catch (error) {
      await this.orderRepository.delete({ id: order.id });
      throw error;
    }

    // order に stripeSessionId を保存
    await this.orderRepository.update(
      { id: order.id },
      { stripeSessionId: session.id },
    );

    return { url: session.url as string };
  }

  async handleWebhook(signature: string, rawBody: Buffer): Promise<void> {
    let event: {
      id: string;
      type: string;
      data: { object: { id: string; metadata?: { orderId?: string } } };
    };

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_dummy",
      );
    } catch {
      throw new BadRequestException("Webhook署名の検証に失敗しました");
    }

    // checkout.session.completed 以外は無視
    if (event.type !== "checkout.session.completed") {
      return;
    }

    const session = event.data.object;
    const orderId = Number(session.metadata?.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      this.logger.error(
        `Invalid orderId in Stripe session metadata: ${session.metadata?.orderId ?? "undefined"}`,
      );
      throw new BadRequestException("WebhookのorderIdが不正です");
    }

    // 冪等性チェック
    const alreadyProcessed = await this.stripeEventRepository.findOne({
      where: { eventId: event.id },
    });
    if (alreadyProcessed) {
      return;
    }

    // トランザクション内で処理
    await this.dataSource.transaction(async (manager) => {
      try {
        await manager.save(StripeEventEntity, {
          eventId: event.id,
          processedAt: new Date(),
        });
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          /unique|duplicate/i.test(String(error.message))
        ) {
          return;
        }
        throw error;
      }

      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
      });

      if (!order) {
        this.logger.error(`Order not found: orderId=${orderId}`);
        return;
      }

      // 注文ステータスを paid に更新
      await manager.update(OrderEntity, { id: order.id }, { status: "paid" });

      // カートを purchased に更新
      await manager.update(
        CartEntity,
        { sessionId: String(order.userId), status: "reserved" },
        { status: "purchased" },
      );
    });

    // トランザクション完了後にメール送信（失敗してもWebhookは200を返す）
    try {
      const orderWithRelations = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: { user: true, items: true },
      });
      if (orderWithRelations) {
        await this.mailService.sendOrderConfirmation(
          orderWithRelations as OrderWithRelations,
        );
      }
    } catch (error) {
      this.logger.error(
        `注文確認メール送信失敗: orderId=${orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
