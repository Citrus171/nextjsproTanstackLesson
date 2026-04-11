import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsInt } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: '衣類',
    description: 'カテゴリ名',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: 1,
    description: '親カテゴリのID',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
