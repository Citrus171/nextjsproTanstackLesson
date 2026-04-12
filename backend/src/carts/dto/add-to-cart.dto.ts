import { IsInt, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @Min(1)
  variationId: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number = 1;
}
