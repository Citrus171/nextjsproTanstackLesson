import { Test, TestingModule } from '@nestjs/testing';
import { PublicProductsController } from './public-products.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';

describe('PublicProductsController', () => {
  let controller: PublicProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAllPublished: jest.fn(),
            findByIdPublished: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PublicProductsController>(PublicProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('公開商品一覧を返すこと', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 1000, isPublished: true, categoryId: 1, category: null, description: null, images: [], variations: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null } as unknown as ProductEntity,
      ];
      const mockResult = { data: mockProducts, total: 1 };

      jest.spyOn(service, 'findAllPublished').mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10);

      expect(result.total).toBe(1);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0]).toHaveProperty('id', 1);
      expect(result.data[0]).toHaveProperty('name', 'Product 1');
      expect(service.findAllPublished).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categoryId: undefined,
        keyword: undefined,
        sort: undefined,
      });
    });

    it('カテゴリフィルターが渡されること', async () => {
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAllPublished').mockResolvedValue(mockResult);

      await controller.findAll(1, 10, 5, undefined, undefined);

      expect(service.findAllPublished).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categoryId: 5,
        keyword: undefined,
        sort: undefined,
      });
    });

    it('キーワード検索が渡されること', async () => {
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAllPublished').mockResolvedValue(mockResult);

      await controller.findAll(1, 10, undefined, 'test keyword', undefined);

      expect(service.findAllPublished).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categoryId: undefined,
        keyword: 'test keyword',
        sort: undefined,
      });
    });

    it('ソートが渡されること', async () => {
      const mockResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAllPublished').mockResolvedValue(mockResult);

      await controller.findAll(1, 10, undefined, undefined, 'price_asc');

      expect(service.findAllPublished).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categoryId: undefined,
        keyword: undefined,
        sort: 'price_asc',
      });
    });
  });

  describe('findById', () => {
    it('商品詳細を返すこと', async () => {
      const mockProduct = {
        id: 1,
        name: 'Product 1',
        description: 'Description',
        price: 1000,
        isPublished: true,
        categoryId: 1,
        category: null,
        variations: [],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as unknown as ProductEntity;

      jest.spyOn(service, 'findByIdPublished').mockResolvedValue(mockProduct);

      const result = await controller.findById(1);

      // @Exclude() で除外されたフィールドが含まれていないことを確認
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Product 1');
      expect(result).toHaveProperty('price', 1000);
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('deletedAt');
      expect(result).not.toHaveProperty('isPublished');
      expect(service.findByIdPublished).toHaveBeenCalledWith(1);
    });

    it('存在しない商品で例外を投げること', async () => {
      const error = new Error('Not found');
      jest.spyOn(service, 'findByIdPublished').mockRejectedValue(error);

      await expect(controller.findById(999)).rejects.toThrow(error);
    });
  });
});
