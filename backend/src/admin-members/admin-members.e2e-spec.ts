import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import request from "supertest";
import { AuthModule } from "../auth/auth.module";
import { AdminMembersModule } from "./admin-members.module";
import { UserEntity } from "../users/entities/user.entity";
import { AdminUserEntity } from "../admin-users/entities/admin-user.entity";
import { OrderEntity } from "../orders/entities/order.entity";
import { OrderItemEntity } from "../orders/entities/order-item.entity";
import { ProductVariationEntity } from "../products/entities/product-variation.entity";
import { ProductEntity } from "../products/entities/product.entity";
import { CategoryEntity } from "../categories/entities/category.entity";
import { ProductImageEntity } from "../products/entities/product-image.entity";

jest.setTimeout(30000);

async function createTestApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: "mysql",
        host: process.env.DB_HOST ?? "localhost",
        port: 3306,
        username: process.env.DB_USER ?? "root",
        password: process.env.DB_PASSWORD ?? "password",
        database: process.env.DB_TEST_NAME ?? "todo_test",
        entities: [
          UserEntity,
          AdminUserEntity,
          OrderEntity,
          OrderItemEntity,
          ProductVariationEntity,
          ProductEntity,
          CategoryEntity,
          ProductImageEntity,
        ],
        synchronize: true,
        dropSchema: true,
      }),
      AuthModule,
      AdminMembersModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

const adminUser = {
  email: "admin-user@example.com",
  password: "admin-pass123",
  name: "管理者",
  role: "general" as const,
};

const superAdminUser = {
  email: "super-admin@example.com",
  password: "super-pass123",
  name: "スーパー管理者",
  role: "super" as const,
};

describe("AdminMembers E2E", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let superAdminToken: string;
  let userId: number;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);

    const adminRepo = dataSource.getRepository(AdminUserEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const hashedAdmin = await bcrypt.hash(adminUser.password, 10);
    const hashedSuperAdmin = await bcrypt.hash(superAdminUser.password, 10);
    await adminRepo.save({
      email: adminUser.email,
      password: hashedAdmin,
      name: adminUser.name,
      role: adminUser.role,
    });
    await adminRepo.save({
      email: superAdminUser.email,
      password: hashedSuperAdmin,
      name: superAdminUser.name,
      role: superAdminUser.role,
    });

    const user = await userRepo.save({
      email: "user@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "一般会員",
      address: "東京都千代田区1-1-1",
    });
    userId = user.id;

    await request(app.getHttpServer())
      .post("/admin/auth/login")
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(201)
      .then((res) => {
        adminToken = res.body.accessToken;
      });

    await request(app.getHttpServer())
      .post("/admin/auth/login")
      .send({ email: superAdminUser.email, password: superAdminUser.password })
      .expect(201)
      .then((res) => {
        superAdminToken = res.body.accessToken;
      });

    const orderRepo = dataSource.getRepository(OrderEntity);
    await orderRepo.save({
      userId: user.id,
      status: "paid",
      shippingAddress: {
        zip: "100-0001",
        prefecture: "東京都",
        city: "千代田区",
        address1: "丸の内1-1-1",
      },
      shippingFee: 500,
      totalAmount: 10000,
      stripeSessionId: null,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /admin/members returns paginated members", async () => {
    const res = await request(app.getHttpServer())
      .get("/admin/members?page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      items: expect.any(Array),
    });
    expect(res.body.items[0]).toMatchObject({
      id: expect.any(Number),
      email: "user@example.com",
      name: "一般会員",
    });
    expect(res.body.items[0]).not.toHaveProperty("password");
  });

  it("GET /admin/members/:id returns member detail with orders", async () => {
    const res = await request(app.getHttpServer())
      .get(`/admin/members/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: userId,
      email: "user@example.com",
      orders: expect.any(Array),
    });
    expect(res.body.orders[0]).toMatchObject({
      id: expect.any(Number),
      status: "paid",
      totalAmount: 10000,
    });
    expect(res.body).not.toHaveProperty("password");
  });

  it("general admin cannot delete member", async () => {
    await request(app.getHttpServer())
      .delete(`/admin/members/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(403);
  });

  it("super admin can delete member", async () => {
    await request(app.getHttpServer())
      .delete(`/admin/members/${userId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .expect(204);
  });
});
