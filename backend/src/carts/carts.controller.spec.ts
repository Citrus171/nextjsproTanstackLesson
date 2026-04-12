import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartsController', () => {
  let controller: CartsController;
  let mockCartsService: any;

  beforeEach(async () => {
    mockCartsService = {
      getCart: jest.fn(),
      addToCart: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: CartsService,
          useValue: mockCartsService,
        },
      ],
    }).compile();

    controller = module.get<CartsController>(CartsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('getCartがCartsServiceのgetCartメソッドを呼ぶこと', async () => {
      const userId = 1;
      const mockCarts = [
        {
          id: 1,
          sessionId: '1',
          quantity: 2,
        },
      ];

      mockCartsService.getCart.mockResolvedValue(mockCarts);

      const result = await controller.getCart({ user: { id: userId } } as any);

      expect(mockCartsService.getCart).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCarts);
    });
  });

  describe('addToCart', () => {
    it('addToCartがCartsServiceのaddToCartメソッドを呼ぶこと', async () => {
      const userId = 1;
      const dto: AddToCartDto = {
        variationId: 100,
        quantity: 2,
      };
      const mockCart = {
        id: 1,
        sessionId: '1',
        variationId: 100,
        quantity: 2,
      };

      mockCartsService.addToCart.mockResolvedValue(mockCart);

      const result = await controller.addToCart({ user: { id: userId } } as any, dto);

      expect(mockCartsService.addToCart).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(mockCart);
    });
  });

  describe('updateItem', () => {
    it('updateItemがCartsServiceのupdateItemメソッドを呼ぶこと', async () => {
      const userId = 1;
      const cartId = 1;
      const dto: UpdateCartItemDto = {
        quantity: 5,
      };

      mockCartsService.updateItem.mockResolvedValue(undefined);

      await controller.updateItem({ user: { id: userId } } as any, cartId, dto);

      expect(mockCartsService.updateItem).toHaveBeenCalledWith(userId, cartId, dto);
    });
  });

  describe('removeItem', () => {
    it('removeItemがCartsServiceのremoveItemメソッドを呼ぶこと', async () => {
      const userId = 1;
      const cartId = 1;

      mockCartsService.removeItem.mockResolvedValue(undefined);

      await controller.removeItem({ user: { id: userId } } as any, cartId);

      expect(mockCartsService.removeItem).toHaveBeenCalledWith(userId, cartId);
    });
  });
});
