import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreSettings } from '@prisma/client';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

@Injectable()
export class StoreSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<StoreSettings> {
    const settings = await this.prisma.storeSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      throw new Error('Store settings not found');
    }
    return settings;
  }

  async updateSettings(
    dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettings> {
    // バリデーション
    if (
      dto.shippingFixedFee !== undefined &&
      dto.shippingFixedFee <= 0
    ) {
      throw new BadRequestException('配送料は1円以上である必要があります');
    }

    if (
      dto.shippingFreeThreshold !== undefined &&
      dto.shippingFreeThreshold <= 0
    ) {
      throw new BadRequestException(
        '無料配送閾値は1円以上である必要があります',
      );
    }

    try {
      return await this.prisma.storeSettings.update({
        where: { id: 1 },
        data: dto,
      });
    } catch {
      // If update fails (record doesn't exist), create it
      return this.prisma.storeSettings.create({
        data: {
          id: 1,
          invoiceNumber: dto.invoiceNumber ?? null,
          shippingFixedFee: dto.shippingFixedFee ?? 0, // Provide defaults for required fields
          shippingFreeThreshold: dto.shippingFreeThreshold ?? 0,
        },
      });
    }
  }
}
