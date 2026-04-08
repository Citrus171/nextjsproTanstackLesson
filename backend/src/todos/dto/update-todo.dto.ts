import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'タイトル更新', description: 'Todoのタイトル' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: '詳細更新', description: '詳細説明' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: '完了フラグ' })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
