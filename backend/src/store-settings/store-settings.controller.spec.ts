import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StoreSettingsController } from './store-settings.controller';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

const makeStoreSettings = (
  overrides: Record<string, unknown> = {},
): StoreSettingsResponseDto => ({
  id: 1,
  invoiceNumber: 'T1234567890123',
  shippingFixedFee: 800,
  shippingFreeThreshold: 5000,
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('StoreSettingsController', () => {
  let controller: StoreSettingsController;
  let service: jest.Mocked<StoreSettingsService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<
      Pick<StoreSettingsService, 'getSettings' | 'updateSettings'>
    > = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreSettingsController],
      providers: [{ provide: StoreSettingsService, useValue: mockService }],
    }).compile();

    controller = module.get<StoreSettingsController>(
      StoreSettingsController,
    );
    service = module.get(StoreSettingsService) as jest.Mocked<
      StoreSettingsService
    >;
  });

  describe('getSettings', () => {
    it('店舗設定を返す', async () => {
      const settings = makeStoreSettings();
      service.getSettings.mockResolvedValue(settings);

      const result = await controller.getSettings();

      expect(service.getSettings).toHaveBeenCalled();
      expect(result).toEqual(settings);
    });

    it('invoiceNumberがnullの場合も返す', async () => {
      const settings = makeStoreSettings({ invoiceNumber: null });
      service.getSettings.mockResolvedValue(settings);

      const result = await controller.getSettings();

      expect(result.invoiceNumber).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('invoiceNumberを更新できる', async () => {
      const dto = { invoiceNumber: 'T9876543210987' };
      const updated = makeStoreSettings(dto);
      service.updateSettings.mockResolvedValue(updated);

      const result = await controller.updateSettings(dto);

      expect(service.updateSettings).toHaveBeenCalledWith(dto);
      expect(result.invoiceNumber).toBe('T9876543210987');
    });

    it('shippingFixedFeeを更新できる', async () => {
      const dto = { shippingFixedFee: 1000 };
      const updated = makeStoreSettings(dto);
      service.updateSettings.mockResolvedValue(updated);

      const result = await controller.updateSettings(dto);

      expect(service.updateSettings).toHaveBeenCalledWith(dto);
      expect(result.shippingFixedFee).toBe(1000);
    });

    it('shippingFreeThresholdを更新できる', async () => {
      const dto = { shippingFreeThreshold: 10000 };
      const updated = makeStoreSettings(dto);
      service.updateSettings.mockResolvedValue(updated);

      const result = await controller.updateSettings(dto);

      expect(service.updateSettings).toHaveBeenCalledWith(dto);
      expect(result.shippingFreeThreshold).toBe(10000);
    });

    it('バリデーション失敗時、サービスがエラーを投げる', async () => {
      const dto = { shippingFixedFee: 0 };
      service.updateSettings.mockRejectedValue(
        new BadRequestException('配送料は1円以上である必要があります'),
      );

      await expect(controller.updateSettings(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('複数フィールドを同時に更新できる', async () => {
      const dto = {
        invoiceNumber: 'T1111111111111',
        shippingFixedFee: 1200,
        shippingFreeThreshold: 7000,
      };
      const updated = makeStoreSettings(dto);
      service.updateSettings.mockResolvedValue(updated);

      const result = await controller.updateSettings(dto);

      expect(service.updateSettings).toHaveBeenCalledWith(dto);
      expect(result).toEqual(updated);
    });
  });
});
