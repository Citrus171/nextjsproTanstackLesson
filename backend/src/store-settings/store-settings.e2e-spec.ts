import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AdminUserEntity } from '../admin-users/entities/admin-user.entity';
import { StoreSettingsEntity } from './entities/store-settings.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { StoreSettingsModule } from './store-settings.module';
import { Repository } from 'typeorm';

async function createTestApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.DB_HOST ?? 'localhost',
        port: 3306,
        username: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? 'password',
        database: process.env.DB_TEST_NAME ?? 'ec_db_test',
        entities: [AdminUserEntity, StoreSettingsEntity],
        synchronize: true,
        dropSchema: true,
      }),
      AuthModule,
      StoreSettingsModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

describe('StoreSettings E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminUsersService: AdminUsersService;
  let storeSettingsRepository: Repository<StoreSettingsEntity>;
  let superAdminToken: string;
  let generalAdminToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    jwtService = app.get<JwtService>(JwtService);
    adminUsersService = app.get<AdminUsersService>(AdminUsersService);
    storeSettingsRepository = app.get('StoreSettingsEntityRepository');

    // テスト用の管理者ユーザーを作成
    const superAdmin = await adminUsersService.create(
      'super admin',
      'super@example.com',
      'password123',
      'super',
    );

    const generalAdmin = await adminUsersService.create(
      'general admin',
      'general@example.com',
      'password123',
      'general',
    );

    // JWT トークンを生成（sub フィールドで署名）
    superAdminToken = jwtService.sign({
      sub: superAdmin.id,
      role: 'super',
      type: 'admin',
    });

    generalAdminToken = jwtService.sign({
      sub: generalAdmin.id,
      role: 'general',
      type: 'admin',
    });

    // 初期レコード投入
    const storeSettings = new StoreSettingsEntity();
    storeSettings.shippingFixedFee = 800;
    storeSettings.shippingFreeThreshold = 5000;
    await storeSettingsRepository.save(storeSettings);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/store-settings', () => {
    it('super管理者がアクセスできること', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/store-settings')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('shippingFixedFee');
      expect(response.body).toHaveProperty('shippingFreeThreshold');
    });

    it('一般管理者がアクセスできること', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/store-settings')
        .set('Authorization', `Bearer ${generalAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('トークンなしでアクセスできないこと', async () => {
      const response = await request(app.getHttpServer()).get(
        '/admin/store-settings',
      );

      expect(response.status).toBe(401);
    });

    it('無効なトークンでアクセスできないこと', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/store-settings')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /admin/store-settings', () => {
    it('super管理者が更新できること', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          shippingFixedFee: 1000,
        });

      expect(response.status).toBe(200);
      expect(response.body.shippingFixedFee).toBe(1000);
    });

    it('一般管理者は更新できないこと', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .set('Authorization', `Bearer ${generalAdminToken}`)
        .send({
          shippingFixedFee: 1200,
        });

      expect(response.status).toBe(403);
    });

    it('トークンなしでアクセスできないこと', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .send({
          shippingFixedFee: 1200,
        });

      expect(response.status).toBe(401);
    });

    it('無効なトークンでアクセスできないこと', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          shippingFixedFee: 1200,
        });

      expect(response.status).toBe(401);
    });

    it('バリデーション失敗（配送料0円）', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          shippingFixedFee: 0,
        });

      expect(response.status).toBe(400);
    });

    it('バリデーション失敗（無料閾値負数）', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/store-settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          shippingFreeThreshold: -100,
        });

      expect(response.status).toBe(400);
    });
  });
});
