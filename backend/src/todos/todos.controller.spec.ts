import { Test, TestingModule } from '@nestjs/testing';
import { TodoEntity } from './entities/todo.entity';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

const makeTodo = (overrides: Partial<TodoEntity> = {}): TodoEntity =>
  Object.assign(new TodoEntity(), {
    id: 1,
    title: 'テスト',
    description: '詳細',
    completed: false,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });

describe('TodosController', () => {
  let controller: TodosController;
  let service: jest.Mocked<TodosService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<Partial<TodosService>> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get(TodosService);
  });

  describe('findAll', () => {
    it('service.findAll() の結果を返す', async () => {
      const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })];
      service.findAll.mockResolvedValue(todos);

      expect(await controller.findAll()).toEqual(todos);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('service.findOne(id) の結果を返す', async () => {
      const todo = makeTodo();
      service.findOne.mockResolvedValue(todo);

      expect(await controller.findOne(1)).toEqual(todo);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('service.create(dto) の結果を返す', async () => {
      const dto = { title: '新Todo', description: '説明' };
      const created = makeTodo({ title: dto.title });
      service.create.mockResolvedValue(created);

      expect(await controller.create(dto)).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('service.update(id, dto) の結果を返す', async () => {
      const dto = { completed: true };
      const updated = makeTodo({ completed: true });
      service.update.mockResolvedValue(updated);

      expect(await controller.update(1, dto)).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('service.remove(id) を呼び出す', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
