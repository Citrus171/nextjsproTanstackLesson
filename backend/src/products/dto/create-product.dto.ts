import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(100)
  @Max(999999999)
  price: number;

  @IsOptional()
  @IsInt()
  categoryId?: number | null;
}
