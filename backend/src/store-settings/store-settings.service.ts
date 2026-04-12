import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSettingsEntity } from './entities/store-settings.entity';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

@Injectable()
export class StoreSettingsService {
  constructor(
    @InjectRepository(StoreSettingsEntity)
    private readonly repository: Repository<StoreSettingsEntity>,
  ) {}

  async getSettings(): Promise<StoreSettingsEntity> {
    const settings = await this.repository.findOneBy({ id: 1 });
    if (!settings) {
      throw new Error('Store settings not found');
    }
    return settings;
  }

  async updateSettings(
    dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettingsEntity> {
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

    // 既存の設定を取得
    const existing = await this.repository.findOneBy({ id: 1 });

    // 更新対象を作成
    const toUpdate = Object.assign(existing || new StoreSettingsEntity(), dto);

    return this.repository.save(toUpdate);
  }
}
