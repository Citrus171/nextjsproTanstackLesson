import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettingsEntity } from './entities/store-settings.entity';

describe('StoreSettingsService', () => {
  let service: StoreSettingsService;
  let mockRepository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
  };

  const mockStoreSettings: StoreSettingsEntity = {
    id: 1,
    invoiceNumber: 'T1234567890123',
    shippingFixedFee: 800,
    shippingFreeThreshold: 5000,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreSettingsService,
        {
          provide: getRepositoryToken(StoreSettingsEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StoreSettingsService>(StoreSettingsService);
  });

  describe('getSettings', () => {
    it('店舗設定が存在するとき、その設定を返す', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);

      const result = await service.getSettings();

      expect(result).toEqual(mockStoreSettings);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('店舗設定が存在しないとき、エラーを投げる', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getSettings()).rejects.toThrow(
        'Store settings not found',
      );
    });
  });

  describe('updateSettings', () => {
    it('invoiceNumberを更新できる', async () => {
      const updateDto = { invoiceNumber: 'T9876543210987' };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.invoiceNumber).toBe('T9876543210987');
    });

    it('invoiceNumberをnullに更新できる', async () => {
      const updateDto = { invoiceNumber: null };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.invoiceNumber).toBeNull();
    });

    it('shippingFixedFeeを更新できる', async () => {
      const updateDto = { shippingFixedFee: 1000 };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.shippingFixedFee).toBe(1000);
    });

    it('shippingFreeThresholdを更新できる', async () => {
      const updateDto = { shippingFreeThreshold: 10000 };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.shippingFreeThreshold).toBe(10000);
    });

    it('shippingFixedFeeが0以下の場合エラーを投げる', async () => {
      const updateDto = { shippingFixedFee: 0 };

      await expect(service.updateSettings(updateDto)).rejects.toThrow();
    });

    it('shippingFixedFeeが負数の場合エラーを投げる', async () => {
      const updateDto = { shippingFixedFee: -100 };

      await expect(service.updateSettings(updateDto)).rejects.toThrow();
    });

    it('shippingFreeThresholdが0以下の場合エラーを投げる', async () => {
      const updateDto = { shippingFreeThreshold: 0 };

      await expect(service.updateSettings(updateDto)).rejects.toThrow();
    });

    it('shippingFreeThresholdが負数の場合エラーを投げる', async () => {
      const updateDto = { shippingFreeThreshold: -100 };

      await expect(service.updateSettings(updateDto)).rejects.toThrow();
    });

    it('複数フィールドを同時に更新できる', async () => {
      const updateDto = {
        invoiceNumber: 'T1111111111111',
        shippingFixedFee: 1200,
        shippingFreeThreshold: 7000,
      };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.invoiceNumber).toBe('T1111111111111');
      expect(result.shippingFixedFee).toBe(1200);
      expect(result.shippingFreeThreshold).toBe(7000);
    });

    it('大きな数値（超大値）も受け入れる', async () => {
      const updateDto = { shippingFixedFee: 999999 };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.shippingFixedFee).toBe(999999);
    });

    it('1円の設定も受け入れる（境界値）', async () => {
      const updateDto = { shippingFixedFee: 1 };
      const updated = { ...mockStoreSettings, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(mockStoreSettings);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(updateDto);

      expect(result.shippingFixedFee).toBe(1);
    });
  });
});
