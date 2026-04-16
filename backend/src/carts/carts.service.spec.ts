import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartStatus } from '@prisma/client';

type MockPrisma = {
  cart: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  productVariation: {
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('CartsService', () => {
  let service: CartsService;
  let mockPrisma: MockPrisma;

  beforeEach(async () => {
    mockPrisma = {
      cart: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      productVariation: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('セッションIDに対応するカートアイテムを返すこと', async () => {
      const cartItems = [
        {
          id: 1,
          sessionId: '1',
          variationId: 100,
          quantity: 2,
          status: CartStatus.reserved,
          variation: {
            id: 100,
            size: 'M',
            color: 'red',
            price: 1000,
            stock: 5,
            product: { id: 1, name: 'Test' },
          },
        },
      ];

      mockPrisma.cart.findMany.mockResolvedValue(cartItems);

      const result = await service.getCart(1);

      expect(mockPrisma.cart.findMany).toHaveBeenCalledWith({
        where: { sessionId: '1', status: CartStatus.reserved },
        include: { variation: { include: { product: true } } },
      });
      expect(result).toEqual(cartItems);
    });

    it('カートが空の場合は空配列を返すこと', async () => {
      mockPrisma.cart.findMany.mockResolvedValue([]);

      const result = await service.getCart(1);

      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('在庫があるバリエーションをカートに新規追加できること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 2;
      const variation = { id: variationId, stock: 10 };
      const createdCart = {
        id: 1,
        sessionId: '1',
        variationId,
        quantity,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariation.findUnique.mockResolvedValue(variation);
      mockPrisma.cart.findFirst
        .mockResolvedValueOnce(null) // 既存カートなし
        .mockResolvedValueOnce(createdCart); // 追加後の取得
      mockPrisma.cart.create.mockResolvedValue(createdCart);
      mockPrisma.productVariation.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.addToCart(userId, { variationId, quantity });

      expect(mockPrisma.productVariation.findUnique).toHaveBeenCalledWith({
        where: { id: variationId },
      });
      expect(mockPrisma.cart.create).toHaveBeenCalled();
      expect(mockPrisma.productVariation.updateMany).toHaveBeenCalledWith({
        where: { id: variationId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      expect(result).toEqual(createdCart);
    });

    it('同一バリエーションが既にカートにある場合は数量を加算すること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 2;
      const existingCart = {
        id: 1,
        sessionId: '1',
        variationId,
        quantity: 1,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariation.findUnique.mockResolvedValue({ id: variationId, stock: 10 });
      mockPrisma.cart.findFirst
        .mockResolvedValueOnce(existingCart)
        .mockResolvedValueOnce({ ...existingCart, quantity: 3 });
      mockPrisma.cart.update.mockResolvedValue({ ...existingCart, quantity: 3 });
      mockPrisma.productVariation.updateMany.mockResolvedValue({ count: 1 });

      await service.addToCart(userId, { variationId, quantity });

      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: existingCart.id },
        data: { quantity: { increment: quantity } },
      });
    });

    it('在庫不足時はBadRequestExceptionを投げること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 10;

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariation.findUnique.mockResolvedValue({ id: variationId, stock: 5 });
      mockPrisma.productVariation.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.addToCart(userId, { variationId, quantity })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('存在しないバリエーションはNotFoundExceptionを投げること', async () => {
      const userId = 1;
      const variationId = 999;

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariation.findUnique.mockResolvedValue(null);

      await expect(service.addToCart(userId, { variationId, quantity: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateItem', () => {
    it('数量を増加した場合に在庫を差分だけ減算すること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '1',
        quantity: 2,
        variationId: 100,
        status: CartStatus.reserved,
      };
      const variation = { id: 100, stock: 10 };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);
      mockPrisma.productVariation.findUnique.mockResolvedValue(variation);
      mockPrisma.productVariation.update.mockResolvedValue({ ...variation, stock: 7 });
      mockPrisma.cart.update.mockResolvedValue({ ...cart, quantity: 5 });

      await service.updateItem(userId, cartId, { quantity: 5 });

      expect(mockPrisma.productVariation.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { stock: { decrement: 3 } }, // 5 - 2 = 3
      });
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: cartId },
        data: { quantity: 5 },
      });
    });

    it('数量を減少した場合に在庫を差分だけ加算すること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '1',
        quantity: 5,
        variationId: 100,
        status: CartStatus.reserved,
      };
      const variation = { id: 100, stock: 5 };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);
      mockPrisma.productVariation.findUnique.mockResolvedValue(variation);
      mockPrisma.productVariation.update.mockResolvedValue({ ...variation, stock: 9 });
      mockPrisma.cart.update.mockResolvedValue({ ...cart, quantity: 1 });

      await service.updateItem(userId, cartId, { quantity: 1 });

      expect(mockPrisma.productVariation.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { stock: { increment: 4 } }, // 5 - 1 = 4
      });
    });

    it('数量が同じ場合は在庫を変更しないこと', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '1',
        quantity: 3,
        variationId: 100,
        status: CartStatus.reserved,
      };
      const variation = { id: 100, stock: 5 };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);
      mockPrisma.productVariation.findUnique.mockResolvedValue(variation);
      mockPrisma.cart.update.mockResolvedValue(cart);

      await service.updateItem(userId, cartId, { quantity: 3 });

      expect(mockPrisma.productVariation.update).not.toHaveBeenCalled();
    });

    it('増加後に在庫不足ならBadRequestExceptionを投げること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '1',
        quantity: 2,
        variationId: 100,
        status: CartStatus.reserved,
      };
      const variation = { id: 100, stock: 5 };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);
      mockPrisma.productVariation.findUnique.mockResolvedValue(variation);

      await expect(service.updateItem(userId, cartId, { quantity: 10 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('他セッションのカートアイテムはForbiddenExceptionを投げること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '2',
        quantity: 2,
        variationId: 100,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);

      await expect(service.updateItem(userId, cartId, { quantity: 5 })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('存在しないカートアイテムはNotFoundExceptionを投げること', async () => {
      const userId = 1;
      const cartId = 999;

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(null);

      await expect(service.updateItem(userId, cartId, { quantity: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeItem', () => {
    it('削除時に在庫をquantityだけ加算すること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '1',
        quantity: 3,
        variationId: 100,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);
      mockPrisma.productVariation.update.mockResolvedValue({});
      mockPrisma.cart.delete.mockResolvedValue(cart);

      await service.removeItem(userId, cartId);

      expect(mockPrisma.productVariation.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { stock: { increment: 3 } },
      });
      expect(mockPrisma.cart.delete).toHaveBeenCalledWith({ where: { id: cartId } });
    });

    it('他セッションのアイテムはForbiddenExceptionを投げること', async () => {
      const userId = 1;
      const cartId = 1;
      const cart = {
        id: cartId,
        sessionId: '2',
        quantity: 3,
        variationId: 100,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(cart);

      await expect(service.removeItem(userId, cartId)).rejects.toThrow(ForbiddenException);
    });

    it('存在しないカートアイテムはNotFoundExceptionを投げること', async () => {
      const userId = 1;
      const cartId = 999;

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findFirst.mockResolvedValue(null);

      await expect(service.removeItem(userId, cartId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('releaseExpiredCarts', () => {
    it('期限切れカートの在庫を返却しステータスをexpiredに更新すること', async () => {
      const expiredCart = {
        id: 1,
        variationId: 100,
        quantity: 2,
        status: CartStatus.reserved,
      };

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findMany.mockResolvedValue([expiredCart]);
      mockPrisma.productVariation.update.mockResolvedValue({});
      mockPrisma.cart.update.mockResolvedValue({});

      await service.releaseExpiredCarts();

      expect(mockPrisma.productVariation.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { stock: { increment: 2 } },
      });
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: CartStatus.expired },
      });
    });

    it('期限切れカートが複数ある場合は全て処理すること', async () => {
      const expiredCarts = [
        { id: 1, variationId: 100, quantity: 2, status: CartStatus.reserved },
        { id: 2, variationId: 200, quantity: 1, status: CartStatus.reserved },
      ];

      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findMany.mockResolvedValue(expiredCarts);
      mockPrisma.productVariation.update.mockResolvedValue({});
      mockPrisma.cart.update.mockResolvedValue({});

      await service.releaseExpiredCarts();

      expect(mockPrisma.productVariation.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.cart.update).toHaveBeenCalledTimes(2);
    });

    it('期限切れカートがない場合は何もしないこと', async () => {
      mockPrisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      );
      mockPrisma.cart.findMany.mockResolvedValue([]);

      await service.releaseExpiredCarts();

      expect(mockPrisma.productVariation.update).not.toHaveBeenCalled();
      expect(mockPrisma.cart.update).not.toHaveBeenCalled();
    });
  });
});
