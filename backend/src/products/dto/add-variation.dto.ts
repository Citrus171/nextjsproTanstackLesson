import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class AddVariationDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsInt()
  @Min(100)
  @Max(999999999)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
