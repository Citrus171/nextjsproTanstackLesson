import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './entities/todo.entity';
import { TodosService } from './todos.service';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({ summary: 'Todo一覧取得' })
  @ApiResponse({ status: 200, description: 'Todo一覧', type: [TodoEntity] })
  findAll(): Promise<TodoEntity[]> {
    return this.todosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Todo1件取得' })
  @ApiResponse({ status: 200, description: 'Todo詳細', type: TodoEntity })
  @ApiResponse({ status: 404, description: '見つからない' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TodoEntity> {
    return this.todosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Todo作成' })
  @ApiResponse({ status: 201, description: '作成成功', type: TodoEntity })
  create(@Body() createTodoDto: CreateTodoDto): Promise<TodoEntity> {
    return this.todosService.create(createTodoDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Todo更新' })
  @ApiResponse({ status: 200, description: '更新成功', type: TodoEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TodoEntity> {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Todo削除' })
  @ApiResponse({ status: 204, description: '削除成功' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.todosService.remove(id);
  }
}
