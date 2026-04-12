import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateStoreSettingsDto {
  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1, { message: '配送料は1円以上である必要があります' })
  shippingFixedFee?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: '無料配送閾値は1円以上である必要があります' })
  shippingFreeThreshold?: number;
}
