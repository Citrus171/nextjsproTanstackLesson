import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { StoreSettingsEntity } from '../store-settings/entities/store-settings.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(StoreSettingsEntity);
  const exists = await repo.count();
  if (exists === 0) {
    await repo.save({
      invoiceNumber: null,
      shippingFixedFee: 800,
      shippingFreeThreshold: 5000,
    });
    console.log('store_settings の初期データを投入しました');
  } else {
    console.log('store_settings は既に存在します。スキップします');
  }

  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
