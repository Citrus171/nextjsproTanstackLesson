export class StoreSettingsResponseDto {
  id: number;
  invoiceNumber: string | null;
  shippingFixedFee: number;
  shippingFreeThreshold: number;
  updatedAt: Date;
}
