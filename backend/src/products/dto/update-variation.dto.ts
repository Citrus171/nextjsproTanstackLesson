import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { AddVariationDto } from './add-variation.dto';

export class UpdateVariationDto extends PartialType(AddVariationDto) {
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(999999999)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
