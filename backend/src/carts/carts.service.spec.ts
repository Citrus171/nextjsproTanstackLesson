import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartEntity } from './entities/cart.entity';
import { ProductVariationEntity } from '../products/entities/product-variation.entity';

describe('CartsService', () => {
  let service: CartsService;
  let mockCartRepository: jest.Mocked<Repository<CartEntity>>;
  let mockVariationRepository: jest.Mocked<Repository<ProductVariationEntity>>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    mockCartRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockVariationRepository = {
      findOne: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(CartEntity),
          useValue: mockCartRepository,
        },
        {
          provide: getRepositoryToken(ProductVariationEntity),
          useValue: mockVariationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
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
          status: 'reserved',
          variation: { id: 100, size: 'M', color: 'red', price: 1000, stock: 5 },
        },
      ];

      mockCartRepository.find.mockResolvedValue(cartItems);

      const result = await service.getCart(1);

      expect(mockCartRepository.find).toHaveBeenCalledWith({
        where: { sessionId: '1', status: 'reserved' },
        relations: { variation: { product: true } },
      });
      expect(result).toEqual(cartItems);
    });

    it('カートが空の場合は空配列を返すこと', async () => {
      mockCartRepository.find.mockResolvedValue([]);

      const result = await service.getCart(1);

      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('在庫があるバリエーションをカートに追加できること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 2;

      const mockManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        insert: jest.fn(),
        decrement: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      const variation = {
        id: variationId,
        stock: 10,
        size: 'M',
        color: 'red',
        price: 1000,
      };

      mockManager.findOne.mockResolvedValue(variation);
      mockManager.find.mockResolvedValue([]);
      mockManager.decrement.mockResolvedValue({});
      mockManager.insert.mockResolvedValue({});

      await service.addToCart(userId, { variationId, quantity });

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.decrement).toHaveBeenCalledWith(
        ProductVariationEntity,
        { id: variationId },
        'stock',
        quantity,
      );
      expect(mockManager.insert).toHaveBeenCalled();
    });

    it('在庫不足時はBadRequestExceptionを投げること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 10;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));
      mockManager.findOne.mockResolvedValue({
        id: variationId,
        stock: 5,
      });

      await expect(
        service.addToCart(userId, { variationId, quantity }),
      ).rejects.toThrow(BadRequestException);
    });

    it('存在しないバリエーションはNotFoundExceptionを投げること', async () => {
      const userId = 1;
      const variationId = 999;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        service.addToCart(userId, { variationId, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('同一セッション・同一バリエーション再追加時はquantityを加算すること', async () => {
      const userId = 1;
      const variationId = 100;
      const quantity = 2;

      const mockManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        increment: jest.fn(),
        decrement: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.findOne.mockResolvedValue({
        id: variationId,
        stock: 10,
      });

      // 既存カートアイテムを返す
      mockManager.find.mockResolvedValue([
        {
          id: 1,
          sessionId: '1',
          variationId: 100,
          quantity: 1,
        },
      ]);

      mockManager.increment.mockResolvedValue({});
      mockManager.decrement.mockResolvedValue({});

      await service.addToCart(userId, { variationId, quantity });

      // increment が呼ばれることを確認
      expect(mockManager.increment).toHaveBeenCalledWith(
        CartEntity,
        { sessionId: '1', variationId, status: 'reserved' },
        'quantity',
        quantity,
      );
    });
  });

  describe('updateItem', () => {
    it('数量を増加した場合に在庫を差分だけ減算すること', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 5;

      const mockManager = {
        findOne: jest.fn(),
        decrement: jest.fn(),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      // 1回目: CartEntity
      mockManager.findOne.mockResolvedValueOnce({
        id: cartItemId,
        sessionId: '1',
        quantity: 2,
        variationId: 100,
      });
      // 2回目: ProductVariationEntity (pessimistic_write)
      mockManager.findOne.mockResolvedValueOnce({
        id: 100,
        stock: 10,
      });

      await service.updateItem(userId, cartItemId, { quantity: newQuantity });

      // 差分 = 5 - 2 = 3
      expect(mockManager.decrement).toHaveBeenCalledWith(
        ProductVariationEntity,
        { id: 100 },
        'stock',
        3,
      );
    });

    it('数量を減少した場合に在庫を差分だけ加算すること', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 1;

      const mockManager = {
        findOne: jest.fn(),
        increment: jest.fn(),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      // 1回目: CartEntity
      mockManager.findOne.mockResolvedValueOnce({
        id: cartItemId,
        sessionId: '1',
        quantity: 5,
        variationId: 100,
      });
      // 2回目: ProductVariationEntity (pessimistic_write)
      mockManager.findOne.mockResolvedValueOnce({
        id: 100,
        stock: 5,
      });

      await service.updateItem(userId, cartItemId, { quantity: newQuantity });

      // 差分 = 5 - 1 = 4 を加算
      expect(mockManager.increment).toHaveBeenCalledWith(
        ProductVariationEntity,
        { id: 100 },
        'stock',
        4,
      );
    });

    it('増加後に在庫不足ならBadRequestExceptionを投げること', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 10;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      // 1回目: CartEntity
      mockManager.findOne.mockResolvedValueOnce({
        id: cartItemId,
        sessionId: '1',
        quantity: 2,
        variationId: 100,
      });
      // 2回目: ProductVariationEntity（在庫不足）
      mockManager.findOne.mockResolvedValueOnce({
        id: 100,
        stock: 5,
      });

      await expect(
        service.updateItem(userId, cartItemId, { quantity: newQuantity }),
      ).rejects.toThrow(BadRequestException);
    });

    it('他セッションのカートアイテムはForbiddenExceptionを投げること', async () => {
      const userId = 1;
      const cartItemId = 1;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.findOne.mockResolvedValue({
        id: cartItemId,
        sessionId: '2', // 異なるセッション
        quantity: 2,
      });

      await expect(
        service.updateItem(userId, cartItemId, { quantity: 5 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('存在しないカートアイテムはNotFoundExceptionを投げること', async () => {
      const userId = 1;
      const cartItemId = 999;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.findOne.mockResolvedValue(null);

      await expect(
        service.updateItem(userId, cartItemId, { quantity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('削除時に在庫をquantityだけ加算すること', async () => {
      const userId = 1;
      const cartItemId = 1;

      const mockManager = {
        findOne: jest.fn(),
        increment: jest.fn(),
        delete: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.findOne.mockResolvedValue({
        id: cartItemId,
        sessionId: '1',
        quantity: 3,
        variationId: 100,
      });

      await service.removeItem(userId, cartItemId);

      expect(mockManager.increment).toHaveBeenCalledWith(
        ProductVariationEntity,
        { id: 100 },
        'stock',
        3,
      );
      expect(mockManager.delete).toHaveBeenCalledWith(CartEntity, cartItemId);
    });

    it('他セッションのアイテムはForbiddenExceptionを投げること', async () => {
      const userId = 1;
      const cartItemId = 1;

      const mockManager = {
        findOne: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.findOne.mockResolvedValue({
        id: cartItemId,
        sessionId: '2', // 異なるセッション
        quantity: 3,
      });

      await expect(
        service.removeItem(userId, cartItemId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('releaseExpiredCarts', () => {
    it('期限切れカートの在庫を返却すること', async () => {
      const mockManager = {
        find: jest.fn(),
        increment: jest.fn(),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.find.mockResolvedValue([
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: 'reserved',
        },
      ]);

      await service.releaseExpiredCarts();

      expect(mockManager.increment).toHaveBeenCalledWith(
        ProductVariationEntity,
        { id: 100 },
        'stock',
        2,
      );
    });

    it('期限切れカートのstatusをexpiredに更新すること', async () => {
      const mockManager = {
        find: jest.fn(),
        increment: jest.fn(),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.find.mockResolvedValue([
        {
          id: 1,
          variationId: 100,
          quantity: 2,
          status: 'reserved',
        },
      ]);

      await service.releaseExpiredCarts();

      expect(mockManager.update).toHaveBeenCalledWith(
        CartEntity,
        { id: 1 },
        { status: 'expired' },
      );
    });

    it('期限切れでないカートは処理しないこと', async () => {
      const mockManager = {
        find: jest.fn(),
        increment: jest.fn(),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((cb: any) => cb(mockManager));

      mockManager.find.mockResolvedValue([]);

      await service.releaseExpiredCarts();

      expect(mockManager.increment).not.toHaveBeenCalled();
      expect(mockManager.update).not.toHaveBeenCalled();
    });
  });
});
