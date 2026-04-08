import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'NestJSを学ぶ', description: 'Todoのタイトル' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Swaggerの設定から始める', description: '詳細説明' })
  @IsString()
  @IsOptional()
  description?: string;
}
