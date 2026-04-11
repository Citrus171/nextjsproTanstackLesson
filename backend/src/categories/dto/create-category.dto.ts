import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: '衣類',
    description: 'カテゴリ名',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: 1,
    description: '親カテゴリのID',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
