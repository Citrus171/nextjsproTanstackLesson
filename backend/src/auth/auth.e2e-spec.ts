import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import request from "supertest";
import { AuthModule } from "./auth.module";
import { AdminUserEntity } from "../admin-users/entities/admin-user.entity";
import { UserEntity } from "../users/entities/user.entity";

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
        entities: [UserEntity, AdminUserEntity],
        synchronize: true,
        dropSchema: true,
      }),
      AuthModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

describe("Auth E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("有効な入力の時、ユーザーを作成してid/emailを返すこと", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          name: "新規ユーザー",
          email: "new-user@example.com",
          password: "password123",
        })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.any(Number),
        email: "new-user@example.com",
      });
      expect(res.body).not.toHaveProperty("password");
    });

    it("メールアドレス形式が不正な時、400を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "invalid-email", password: "password123" })
        .expect(400);
    });

    it("パスワードが8文字未満の時、400を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "short@example.com", password: "short" })
        .expect(400);
    });

    it("同じメールアドレスが既に存在する時、409を返すこと", async () => {
      const body = {
        name: "重複ユーザー",
        email: "duplicate@example.com",
        password: "password123",
      };

      await request(app.getHttpServer())
        .post("/auth/register")
        .send(body)
        .expect(201);
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(body)
        .expect(409);
    });
  });

  describe("POST /auth/login", () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          name: "ログインユーザー",
          email: "login-user@example.com",
          password: "password123",
        })
        .expect(201);
    });

    it("正しい認証情報の時、accessTokenを返すこと", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "login-user@example.com", password: "password123" })
        .expect(201);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
    });

    it("未登録メールアドレスの時、401を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "not-found@example.com", password: "password123" })
        .expect(401);
    });

    it("パスワードが不一致の時、401を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "login-user@example.com", password: "wrong-password" })
        .expect(401);
    });

    it("メールアドレス形式が不正な時、400を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "invalid-email", password: "password123" })
        .expect(400);
    });
  });

  describe("POST /admin/auth/login", () => {
    beforeAll(async () => {
      const dataSource = app.get(DataSource);
      const generalHashed = await bcrypt.hash("admin-pass123", 10);
      const superHashed = await bcrypt.hash("super-pass123", 10);
      await dataSource.getRepository(AdminUserEntity).save({
        email: "admin@example.com",
        password: generalHashed,
        name: "管理者テスト",
        role: "general",
      });
      await dataSource.getRepository(AdminUserEntity).save({
        email: "super-admin@example.com",
        password: superHashed,
        name: "スーパー管理者テスト",
        role: "super",
      });
    });

    it("正しい認証情報の時、accessTokenを返すこと", async () => {
      const res = await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "admin@example.com", password: "admin-pass123" })
        .expect(201);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
    });

    it("未登録メールアドレスの時、401を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "notfound@example.com", password: "admin-pass123" })
        .expect(401);
    });

    it("パスワードが不一致の時、401を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "admin@example.com", password: "wrong-password" })
        .expect(401);
    });

    it("メールアドレス形式が不正な時、400を返すこと", async () => {
      await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "invalid-email", password: "admin-pass123" })
        .expect(400);
    });

    it("管理者JWTのペイロードに type:'admin' と role が含まれること", async () => {
      const res = await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "admin@example.com", password: "admin-pass123" })
        .expect(201);

      const token = res.body.accessToken as string;
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );
      expect(payload.type).toBe("admin");
      expect(payload.role).toBe("general");
      expect(typeof payload.sub).toBe("number");
    });

    it("super管理者でログインした時、accessTokenを返すこと", async () => {
      const res = await request(app.getHttpServer())
        .post("/admin/auth/login")
        .send({ email: "super-admin@example.com", password: "super-pass123" })
        .expect(201);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
    });
  });
});
