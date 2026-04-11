import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { ProductVariationEntity } from './entities/product-variation.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepository: any;
  let mockVariationRepository: any;
  let mockImageRepository: any;
  let mockCategoryRepository: any;

  beforeEach(async () => {
    mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockVariationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockImageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      delete: jest.fn(),
    };

    mockCategoryRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductVariationEntity),
          useValue: mockVariationRepository,
        },
        {
          provide: getRepositoryToken(ProductImageEntity),
          useValue: mockImageRepository,
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    it('基本情報でプロダクトを作成できること', async () => {
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

      mockProductRepository.create.mockReturnValue(createdProduct);
      mockProductRepository.save.mockResolvedValue(createdProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'テスト商品',
          description: 'テスト説明',
          price: 1000,
          categoryId: null,
        }),
      );
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(result.name).toBe('テスト商品');
      expect(result.isPublished).toBe(false);
    });

    it('categoryIdが指定されたとき、カテゴリが存在すること', async () => {
      // Arrange
      const createProductDto = {
        name: 'テスト商品',
        description: 'テスト説明',
        price: 1000,
        categoryId: 1,
      };

      const category = {
        id: 1,
        name: 'テストカテゴリ',
        parentId: null,
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

      mockCategoryRepository.findOneBy.mockResolvedValue(category);
      mockProductRepository.create.mockReturnValue(createdProduct);
      mockProductRepository.save.mockResolvedValue(createdProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result.categoryId).toBe(1);
    });

    it('categoryIdが存在しない場合、NotFoundException を throw すること', async () => {
      // Arrange
      const createProductDto = {
        name: 'テスト商品',
        description: 'テスト説明',
        price: 1000,
        categoryId: 999,
      };

      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('nameが空の場合、BadRequestException を throw すること', async () => {
      // Arrange
      const createProductDto = {
        name: '',
        description: 'テスト説明',
        price: 1000,
        categoryId: null,
      };

      // Act & Assert
      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('priceが100未満の場合、BadRequestException を throw すること', async () => {
      // Arrange
      const createProductDto = {
        name: 'テスト商品',
        description: 'テスト説明',
        price: 50,
        categoryId: null,
      };

      // Act & Assert
      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('IDで商品を取得できること', async () => {
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

      mockProductRepository.findOne.mockResolvedValue(product);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['images', 'variations', 'category'],
      });
      expect(result.id).toBe(1);
      expect(result.name).toBe('テスト商品');
    });

    it('IDが見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('全商品を取得できること', async () => {
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
        {
          id: 2,
          name: 'テスト商品2',
          description: 'テスト説明2',
          price: 2000,
          categoryId: null,
          isPublished: true,
          images: [],
          variations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockProductRepository.find.mockResolvedValue(products);
      mockProductRepository.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        relations: ['images', 'variations', 'category'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('update', () => {
    it('商品情報を更新できること', async () => {
      // Arrange
      const productId = 1;
      const updateProductDto = {
        name: '更新された商品',
        description: '更新された説明',
        price: 2000,
        categoryId: null,
      };

      const existingProduct = {
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

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(productId, updateProductDto);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: productId,
          name: '更新された商品',
          price: 2000,
        }),
      );
      expect(result.name).toBe('更新された商品');
      expect(result.price).toBe(2000);
    });

    it('更新するカテゴリが存在しない場合、NotFoundException を throw すること', async () => {
      // Arrange
      const productId = 1;
      const updateProductDto = {
        name: '更新された商品',
        description: '更新された説明',
        price: 2000,
        categoryId: 999,
      };

      const existingProduct = {
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

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(productId, updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('更新対象の商品が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(999, {
          name: '更新',
          price: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('商品を論理削除できること', async () => {
      // Arrange
      const productId = 1;
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

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.delete(productId);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockProductRepository.softDelete).toHaveBeenCalledWith(productId);
    });

    it('削除対象の商品が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addVariation', () => {
    it('バリエーションを商品に追加できること', async () => {
      // Arrange
      const productId = 1;
      const addVariationDto = {
        size: 'M',
        color: '黒',
        price: 1500,
        stock: 10,
        imageUrl: null,
      };

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

      const createdVariation = {
        id: 1,
        productId,
        ...addVariationDto,
        deletedAt: null,
      };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockVariationRepository.create.mockReturnValue(createdVariation);
      mockVariationRepository.save.mockResolvedValue(createdVariation);

      // Act
      const result = await service.addVariation(productId, addVariationDto);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockVariationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId,
          size: 'M',
          color: '黒',
          price: 1500,
          stock: 10,
        }),
      );
      expect(mockVariationRepository.save).toHaveBeenCalled();
      expect(result.size).toBe('M');
      expect(result.color).toBe('黒');
      expect(result.price).toBe(1500);
      expect(result.stock).toBe(10);
    });

    it('バリエーション追加時にsizeが空の場合、BadRequestException を throw すること', async () => {
      // Arrange
      const productId = 1;
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

      const addVariationDto = {
        size: '',
        color: '黒',
        price: 1500,
        stock: 10,
        imageUrl: null,
      };

      mockProductRepository.findOne.mockResolvedValue(product);

      // Act & Assert
      await expect(
        service.addVariation(productId, addVariationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('バリエーション追加時にpriceが100未満の場合、BadRequestException を throw すること', async () => {
      // Arrange
      const productId = 1;
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

      const addVariationDto = {
        size: 'M',
        color: '黒',
        price: 50,
        stock: 10,
        imageUrl: null,
      };

      mockProductRepository.findOne.mockResolvedValue(product);

      // Act & Assert
      await expect(
        service.addVariation(productId, addVariationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateVariation', () => {
    it('バリエーションを更新できること', async () => {
      // Arrange
      const variationId = 1;
      const updateVariationDto = {
        size: 'L',
        color: '白',
        price: 2000,
        stock: 20,
      };

      const existingVariation = {
        id: 1,
        productId: 1,
        size: 'M',
        color: '黒',
        price: 1500,
        stock: 10,
        imageUrl: null,
        deletedAt: null,
      };

      const updatedVariation = {
        ...existingVariation,
        ...updateVariationDto,
      };

      mockVariationRepository.findOne.mockResolvedValue(existingVariation);
      mockVariationRepository.save.mockResolvedValue(updatedVariation);

      // Act
      const result = await service.updateVariation(variationId, updateVariationDto);

      // Assert
      expect(mockVariationRepository.findOne).toHaveBeenCalledWith({
        where: { id: variationId },
      });
      expect(mockVariationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: variationId,
          size: 'L',
          price: 2000,
        }),
      );
      expect(result.size).toBe('L');
      expect(result.price).toBe(2000);
    });

    it('更新対象のバリエーションが見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockVariationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateVariation(999, {
          size: 'L',
          price: 2000,
          stock: 20,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVariation', () => {
    it('バリエーションを削除できること', async () => {
      // Arrange
      const variationId = 1;
      const variation = {
        id: 1,
        productId: 1,
        size: 'M',
        color: '黒',
        price: 1500,
        stock: 10,
        imageUrl: null,
        deletedAt: null,
      };

      mockVariationRepository.findOne.mockResolvedValue(variation);
      mockVariationRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.deleteVariation(variationId);

      // Assert
      expect(mockVariationRepository.findOne).toHaveBeenCalledWith({
        where: { id: variationId },
      });
      expect(mockVariationRepository.softDelete).toHaveBeenCalledWith(variationId);
    });

    it('削除対象のバリエーションが見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockVariationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteVariation(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('商品を公開できること', async () => {
      // Arrange
      const productId = 1;
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

      const publishedProduct = {
        ...product,
        isPublished: true,
      };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue(publishedProduct);

      // Act
      const result = await service.publish(productId);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: productId,
          isPublished: true,
        }),
      );
      expect(result.isPublished).toBe(true);
    });

    it('公開対象の商品が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.publish(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unpublish', () => {
    it('商品を非公開にできること', async () => {
      // Arrange
      const productId = 1;
      const product = {
        id: 1,
        name: 'テスト商品',
        description: 'テスト説明',
        price: 1000,
        categoryId: null,
        isPublished: true,
        images: [],
        variations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const unpublishedProduct = {
        ...product,
        isPublished: false,
      };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue(unpublishedProduct);

      // Act
      const result = await service.unpublish(productId);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: productId,
          isPublished: false,
        }),
      );
      expect(result.isPublished).toBe(false);
    });

    it('非公開対象の商品が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unpublish(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addImage', () => {
    it('商品に画像を追加できること', async () => {
      // Arrange
      const productId = 1;
      const addImageDto = {
        url: 'http://localhost:3000/uploads/image1.jpg',
        sortOrder: 0,
      };

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

      const createdImage = {
        id: 1,
        productId,
        ...addImageDto,
      };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockImageRepository.create.mockReturnValue(createdImage);
      mockImageRepository.save.mockResolvedValue(createdImage);

      // Act
      const result = await service.addImage(productId, addImageDto);

      // Assert
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['images', 'variations', 'category'],
      });
      expect(mockImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId,
          url: 'http://localhost:3000/uploads/image1.jpg',
          sortOrder: 0,
        }),
      );
      expect(mockImageRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(result.url).toBe('http://localhost:3000/uploads/image1.jpg');
    });

    it('追加対象の商品が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockProductRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.addImage(999, {
          url: 'http://localhost:3000/uploads/image1.jpg',
          sortOrder: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteImage', () => {
    it('画像を削除できること', async () => {
      // Arrange
      const imageId = 1;
      const image = {
        id: 1,
        productId: 1,
        url: 'http://localhost:3000/uploads/image1.jpg',
        sortOrder: 0,
      };

      mockImageRepository.findOne.mockResolvedValue(image);
      mockImageRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.deleteImage(imageId);

      // Assert
      expect(mockImageRepository.findOne).toHaveBeenCalledWith({
        where: { id: imageId },
      });
      expect(mockImageRepository.delete).toHaveBeenCalledWith(imageId);
    });

    it('削除対象の画像が見つからない場合、NotFoundException を throw すること', async () => {
      // Arrange
      mockImageRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteImage(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdPublished', () => {
    it('公開商品を返すこと', async () => {
      const product = {
        id: 1,
        name: 'Public Product',
        price: 1000,
        isPublished: true,
        images: [],
        variations: [],
        category: null,
      };

      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findByIdPublished(1);

      expect(result).toEqual(product);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isPublished: true },
        relations: ['images', 'variations', 'category'],
      });
    });

    it('非公開商品は404を返すこと', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdPublished(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPublished', () => {
    it('公開商品一覧を返すこと', async () => {
      const products = [
        { id: 1, name: 'Product 1', price: 1000, isPublished: true },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(products),
        getCount: jest.fn().mockResolvedValue(1),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.findAllPublished({ page: 1, limit: 10 });

      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
    });

    it('カテゴリフィルターが機能すること', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAllPublished({ page: 1, limit: 10, categoryId: 5 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.categoryId = :categoryId',
        { categoryId: 5 },
      );
    });

    it('キーワード検索が機能すること', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAllPublished({ page: 1, limit: 10, keyword: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(product.name LIKE :keyword OR product.description LIKE :keyword)',
        { keyword: '%test%' },
      );
    });

    it('ソート（price_asc）が機能すること', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAllPublished({ page: 1, limit: 10, sort: 'price_asc' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.price', 'ASC');
    });

    it('ソート（price_desc）が機能すること', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAllPublished({ page: 1, limit: 10, sort: 'price_desc' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.price', 'DESC');
    });

    it('ページネーションが機能すること', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(100),
      };

      mockProductRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAllPublished({ page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('branches カバレッジ改善', () => {
    it('updateで nameが長すぎる場合はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.update(1, { name: 'a'.repeat(101) })).rejects.toThrow(BadRequestException);
    });

    it('updateで priceが最大値超過はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.update(1, { price: 1000000000 })).rejects.toThrow(BadRequestException);
    });

    it('addVariationで stockが負数はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.addVariation(1, { size: 'M', color: '黒', price: 1500, stock: -1 })).rejects.toThrow(BadRequestException);
    });

    it('addVariationで priceが最大値超過はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.addVariation(1, { size: 'M', color: '黒', price: 1000000000, stock: 10 })).rejects.toThrow(BadRequestException);
    });

    it('updateVariationで priceが最小値未満はエラー', async () => {
      const variation = { id: 1, productId: 1, size: 'M', color: '黒', price: 1500, stock: 10, imageUrl: null, deletedAt: null };
      mockVariationRepository.findOne.mockResolvedValue(variation);
      await expect(service.updateVariation(1, { price: 50 })).rejects.toThrow(BadRequestException);
    });

    it('updateVariationで sizeが長すぎるはエラー', async () => {
      const variation = { id: 1, productId: 1, size: 'M', color: '黒', price: 1500, stock: 10, imageUrl: null, deletedAt: null };
      mockVariationRepository.findOne.mockResolvedValue(variation);
      await expect(service.updateVariation(1, { size: 'a'.repeat(51) })).rejects.toThrow(BadRequestException);
    });

    it('addVariationで colorが空はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.addVariation(1, { size: 'M', color: '', price: 1500, stock: 10 })).rejects.toThrow(BadRequestException);
    });

    it('addVariationで sizeが空はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.addVariation(1, { size: '', color: '黒', price: 1500, stock: 10 })).rejects.toThrow(BadRequestException);
    });

    it('addImageで urlが空はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.addImage(1, { url: '', sortOrder: 0 })).rejects.toThrow(BadRequestException);
    });

    it('updateで nameが空の場合はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.update(1, { name: '' })).rejects.toThrow(BadRequestException);
    });

    it('updateで price が最小値未満はエラー', async () => {
      const product = { id: 1, name: 'a', price: 1000, categoryId: null, isPublished: false, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockProductRepository.findOne.mockResolvedValue(product);
      await expect(service.update(1, { price: 50 })).rejects.toThrow(BadRequestException);
    });
  });
});
