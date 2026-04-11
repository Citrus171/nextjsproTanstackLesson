import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: any;

  beforeEach(async () => {
    mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addVariation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('create', () => {
    it('POST /admin/products で商品を作成できること', async () => {
      // Arrange
      const createProductDto = {
        name: 'テスト商品',
        description: 'テスト説明',
        price: 1000,
        categoryId: null,
      };

      const createdProduct = {
        id: 1,
        ...createProductDto,
        isPublished: false,
        images: [],
        variations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockProductsService.create.mockResolvedValue(createdProduct);

      // Act
      const result = await controller.create(createProductDto);

      // Assert
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result.id).toBe(1);
      expect(result.name).toBe('テスト商品');
    });
  });

  describe('findAll', () => {
    it('GET /admin/products で全商品を取得できること', async () => {
      // Arrange
      const products = [
        {
          id: 1,
          name: 'テスト商品1',
          description: 'テスト説明1',
          price: 1000,
          categoryId: null,
          isPublished: false,
          images: [],
          variations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockProductsService.findAll.mockResolvedValue({
        data: products,
        total: 1,
      });

      // Act
      const result = await controller.findAll(1, 10);

      // Assert
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('GET /admin/products/:id で商品を取得できること', async () => {
      // Arrange
      const product = {
        id: 1,
        name: 'テスト商品',
        description: 'テスト説明',
        price: 1000,
        categoryId: null,
        isPublished: false,
        images: [],
        variations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockProductsService.findById.mockResolvedValue(product);

      // Act
      const result = await controller.findById(1);

      // Assert
      expect(mockProductsService.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('テスト商品');
    });
  });

  describe('update', () => {
    it('PUT /admin/products/:id で商品を更新できること', async () => {
      // Arrange
      const updateProductDto = {
        name: '更新された商品',
        price: 2000,
      };

      const updatedProduct = {
        id: 1,
        name: '更新された商品',
        description: 'テスト説明',
        price: 2000,
        categoryId: null,
        isPublished: false,
        images: [],
        variations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await controller.update(1, updateProductDto);

      // Assert
      expect(mockProductsService.update).toHaveBeenCalledWith(1, updateProductDto);
      expect(result.name).toBe('更新された商品');
    });
  });

  describe('delete', () => {
    it('DELETE /admin/products/:id で商品を削除できること', async () => {
      // Arrange
      mockProductsService.delete.mockResolvedValue(undefined);

      // Act
      await controller.delete(1);

      // Assert
      expect(mockProductsService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('addVariation', () => {
    it('POST /admin/products/:id/variations でバリエーションを追加できること', async () => {
      // Arrange
      const addVariationDto = {
        size: 'M',
        color: '黒',
        price: 1500,
        stock: 10,
        imageUrl: null,
      };

      const createdVariation = {
        id: 1,
        productId: 1,
        ...addVariationDto,
        deletedAt: null,
      };

      mockProductsService.addVariation.mockResolvedValue(createdVariation);

      // Act
      const result = await controller.addVariation(1, addVariationDto);

      // Assert
      expect(mockProductsService.addVariation).toHaveBeenCalledWith(1, addVariationDto);
      expect(result.id).toBe(1);
      expect(result.size).toBe('M');
    });
  });
});
