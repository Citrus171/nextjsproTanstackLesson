import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

@Injectable()
export class TodosService {
  private todos: Todo[] = [
    { id: 1, title: 'NestJSを学ぶ', description: 'Swaggerの設定から始める', completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'TanStack Queryを使う', description: 'useQueryとuseMutationを理解する', completed: false, createdAt: new Date().toISOString() },
  ];
  private nextId = 3;

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: number): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new NotFoundException(`Todo #${id} が見つかりません`);
    return todo;
  }

  create(dto: CreateTodoDto): Todo {
    const todo: Todo = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.todos.push(todo);
    return todo;
  }

  update(id: number, dto: UpdateTodoDto): Todo {
    const todo = this.findOne(id);
    Object.assign(todo, dto);
    return todo;
  }

  remove(id: number): void {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException(`Todo #${id} が見つかりません`);
    this.todos.splice(index, 1);
  }
}
