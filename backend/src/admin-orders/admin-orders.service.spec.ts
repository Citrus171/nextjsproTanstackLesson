import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminOrdersService } from "./admin-orders.service";
import { OrderEntity } from "../orders/entities/order.entity";
import { OrderItemEntity } from "../orders/entities/order-item.entity";
import { UserEntity } from "../users/entities/user.entity";

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  Object.assign(new UserEntity(), {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    password: "hashed",
    address: null,
    createdAt: new Date("2024-01-01"),
    deletedAt: null,
    ...overrides,
  });

const makeOrder = (overrides: Partial<OrderEntity> = {}): OrderEntity =>
  Object.assign(new OrderEntity(), {
    id: 1,
    userId: 1,
    user: makeUser(),
    status: "paid",
    shippingAddress: {
      zip: "100-0001",
      prefecture: "東京都",
      city: "千代田区",
      address1: "1-1",
    },
    shippingFee: 500,
    totalAmount: 10500,
    stripeSessionId: "cs_test_abc123",
    items: [],
    createdAt: new Date("2024-03-01"),
    ...overrides,
  });

const makeItem = (overrides: Partial<OrderItemEntity> = {}): OrderItemEntity =>
  Object.assign(new OrderItemEntity(), {
    id: 1,
    orderId: 1,
    variationId: 10,
    productId: 5,
    productName: "テストシャツ",
    size: "M",
    color: "white",
    quantity: 2,
    price: 5000,
    ...overrides,
  });

const mockRepo = <T extends object>(): MockRepo<T> => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockStripe = {
  checkout: {
    sessions: {
      retrieve: jest.fn(),
    },
  },
  refunds: {
    create: jest.fn(),
  },
};

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe("AdminOrdersService", () => {
  let service: AdminOrdersService;
  let orderRepo: MockRepo<OrderEntity>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockRepo<OrderEntity>(),
        },
      ],
    }).compile();

    service = module.get<AdminOrdersService>(AdminOrdersService);
    orderRepo = module.get(getRepositoryToken(OrderEntity));
  });

  // ────────────────────────────────────────────────
  // findAll
  // ────────────────────────────────────────────────
  describe("findAll", () => {
    it("ページネーション付きで注文一覧（ユーザー情報含む）を返すこと", async () => {
      const order = makeOrder();
      orderRepo.findAndCount!.mockResolvedValue([[order], 1]);

      const result = await service.findAll(1, 20);

      expect(orderRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: { createdAt: "DESC" },
        relations: { user: true },
      });
      expect(result).toEqual({
        items: [
          {
            id: 1,
            status: "paid",
            totalAmount: 10500,
            createdAt: order.createdAt,
            user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      });
    });

    it("page=2,limit=10の時スキップ量が10になること", async () => {
      orderRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findAll(2, 10);

      expect(orderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it("ステータスフィルターが指定された場合、そのステータスで絞り込むこと", async () => {
      const order = makeOrder({ status: "shipped" });
      orderRepo.findAndCount!.mockResolvedValue([[order], 1]);

      await service.findAll(1, 20, "shipped");

      expect(orderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "shipped" },
        }),
      );
    });
  });

  // ────────────────────────────────────────────────
  // findById
  // ────────────────────────────────────────────────
  describe("findById", () => {
    it("存在する注文IDの詳細（商品明細・配送先・ユーザー情報）を返すこと", async () => {
      const item = makeItem();
      const order = makeOrder({ items: [item] });
      orderRepo.findOne!.mockResolvedValue(order);

      const result = await service.findById(1);

      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true, items: true },
      });
      expect(result).toEqual({
        id: 1,
        status: "paid",
        shippingAddress: order.shippingAddress,
        shippingFee: 500,
        totalAmount: 10500,
        createdAt: order.createdAt,
        user: { id: 1, name: "山田太郎", email: "yamada@example.com" },
        items: [
          {
            id: 1,
            productName: "テストシャツ",
            size: "M",
            color: "white",
            quantity: 2,
            price: 5000,
          },
        ],
      });
    });

    it("存在しない注文IDではNotFoundExceptionを投げること", async () => {
      orderRepo.findOne!.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ────────────────────────────────────────────────
  // updateStatus
  // ────────────────────────────────────────────────
  describe("updateStatus", () => {
    it("paid→shippedへの遷移が成功すること", async () => {
      const order = makeOrder({ status: "paid" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue({ ...order, status: "shipped" });

      await service.updateStatus(1, "shipped");

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "shipped" }),
      );
    });

    it("shipped→deliveredへの遷移が成功すること", async () => {
      const order = makeOrder({ status: "shipped" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue({ ...order, status: "delivered" });

      await service.updateStatus(1, "delivered");

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "delivered" }),
      );
    });

    it("不正遷移（delivered→shipped）はBadRequestExceptionを投げること", async () => {
      const order = makeOrder({ status: "delivered" });
      orderRepo.findOne!.mockResolvedValue(order);

      await expect(service.updateStatus(1, "shipped")).rejects.toThrow(
        BadRequestException,
      );
      expect(orderRepo.save).not.toHaveBeenCalled();
    });

    it("不正遷移（paid→delivered）はBadRequestExceptionを投げること", async () => {
      const order = makeOrder({ status: "paid" });
      orderRepo.findOne!.mockResolvedValue(order);

      await expect(service.updateStatus(1, "delivered")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("存在しない注文IDではNotFoundExceptionを投げること", async () => {
      orderRepo.findOne!.mockResolvedValue(null);

      await expect(service.updateStatus(999, "shipped")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ────────────────────────────────────────────────
  // cancelOrder
  // ────────────────────────────────────────────────
  describe("cancelOrder", () => {
    it("paidの注文をcancelledにしStripe返金後refundedになること", async () => {
      const order = makeOrder({ status: "paid", stripeSessionId: "cs_test_abc" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_intent: "pi_test_xyz",
        payment_status: "paid",
      });
      mockStripe.refunds.create.mockResolvedValue({ id: "re_test_123" });

      await service.cancelOrder(1);

      // cancelled → refunded の2回saveが呼ばれる
      expect(orderRepo.save).toHaveBeenCalledTimes(2);
      // Stripe返金が正しい引数で呼ばれること
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        "cs_test_abc",
      );
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_test_xyz",
      });
      // 最終的にrefundedで保存されること
      expect(orderRepo.save).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "refunded" }),
      );
    });

    it("shippedの注文もStripe返金してrefundedになること", async () => {
      const order = makeOrder({ status: "shipped", stripeSessionId: "cs_test_def" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_intent: "pi_test_uvw",
        payment_status: "paid",
      });
      mockStripe.refunds.create.mockResolvedValue({ id: "re_test_456" });

      await service.cancelOrder(1);

      expect(mockStripe.refunds.create).toHaveBeenCalled();
      expect(orderRepo.save).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "refunded" }),
      );
    });

    it("pendingの注文はStripe返金なしでcancelledになること", async () => {
      const order = makeOrder({ status: "pending", stripeSessionId: null });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);

      await service.cancelOrder(1);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "cancelled" }),
      );
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("pendingでstripeSessionIdがあっても返金しないこと", async () => {
      // pending状態でもstripeSessionIdが存在するケースがある（Checkout Session作成後・未決済）
      const order = makeOrder({ status: "pending", stripeSessionId: "cs_test_pending" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);

      await service.cancelOrder(1);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(mockStripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("payment_statusがpaidでない場合はcancelledのまま返金しないこと", async () => {
      const order = makeOrder({ status: "paid", stripeSessionId: "cs_test_unpaid" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_intent: "pi_test_xyz",
        payment_status: "unpaid",
      });

      await service.cancelOrder(1);

      expect(orderRepo.save).toHaveBeenCalledTimes(1);
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("Stripe返金APIが失敗した場合、InternalServerErrorExceptionを投げること", async () => {
      const order = makeOrder({ status: "paid", stripeSessionId: "cs_test_abc" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_intent: "pi_test_xyz",
        payment_status: "paid",
      });
      mockStripe.refunds.create.mockRejectedValue(new Error("Stripe error"));

      await expect(service.cancelOrder(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("sessions.retrieve が失敗した場合、InternalServerErrorExceptionを投げること", async () => {
      const order = makeOrder({ status: "paid", stripeSessionId: "cs_test_abc" });
      orderRepo.findOne!.mockResolvedValue(order);
      orderRepo.save!.mockResolvedValue(order);
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error("Stripe network error"),
      );

      await expect(service.cancelOrder(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      // refunds.create は呼ばれないこと
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("deliveredの注文はキャンセル不可でBadRequestExceptionを投げること", async () => {
      const order = makeOrder({ status: "delivered" });
      orderRepo.findOne!.mockResolvedValue(order);

      await expect(service.cancelOrder(1)).rejects.toThrow(BadRequestException);
      expect(orderRepo.save).not.toHaveBeenCalled();
    });

    it("存在しない注文IDではNotFoundExceptionを投げること", async () => {
      orderRepo.findOne!.mockResolvedValue(null);

      await expect(service.cancelOrder(999)).rejects.toThrow(NotFoundException);
    });
  });
});
