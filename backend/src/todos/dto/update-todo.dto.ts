import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 1, description: '優先度 1-3' })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  priority?: number;
}
