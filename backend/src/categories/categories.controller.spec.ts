import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';

const makeCategoryEntity = (overrides: Partial<CategoryEntity> = {}): CategoryEntity =>
  Object.assign(new CategoryEntity(), {
    id: 1,
    name: 'テストカテゴリ',
    parentId: null,
    parent: null,
    children: [],
    createdAt: new Date(),
    ...overrides,
  });

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<Partial<CategoriesService>>;

  beforeEach(async () => {
    const mockService: jest.Mocked<Partial<CategoriesService>> = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get(CategoriesService) as jest.Mocked<Partial<CategoriesService>>;
  });

  describe('findAll', () => {
    it('全カテゴリを親子構造で返すこと', async () => {
      const parent = makeCategoryEntity({
        id: 1,
        name: '衣類',
        parentId: null,
        parent: null,
      });
      const child = makeCategoryEntity({
        id: 2,
        name: 'Tシャツ',
        parentId: 1,
        parent,
      });
      parent.children = [child];

      (service.findAll as jest.Mock).mockResolvedValue([parent, child]);

      const result = await controller.findAll();

      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          name: '衣類',
          children: expect.arrayContaining([
            expect.objectContaining({
              id: 2,
              name: 'Tシャツ',
            }),
          ]),
        }),
        expect.objectContaining({
          id: 2,
          name: 'Tシャツ',
        }),
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
