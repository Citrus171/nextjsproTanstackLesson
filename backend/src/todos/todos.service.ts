import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  findAll(): Promise<TodoEntity[]> {
    return this.todoRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<TodoEntity> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) throw new NotFoundException(`Todo #${id} が見つかりません`);
    return todo;
  }

  create(dto: CreateTodoDto): Promise<TodoEntity> {
    const todo = this.todoRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      completed: false,
    });
    return this.todoRepository.save(todo);
  }

  async update(id: number, dto: UpdateTodoDto): Promise<TodoEntity> {
    const todo = await this.findOne(id);
    Object.assign(todo, dto);
    return this.todoRepository.save(todo);
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepository.remove(todo);
  }
}
