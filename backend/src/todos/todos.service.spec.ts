import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './entities/todo.entity';
import { TodosService } from './todos.service';

type MockRepository = {
  find: jest.MockedFunction<Repository<TodoEntity>['find']>;
  findOneBy: jest.MockedFunction<Repository<TodoEntity>['findOneBy']>;
  create: jest.MockedFunction<Repository<TodoEntity>['create']>;
  save: jest.MockedFunction<Repository<TodoEntity>['save']>;
  remove: jest.MockedFunction<Repository<TodoEntity>['remove']>;
};

const mockRepository = (): MockRepository => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeTodo = (overrides: Partial<TodoEntity> = {}): TodoEntity =>
  Object.assign(new TodoEntity(), {
    id: 1,
    title: 'テスト',
    description: '詳細',
    completed: false,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });

describe('TodosService', () => {
  let service: TodosService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: getRepositoryToken(TodoEntity), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repo = module.get<MockRepository>(getRepositoryToken(TodoEntity));
  });

  // ── findAll ──────────────────────────────────────────────
  describe('findAll', () => {
    it('全Todoの配列を返す', async () => {
      const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })];
      repo.find.mockResolvedValue(todos);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(result).toEqual(todos);
    });

    it('Todoが0件のとき空配列を返す', async () => {
      repo.find.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findOne ──────────────────────────────────────────────
  describe('findOne', () => {
    it('指定IDのTodoを返す', async () => {
      const todo = makeTodo();
      repo.findOneBy.mockResolvedValue(todo);

      const result = await service.findOne(1);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(todo);
    });

    it('存在しないIDはNotFoundExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Todo #99 が見つかりません');
    });
  });

  // ── create ───────────────────────────────────────────────
  describe('create', () => {
    it('新しいTodoを作成して保存する', async () => {
      const dto = { title: '新Todo', description: '説明' };
      const entity = makeTodo({ title: dto.title, description: dto.description });
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        completed: false,
      });
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('descriptionなしでもTodoを作成できる', async () => {
      const dto = { title: 'タイトルのみ' };
      const entity = makeTodo({ title: dto.title, description: undefined });
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: 'タイトルのみ',
        description: undefined,
        completed: false,
      });
    });
  });

  // ── update ───────────────────────────────────────────────
  describe('update', () => {
    it('既存Todoを更新して返す', async () => {
      const original = makeTodo({ completed: false });
      const updated = makeTodo({ completed: true });
      repo.findOneBy.mockResolvedValue(original);
      repo.save.mockResolvedValue(updated);

      const result = await service.update(1, { completed: true });

      expect(repo.save).toHaveBeenCalled();
      expect(result.completed).toBe(true);
    });

    it('存在しないIDの更新はNotFoundExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.update(99, { title: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ───────────────────────────────────────────────
  describe('remove', () => {
    it('指定IDのTodoを削除する', async () => {
      const todo = makeTodo();
      repo.findOneBy.mockResolvedValue(todo);
      repo.remove.mockResolvedValue(todo);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(todo);
    });

    it('存在しないIDの削除はNotFoundExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
