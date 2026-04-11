import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

describe('AdminCategoriesController', () => {
  let controller: AdminCategoriesController;
  let service: jest.Mocked<Partial<CategoriesService>>;

  beforeEach(async () => {
    const mockService: jest.Mocked<Partial<CategoriesService>> = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AdminCategoriesController>(AdminCategoriesController);
    service = module.get(CategoriesService) as jest.Mocked<Partial<CategoriesService>>;
  });

  describe('findAll', () => {
    it('全カテゴリを返すこと', async () => {
      const categories = [makeCategoryEntity({ id: 1, name: '衣類' })];
      (service.findAll as jest.Mock).mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          name: '衣類',
        }),
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('新規カテゴリを作成すること', async () => {
      const dto: CreateCategoryDto = { name: '衣類', parentId: null };
      const category = makeCategoryEntity({ id: 1, name: '衣類', parentId: null });

      (service.create as jest.Mock).mockResolvedValue(category);

      const result = await controller.create(dto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: '衣類',
        }),
      );
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('存在するカテゴリを更新すること', async () => {
      const dto: UpdateCategoryDto = { name: '新しい衣類' };
      const updated = makeCategoryEntity({ id: 1, name: '新しい衣類' });

      (service.update as jest.Mock).mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: '新しい衣類',
        }),
      );
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('存在しないカテゴリではNotFoundException をスローすること', async () => {
      const dto: UpdateCategoryDto = { name: '新しい衣類' };

      (service.update as jest.Mock).mockResolvedValue(null);

      await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('カテゴリを削除すること', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
