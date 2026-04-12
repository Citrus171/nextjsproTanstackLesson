import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreSettingsDto {
  @ApiPropertyOptional({ description: 'インボイスT番号', type: String, nullable: true })
  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @ApiPropertyOptional({ description: '配送料（1円以上）', example: 800 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '配送料は1円以上である必要があります' })
  shippingFixedFee?: number;

  @ApiPropertyOptional({
    description: '送料無料となる購入金額の閾値',
    example: 5000,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '無料配送閾値は1円以上である必要があります' })
  shippingFreeThreshold?: number;
}
