import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosModule } from './todos/todos.module';
import { TodoEntity } from './todos/entities/todo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'todo.db',
      entities: [TodoEntity],
      synchronize: true,
    }),
    TodosModule,
  ],
})
export class AppModule {}
