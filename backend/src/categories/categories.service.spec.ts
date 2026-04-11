import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

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

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  let mockDataSource: { query: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      create: jest.fn((dto) => Object.assign(new CategoryEntity(), dto)),
      delete: jest.fn(),
    };

    mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
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

      (mockRepo.find as jest.Mock).mockResolvedValue([parent, child]);

      const result = await service.findAll();

      expect(result).toEqual([parent, child]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        relations: ['parent', 'children'],
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('create', () => {
    it('parentId が指定される場合、親カテゴリが存在することを確認すること', async () => {
      const dto: CreateCategoryDto = {
        name: '子カテゴリ',
        parentId: 999,
      };

      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('親が存在する場合はカテゴリを作成すること', async () => {
      const parentEntity = makeCategoryEntity({
        id: 1,
        name: '衣類',
      });
      const newCategory = makeCategoryEntity({
        id: 2,
        name: '子カテゴリ',
        parentId: 1,
        parent: parentEntity,
      });

      const dto: CreateCategoryDto = {
        name: '子カテゴリ',
        parentId: 1,
      };

      (mockRepo.findOne as jest.Mock).mockResolvedValue(parentEntity);
      (mockRepo.save as jest.Mock).mockResolvedValue(newCategory);

      const result = await service.create(dto);

      expect(result).toEqual(newCategory);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '子カテゴリ',
          parentId: 1,
        }),
      );
    });

    it('parentId が指定されない場合は親カテゴリなしで作成すること', async () => {
      const newCategory = makeCategoryEntity({
        id: 1,
        name: '親カテゴリ',
        parentId: null,
      });

      const dto: CreateCategoryDto = {
        name: '親カテゴリ',
      };

      (mockRepo.save as jest.Mock).mockResolvedValue(newCategory);

      const result = await service.create(dto);

      expect(result).toEqual(newCategory);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '親カテゴリ',
          parentId: undefined,
        }),
      );
    });
  });

  describe('findById', () => {
    it('存在するカテゴリを返すこと', async () => {
      const category = makeCategoryEntity({ id: 1, name: '衣類' });
      (mockRepo.findOne as jest.Mock).mockResolvedValue(category);

      const result = await service.findById(1);

      expect(result).toEqual(category);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('存在しないカテゴリは null を返すこと', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('存在するカテゴリを更新できること', async () => {
      const original = makeCategoryEntity({ id: 1, name: '衣類' });
      const updated = makeCategoryEntity({ id: 1, name: '新しい衣類' });

      (mockRepo.findOne as jest.Mock).mockResolvedValue(original);
      (mockRepo.save as jest.Mock).mockResolvedValue(updated);

      const dto: Partial<CreateCategoryDto> = { name: '新しい衣類' };
      const result = await service.update(1, dto);

      expect(result).toEqual(updated);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: '新しい衣類' }),
      );
    });

    it('存在しないカテゴリは null を返すこと', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);

      const dto: Partial<CreateCategoryDto> = { name: '新しい衣類' };
      const result = await service.update(999, dto);

      expect(result).toBeNull();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('更新時に親カテゴリが存在することを確認すること', async () => {
      const original = makeCategoryEntity({ id: 1, name: '衣類' });

      (mockRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(original) // 自身の取得
        .mockResolvedValueOnce(null); // 親の取得

      const dto: Partial<CreateCategoryDto> = { parentId: 999 };

      await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('商品が紐付いている場合は ConflictException をスローすること', async () => {
      mockDataSource.query.mockResolvedValue([{ count: 1 }]);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
        [1],
      );
    });

    it('商品がない場合は削除できること', async () => {
      mockDataSource.query.mockResolvedValue([{ count: 0 }]);
      (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
