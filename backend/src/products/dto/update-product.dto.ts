import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(999999999)
  price?: number;

  @IsOptional()
  @IsInt()
  categoryId?: number | null;
}
