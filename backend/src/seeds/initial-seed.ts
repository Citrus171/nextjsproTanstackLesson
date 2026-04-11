import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { StoreSettingsEntity } from '../store-settings/entities/store-settings.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AdminUserEntity } from '../admin-users/entities/admin-user.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  // StoreSettings
  const settingsRepo = AppDataSource.getRepository(StoreSettingsEntity);
  const settingsExists = await settingsRepo.count();
  if (settingsExists === 0) {
    await settingsRepo.save({
      invoiceNumber: null,
      shippingFixedFee: 800,
      shippingFreeThreshold: 5000,
    });
    console.log('✓ store_settings の初期データを投入しました');
  } else {
    console.log('- store_settings は既に存在します');
  }

  // Users（会員）
  const userRepo = AppDataSource.getRepository(UserEntity);
  const testUserExists = await userRepo.findOneBy({ email: 'test@example.com' });
  if (!testUserExists) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await userRepo.save({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'テストユーザー',
      address: null,
    });
    console.log('✓ テスト会員ユーザーを作成しました (test@example.com)');
  } else {
    console.log('- テスト会員ユーザーは既に存在します');
  }

  // AdminUsers（管理者）
  const adminRepo = AppDataSource.getRepository(AdminUserEntity);
  const adminUserExists = await adminRepo.findOneBy({ email: 'admin@example.com' });
  if (!adminUserExists) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await adminRepo.save({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'スーパー管理者',
      role: 'super',
    });
    console.log('✓ 管理者ユーザーを作成しました (admin@example.com)');
  } else {
    console.log('- 管理者ユーザーは既に存在します');
  }

  console.log('\n=== シードデータの投入が完了しました ===');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('エラーが発生しました:', e);
  process.exit(1);
});
