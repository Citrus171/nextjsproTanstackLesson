import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { ProductsModule } from './products.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductEntity } from './entities/product.entity';
import { ProductVariationEntity } from './entities/product-variation.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { CategoryEntity } from '../categories/entities/category.entity';

async function createTestApp(): Promise<{ app: INestApplication; dataSource: DataSource }> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.DB_HOST ?? 'localhost',
        port: 3306,
        username: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? 'password',
        database: process.env.DB_TEST_NAME ?? 'todo_test',
        entities: [ProductEntity, ProductVariationEntity, ProductImageEntity, CategoryEntity],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      ProductsModule,
      CategoriesModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  const dataSource = module.get<DataSource>(DataSource);

  return { app, dataSource };
}

describe('Public Products E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    dataSource = result.dataSource;
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);

  describe('GET /products', () => {
    it('公開商品一覧を返すこと', async () => {
      // テストデータ準備
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({
          name: 'テストカテゴリ',
        }),
      );

      const product = await productRepo.save(
        productRepo.create({
          name: 'テスト商品',
          description: 'テスト説明',
          price: 5000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('price');
    });

    it('カテゴリフィルター（category_id）が機能すること', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category1 = await categoryRepo.save(
        categoryRepo.create({ name: 'カテゴリ1' }),
      );
      const category2 = await categoryRepo.save(
        categoryRepo.create({ name: 'カテゴリ2' }),
      );

      await productRepo.save(
        productRepo.create({
          name: '商品A',
          price: 1000,
          categoryId: category1.id,
          isPublished: true,
        }),
      );

      await productRepo.save(
        productRepo.create({
          name: '商品B',
          price: 2000,
          categoryId: category2.id,
          isPublished: true,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .query({ category_id: category1.id })
        .expect(200);

      expect(res.body.data.every((p: ProductEntity) => p.categoryId === category1.id)).toBe(
        true,
      );
    });

    it('キーワード検索（keyword）が機能すること', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({ name: 'テストカテゴリ6' }),
      );

      await productRepo.save(
        productRepo.create({
          name: 'MacBook Pro',
          description: 'High-performance laptop',
          price: 1500000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      await productRepo.save(
        productRepo.create({
          name: 'iPhone',
          description: 'Apple phone',
          price: 100000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .query({ keyword: 'Mac' })
        .expect(200);

      expect(
        res.body.data.every(
          (p: ProductEntity) =>
            p.name.includes('Mac') || p.description?.includes('Mac'),
        ),
      ).toBe(true);
    });

    it('ソート（sort=price_asc）が機能すること', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({ name: 'テストカテゴリ7' }),
      );

      await productRepo.save(
        productRepo.create({
          name: '高い商品',
          price: 5000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      await productRepo.save(
        productRepo.create({
          name: '安い商品',
          price: 1000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .query({ sort: 'price_asc' })
        .expect(200);

      for (let i = 1; i < res.body.data.length; i++) {
        expect(res.body.data[i].price).toBeGreaterThanOrEqual(res.body.data[i - 1].price);
      }
    });

    it('ソート（sort=price_desc）が機能すること', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({ name: 'テストカテゴリ8' }),
      );

      await productRepo.save(
        productRepo.create({
          name: '安い商品',
          price: 1000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      await productRepo.save(
        productRepo.create({
          name: '高い商品',
          price: 5000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .query({ sort: 'price_desc' })
        .expect(200);

      for (let i = 1; i < res.body.data.length; i++) {
        expect(res.body.data[i].price).toBeLessThanOrEqual(res.body.data[i - 1].price);
      }
    });

    it('非公開商品は含まれないこと', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({
          name: 'テストカテゴリ2',
        }),
      );

      // 非公開商品を作成
      await productRepo.save(
        productRepo.create({
          name: '非公開商品',
          description: '非公開',
          price: 3000,
          categoryId: category.id,
          isPublished: false,
        }),
      );

      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      const foundPrivate = res.body.data.some((p: ProductEntity) => p.name === '非公開商品');
      expect(foundPrivate).toBe(false);
    });

    it('ページネーション（page, limit）が機能すること', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({
          name: 'テストカテゴリ3',
        }),
      );

      // 15件の商品を作成
      for (let i = 1; i <= 15; i++) {
        await productRepo.save(
          productRepo.create({
            name: `商品${i}`,
            price: 1000 * i,
            categoryId: category.id,
            isPublished: true,
          }),
        );
      }

      // page=1, limit=10
      const res1 = await request(app.getHttpServer())
        .get('/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res1.body.data.length).toBeLessThanOrEqual(10);
      expect(res1.body.total).toBeGreaterThanOrEqual(15);

      // page=2, limit=10
      const res2 = await request(app.getHttpServer())
        .get('/products')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(res2.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/:id', () => {
    it('商品詳細をバリエーション・画像付きで返すこと', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);
      const variationRepo = dataSource.getRepository(ProductVariationEntity);
      const imageRepo = dataSource.getRepository(ProductImageEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({
          name: 'テストカテゴリ4',
        }),
      );

      const product = await productRepo.save(
        productRepo.create({
          name: '詳細テスト商品',
          description: '詳細説明',
          price: 5000,
          categoryId: category.id,
          isPublished: true,
        }),
      );

      await variationRepo.save(
        variationRepo.create({
          productId: product.id,
          size: 'M',
          color: 'Red',
          price: 5000,
          stock: 10,
        }),
      );

      await imageRepo.save(
        imageRepo.create({
          productId: product.id,
          url: 'https://example.com/image.jpg',
          sortOrder: 0,
        }),
      );

      const res = await request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', product.id);
      expect(res.body).toHaveProperty('name', '詳細テスト商品');
      expect(res.body).toHaveProperty('variations');
      expect(Array.isArray(res.body.variations)).toBe(true);
      expect(res.body.variations.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('images');
      expect(Array.isArray(res.body.images)).toBe(true);
      expect(res.body.images.length).toBeGreaterThan(0);
    });

    it('存在しない商品は404を返すこと', async () => {
      await request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);
    });

    it('非公開商品は404を返すこと', async () => {
      const categoryRepo = dataSource.getRepository(CategoryEntity);
      const productRepo = dataSource.getRepository(ProductEntity);

      const category = await categoryRepo.save(
        categoryRepo.create({
          name: 'テストカテゴリ5',
        }),
      );

      const product = await productRepo.save(
        productRepo.create({
          name: '非公開詳細商品',
          price: 4000,
          categoryId: category.id,
          isPublished: false,
        }),
      );

      await request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(404);
    });
  });
});
