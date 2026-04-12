import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminMembersService } from "./admin-members.service";
import { UserEntity } from "../users/entities/user.entity";
import { OrderEntity } from "../orders/entities/order.entity";

type MockRepository<T = any> = Partial<Record<string, jest.Mock>>;

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  Object.assign(new UserEntity(), {
    id: 1,
    name: "山田太郎",
    email: "test@example.com",
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
    status: "paid",
    shippingAddress: {
      zip: "123-4567",
      prefecture: "東京都",
      city: "千代田区",
      address1: "1-1",
    },
    shippingFee: 500,
    totalAmount: 10000,
    stripeSessionId: null,
    createdAt: new Date("2024-01-01"),
    items: [],
    ...overrides,
  });

const mockRepository = <T>(): MockRepository<T> => ({
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe("AdminMembersService", () => {
  let service: AdminMembersService;
  let userRepo: MockRepository<UserEntity>;
  let orderRepo: MockRepository<OrderEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminMembersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository<UserEntity>(),
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockRepository<OrderEntity>(),
        },
      ],
    }).compile();

    service = module.get<AdminMembersService>(AdminMembersService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    orderRepo = module.get(getRepositoryToken(OrderEntity));
  });

  describe("findAll", () => {
    it("ページネーション付きで会員一覧を返す", async () => {
      const user = makeUser();
      userRepo.findAndCount!.mockResolvedValue([[user], 1]);

      const result = await service.findAll(2, 10);

      expect(userRepo.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({
        items: [
          {
            id: 1,
            name: "山田太郎",
            email: "test@example.com",
            createdAt: user.createdAt,
            deletedAt: null,
          },
        ],
        page: 2,
        limit: 10,
        total: 1,
      });
    });
  });

  describe("findById", () => {
    it("存在するユーザーIDの詳細を返す", async () => {
      const user = makeUser();
      const order = makeOrder();
      userRepo.findOneBy!.mockResolvedValue(user);
      orderRepo.find!.mockResolvedValue([order]);

      const result = await service.findById(1);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({
        id: 1,
        name: "山田太郎",
        email: "test@example.com",
        address: null,
        createdAt: user.createdAt,
        deletedAt: null,
        orders: [
          {
            id: 1,
            status: "paid",
            totalAmount: 10000,
            createdAt: order.createdAt,
          },
        ],
      });
    });

    it("存在しないユーザーIDではNotFoundExceptionを投げる", async () => {
      userRepo.findOneBy!.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findOrdersByUserId", () => {
    it("userIdに紐づく注文を取得する", async () => {
      const order = makeOrder();
      orderRepo.find!.mockResolvedValue([order]);

      const result = await service.findOrdersByUserId(1);

      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual([order]);
    });
  });

  describe("softDelete", () => {
    it("存在するIDのユーザーを論理削除する", async () => {
      const user = makeUser();
      userRepo.findOneBy!.mockResolvedValue(user);
      userRepo.save!.mockResolvedValue({ ...user, deletedAt: new Date() });

      const result = await service.softDelete(1);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          deletedAt: expect.any(Date),
        }),
      );
      expect(result).toBe(true);
    });

    it("存在しないIDはfalseを返す", async () => {
      userRepo.findOneBy!.mockResolvedValue(null);

      const result = await service.softDelete(999);

      expect(result).toBe(false);
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
