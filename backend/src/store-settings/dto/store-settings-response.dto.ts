import { ApiProperty } from '@nestjs/swagger';

export class StoreSettingsResponseDto {
  @ApiProperty({ description: '設定ID' })
  id: number;

  @ApiProperty({ description: 'インボイスT番号', nullable: true })
  invoiceNumber: string | null;

  @ApiProperty({ description: '配送料（1円以上）', example: 800 })
  shippingFixedFee: number;

  @ApiProperty({
    description: '送料無料となる購入金額の閾値',
    example: 5000,
  })
  shippingFreeThreshold: number;

  @ApiProperty({ description: '最終更新日時' })
  updatedAt: Date;
}
