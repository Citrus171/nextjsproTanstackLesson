import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { StoreSettingsEntity } from './store-settings.entity';

describe('StoreSettingsEntity', () => {
  const storage = getMetadataArgsStorage();
  const getColumns = () =>
    storage.columns.filter((c) => c.target === StoreSettingsEntity);

  it('テーブル名がstore_settingsであること', () => {
    const entity = storage.tables.find(
      (t) => t.target === StoreSettingsEntity,
    );
    expect(entity?.name).toBe('store_settings');
  });

  it('invoiceNumberカラムがnullableで存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'invoiceNumber');
    expect(col).toBeDefined();
    expect((col?.options as { nullable?: boolean })?.nullable).toBe(true);
  });

  it('shippingFixedFeeカラムがINT型で存在すること', () => {
    const col = getColumns().find((c) => c.propertyName === 'shippingFixedFee');
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });

  it('shippingFreeThresholdカラムがINT型で存在すること', () => {
    const col = getColumns().find(
      (c) => c.propertyName === 'shippingFreeThreshold',
    );
    expect(col).toBeDefined();
    expect((col?.options as { type?: string })?.type).toBe('int');
  });
});
