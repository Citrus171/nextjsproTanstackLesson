import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { TodoEntity } from './todos/entities/todo.entity';
import { TodosModule } from './todos/todos.module';

async function createTestApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: [TodoEntity],
        synchronize: true,
      }),
      TodosModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

describe('Todos E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /todos ───────────────────────────────────────────
  describe('GET /todos', () => {
    it('空の配列を返す（初期状態）', async () => {
      const res = await request(app.getHttpServer()).get('/todos').expect(200);
      expect(res.body as TodoEntity[]).toEqual([]);
    });
  });

  // ── POST /todos ──────────────────────────────────────────
  describe('POST /todos', () => {
    it('正常なボディでTodoを作成する', async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'E2Eテスト', description: '詳細' })
        .expect(201);

      const body = res.body as TodoEntity;
      expect(body).toMatchObject({
        id: expect.any(Number),
        title: 'E2Eテスト',
        description: '詳細',
        completed: false,
        createdAt: expect.any(String),
      });
    });

    it('titleなしは400を返す（バリデーション）', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send({ description: 'titleなし' })
        .expect(400);
    });

    it('空文字titleは400を返す', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send({ title: '' })
        .expect(400);
    });

    it('descriptionなしでも作成できる', async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'タイトルのみ' })
        .expect(201);

      const body = res.body as TodoEntity;
      expect(body.title).toBe('タイトルのみ');
    });
  });

  // ── GET /todos/:id ───────────────────────────────────────
  describe('GET /todos/:id', () => {
    let createdId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: '取得テスト' });
      createdId = (res.body as TodoEntity).id;
    });

    it('存在するIDのTodoを返す', async () => {
      const res = await request(app.getHttpServer())
        .get(`/todos/${createdId}`)
        .expect(200);

      const body = res.body as TodoEntity;
      expect(body.id).toBe(createdId);
      expect(body.title).toBe('取得テスト');
    });

    it('存在しないIDは404を返す', async () => {
      await request(app.getHttpServer()).get('/todos/99999').expect(404);
    });
  });

  // ── PATCH /todos/:id ─────────────────────────────────────
  describe('PATCH /todos/:id', () => {
    let createdId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: '更新前' });
      createdId = (res.body as TodoEntity).id;
    });

    it('completedをtrueに更新できる', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/todos/${createdId}`)
        .send({ completed: true })
        .expect(200);

      const body = res.body as TodoEntity;
      expect(body.completed).toBe(true);
    });

    it('titleを更新できる', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/todos/${createdId}`)
        .send({ title: '更新後' })
        .expect(200);

      const body = res.body as TodoEntity;
      expect(body.title).toBe('更新後');
    });

    it('存在しないIDは404を返す', async () => {
      await request(app.getHttpServer())
        .patch('/todos/99999')
        .send({ completed: true })
        .expect(404);
    });
  });

  // ── DELETE /todos/:id ────────────────────────────────────
  describe('DELETE /todos/:id', () => {
    let createdId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: '削除対象' });
      createdId = (res.body as TodoEntity).id;
    });

    it('指定IDのTodoを削除して204を返す', async () => {
      await request(app.getHttpServer())
        .delete(`/todos/${createdId}`)
        .expect(204);
    });

    it('削除後に同じIDにアクセスすると404を返す', async () => {
      await request(app.getHttpServer())
        .get(`/todos/${createdId}`)
        .expect(404);
    });

    it('存在しないIDの削除は404を返す', async () => {
      await request(app.getHttpServer())
        .delete('/todos/99999')
        .expect(404);
    });
  });
});
