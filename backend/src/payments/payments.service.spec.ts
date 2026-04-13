import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, QueryFailedError } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CartEntity } from "../carts/entities/cart.entity";
import { OrderEntity } from "../orders/entities/order.entity";
import { OrderItemEntity } from "../orders/entities/order-item.entity";
import { StoreSettingsEntity } from "../store-settings/entities/store-settings.entity";
import { StripeEventEntity } from "./entities/stripe-event.entity";
import { MailService } from "../mail/mail.service";

// Stripe モック
const mockStripeCheckoutCreate = jest.fn();
const mockStripeWebhookConstruct = jest.fn();

jest.mock("stripe", () => {
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

describe("PaymentsService", () => {
  let service: PaymentsService;
  let mockCartRepository: any;
  let mockOrderRepository: any;
  let mockOrderItemRepository: any;
  let mockStoreSettingsRepository: any;
  let mockStripeEventRepository: any;
  let mockDataSource: any;
  let mockMailService: { sendOrderConfirmation: jest.Mock };

  const mockStoreSettings: Partial<StoreSettingsEntity> = {
    shippingFixedFee: 800,
    shippingFreeThreshold: 5000,
  };

  const mockCartItems = [
    {
      id: 1,
      sessionId: "1",
      variationId: 10,
      quantity: 2,
      status: "reserved",
      variation: {
        id: 10,
        size: "M",
        color: "red",
        price: 1500,
        product: {
          id: 5,
          name: "テストシャツ",
        },
      },
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCartRepository = {
      find: jest.fn(),
    };

    mockOrderRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockOrderItemRepository = {
      save: jest.fn(),
    };

    mockStoreSettingsRepository = {
      findOneBy: jest.fn(),
    };

    mockStripeEventRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
    };

    mockMailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(CartEntity),
          useValue: mockCartRepository,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(StoreSettingsEntity),
          useValue: mockStoreSettingsRepository,
        },
        {
          provide: getRepositoryToken(StripeEventEntity),
          useValue: mockStripeEventRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    const dto = {
      zip: "150-0001",
      prefecture: "東京都",
      city: "渋谷区",
      address1: "渋谷1-1-1",
    };

    it("カートが空の場合はBadRequestExceptionを投げること", async () => {
      mockCartRepository.find.mockResolvedValue([]);

      await expect(service.createCheckoutSession(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("カート合計が閾値未満の場合は固定配送料を加算すること", async () => {
      // 合計: 1500 * 2 = 3000円（5000円未満 → 配送料800円）
      mockCartRepository.find.mockResolvedValue(mockCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/test",
      });
      mockOrderRepository.update.mockResolvedValue({});

      const result = await service.createCheckoutSession(1, dto);

      // shippingFee = 800 が渡されること
      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ shippingFee: 800 }),
      );
      expect(result).toEqual({ url: "https://checkout.stripe.com/test" });
    });

    it("カート合計が閾値以上の場合は配送料が無料になること", async () => {
      // 合計: 3000 * 2 = 6000円（5000円以上 → 配送料0円）
      const highValueCartItems = [
        {
          ...mockCartItems[0],
          quantity: 2,
          variation: { ...mockCartItems[0].variation, price: 3000 },
        },
      ];
      mockCartRepository.find.mockResolvedValue(highValueCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/test",
      });
      mockOrderRepository.update.mockResolvedValue({});

      await service.createCheckoutSession(1, dto);

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ shippingFee: 0 }),
      );
    });

    it("Stripe Checkout SessionのURLを返すこと", async () => {
      mockCartRepository.find.mockResolvedValue(mockCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/cs_test_xxx",
      });
      mockOrderRepository.update.mockResolvedValue({});

      const result = await service.createCheckoutSession(1, dto);

      expect(result.url).toBe("https://checkout.stripe.com/cs_test_xxx");
    });

    it("Stripeセッション作成に失敗したときに一時注文を削除すること", async () => {
      mockCartRepository.find.mockResolvedValue(mockCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockRejectedValue(new Error("Stripe error"));
      mockOrderRepository.delete.mockResolvedValue({});

      await expect(service.createCheckoutSession(1, dto)).rejects.toThrow(
        "Stripe error",
      );
      expect(mockOrderRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it("pendingステータスで注文レコードを作成すること", async () => {
      mockCartRepository.find.mockResolvedValue(mockCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/test",
      });
      mockOrderRepository.update.mockResolvedValue({});

      await service.createCheckoutSession(1, dto);

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending", userId: 1 }),
      );
    });

    it("購入時点の価格スナップショットをorder_itemsに保存すること", async () => {
      mockCartRepository.find.mockResolvedValue(mockCartItems);
      mockStoreSettingsRepository.findOneBy.mockResolvedValue(
        mockStoreSettings,
      );

      const mockOrder = { id: 1, stripeSessionId: null };
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockOrderItemRepository.save.mockResolvedValue({});
      mockStripeCheckoutCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/test",
      });
      mockOrderRepository.update.mockResolvedValue({});

      await service.createCheckoutSession(1, dto);

      expect(mockOrderItemRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            orderId: 1,
            variationId: 10,
            productId: 5,
            productName: "テストシャツ",
            size: "M",
            color: "red",
            quantity: 2,
            price: 1500,
          }),
        ]),
      );
    });
  });

  describe("handleWebhook", () => {
    const rawBody = Buffer.from('{"type":"checkout.session.completed"}');
    const signature = "test-signature";

    it("無効なStripe署名の場合はBadRequestExceptionを投げること", async () => {
      mockStripeWebhookConstruct.mockImplementation(() => {
        throw new Error(
          "No signatures found matching the expected signature for payload",
        );
      });

      await expect(service.handleWebhook(signature, rawBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("orderIdが数値でない場合はBadRequestExceptionを投げること", async () => {
      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_invalid_order_id",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test",
            metadata: { orderId: "not-a-number" },
          },
        },
      });
      mockStripeEventRepository.findOne.mockResolvedValue(null);

      await expect(service.handleWebhook(signature, rawBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("checkout.session.completed以外のイベントは無視して200を返すこと", async () => {
      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_other",
        type: "payment_intent.created",
        data: { object: {} },
      });

      await expect(
        service.handleWebhook(signature, rawBody),
      ).resolves.toBeUndefined();
    });

    it("処理済みのevent_idは二重処理しないこと", async () => {
      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_already_processed",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test", metadata: { orderId: "1" } } },
      });

      mockStripeEventRepository.findOne.mockResolvedValue({
        id: 1,
        eventId: "evt_already_processed",
      });

      await service.handleWebhook(signature, rawBody);

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it("stripe_events 保存で unique 制約エラーが起きた場合は冪等として無視すること", async () => {
      const mockManager = {
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_unique_conflict",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_xxx",
            metadata: { orderId: "1" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      const duplicateError = new QueryFailedError(
        "INSERT",
        [],
        new Error("UNIQUE constraint failed: stripe_events.eventId"),
      );
      mockManager.save.mockRejectedValue(duplicateError);

      await expect(
        service.handleWebhook(signature, rawBody),
      ).resolves.toBeUndefined();
      expect(mockManager.update).not.toHaveBeenCalled();
    });

    it("checkout.session.completed受信後に注文ステータスをpaidにすること", async () => {
      const mockManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_new",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_xxx",
            metadata: { orderId: "1" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      const mockOrder = { id: 1, status: "pending", userId: 1 };
      mockManager.findOne.mockResolvedValue(mockOrder);
      mockManager.update.mockResolvedValue({});
      mockManager.save.mockResolvedValue({});

      await service.handleWebhook(signature, rawBody);

      expect(mockManager.update).toHaveBeenCalledWith(
        OrderEntity,
        { id: 1 },
        { status: "paid" },
      );
    });

    it("checkout.session.completed受信後にカートをpurchasedに更新すること", async () => {
      const mockManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_new2",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_yyy",
            metadata: { orderId: "2" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      const mockOrder = { id: 2, status: "pending", userId: 2 };
      mockManager.findOne.mockResolvedValue(mockOrder);
      mockManager.update.mockResolvedValue({});
      mockManager.save.mockResolvedValue({});

      await service.handleWebhook(signature, rawBody);

      expect(mockManager.update).toHaveBeenCalledWith(
        CartEntity,
        { sessionId: "2", status: "reserved" },
        { status: "purchased" },
      );
    });

    it("処理後にstripe_eventsにevent_idをINSERTすること", async () => {
      const mockManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_new3",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_zzz",
            metadata: { orderId: "3" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      const mockOrder = { id: 3, status: "pending", userId: 3 };
      mockManager.findOne.mockResolvedValue(mockOrder);
      mockManager.update.mockResolvedValue({});
      mockManager.save.mockResolvedValue({});

      await service.handleWebhook(signature, rawBody);

      expect(mockManager.save).toHaveBeenCalledWith(
        StripeEventEntity,
        expect.objectContaining({ eventId: "evt_new3" }),
      );
    });

    it("checkout.session.completed受信後にメール送信が呼ばれること", async () => {
      const mockManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_mail_send",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_mail",
            metadata: { orderId: "10" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      const mockManagerOrder = { id: 10, status: "pending", userId: 5 };
      mockManager.findOne.mockResolvedValue(mockManagerOrder);
      mockManager.update.mockResolvedValue({});
      mockManager.save.mockResolvedValue({});

      const orderWithRelations = {
        id: 10,
        userId: 5,
        status: "paid",
        shippingFee: 800,
        totalAmount: 3800,
        shippingAddress: { zip: "150-0001", prefecture: "東京都", city: "渋谷区", address1: "渋谷1-1-1" },
        user: { id: 5, email: "user5@example.com", name: "テスト" },
        items: [{ id: 1, productName: "シャツ", quantity: 2, price: 1500 }],
      };
      mockOrderRepository.findOne.mockResolvedValue(orderWithRelations);

      await service.handleWebhook(signature, rawBody);

      expect(mockMailService.sendOrderConfirmation).toHaveBeenCalledWith(
        orderWithRelations,
      );
    });

    it("メール送信が失敗してもWebhookが正常完了すること", async () => {
      const mockManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      };

      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_mail_fail",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_mailfail",
            metadata: { orderId: "11" },
          },
        },
      });

      mockStripeEventRepository.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation((cb: any) =>
        cb(mockManager),
      );

      mockManager.findOne.mockResolvedValue({ id: 11, status: "pending", userId: 6 });
      mockManager.update.mockResolvedValue({});
      mockManager.save.mockResolvedValue({});

      const orderWithRelations = {
        id: 11,
        user: { email: "user6@example.com" },
        items: [],
      };
      mockOrderRepository.findOne.mockResolvedValue(orderWithRelations);
      mockMailService.sendOrderConfirmation.mockRejectedValue(
        new Error("SMTP connection failed"),
      );

      await expect(
        service.handleWebhook(signature, rawBody),
      ).resolves.toBeUndefined();
    });

    it("無効署名の時はメール送信が呼ばれないこと", async () => {
      mockStripeWebhookConstruct.mockImplementation(() => {
        throw new Error("signature mismatch");
      });

      await expect(service.handleWebhook(signature, rawBody)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockMailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it("checkout.session.completed以外のイベントはメール送信されないこと", async () => {
      mockStripeWebhookConstruct.mockReturnValue({
        id: "evt_other_nomail",
        type: "payment_intent.created",
        data: { object: {} },
      });

      await service.handleWebhook(signature, rawBody);

      expect(mockMailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });
  });
});
