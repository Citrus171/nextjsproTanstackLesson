import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUsersService } from './admin-users.service';
import { AdminUserEntity } from './entities/admin-user.entity';

const makeAdmin = (overrides: Partial<AdminUserEntity> = {}): AdminUserEntity =>
  Object.assign(new AdminUserEntity(), {
    id: 1,
    email: 'admin@example.com',
    password: 'hashed',
    name: '管理者',
    role: 'general',
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    ...overrides,
  });

jest.mock('bcrypt');

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let repo: jest.Mocked<Repository<AdminUserEntity>>;

  beforeEach(async () => {
    const mockRepo: jest.Mocked<Partial<Repository<AdminUserEntity>>> = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getRepositoryToken(AdminUserEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    repo = module.get(getRepositoryToken(AdminUserEntity));
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('存在するメールアドレスの時、AdminUserEntityを返すこと', async () => {
      const admin = makeAdmin({ email: 'admin@example.com' });
      repo.findOneBy.mockResolvedValue(admin);

      const result = await service.findByEmail('admin@example.com');

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(result).toEqual(admin);
    });

    it('存在しないメールアドレスの時、nullを返すこと', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('有効な情報でアカウント作成され、id・email・role・createdAtを返すこと', async () => {
      const hashedPassword = 'hashed_password_123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newAdmin = makeAdmin({
        id: 2,
        name: '新管理者',
        email: 'new-admin@example.com',
        password: hashedPassword,
        role: 'super',
      });

      repo.save.mockResolvedValue(newAdmin);

      const result = await service.create('新管理者', 'new-admin@example.com', 'password123', 'super');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '新管理者',
          email: 'new-admin@example.com',
          password: hashedPassword,
          role: 'super',
        }),
      );
      expect(result).toEqual({
        id: 2,
        name: '新管理者',
        email: 'new-admin@example.com',
        role: 'super',
        createdAt: newAdmin.createdAt,
      });
      expect(!('password' in result)).toBe(true);
    });
  });

  describe('findAll', () => {
    it('全管理者を取得され、createdAtが新しい順に並ぶこと', async () => {
      const admins = [
        makeAdmin({ id: 1, createdAt: new Date('2024-01-01') }),
        makeAdmin({ id: 2, createdAt: new Date('2024-01-02') }),
      ];
      repo.find.mockResolvedValue(admins);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result.every((r) => !('password' in r))).toBe(true);
    });
  });

  describe('findById', () => {
    it('存在するIDで詳細取得でき、passwordを含まないこと', async () => {
      const admin = makeAdmin({ id: 5 });
      repo.findOneBy.mockResolvedValue(admin);

      const result = await service.findById(5);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 5 });
      expect(result).toEqual({
        id: 5,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      });
      expect(result && !('password' in result)).toBe(true);
    });

    it('存在しないIDで詳細取得した時、nullを返すこと', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('有効な更新内容でアカウント更新され、更新後の情報を返すこと', async () => {
      const original = makeAdmin({ id: 5 });
      const updated = makeAdmin({
        id: 5,
        name: '更新管理者',
        role: 'super',
      });

      repo.findOneBy.mockResolvedValue(original);
      repo.save.mockResolvedValue(updated);

      const result = await service.update(5, { name: '更新管理者', role: 'super' });

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 5 });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          name: '更新管理者',
          role: 'super',
        }),
      );
      expect(result).toEqual({
        id: 5,
        name: '更新管理者',
        email: updated.email,
        role: 'super',
        createdAt: updated.createdAt,
      });
    });

    it('存在しないIDで更新した時、nullを返すこと', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.update(999, { name: '新名前' });

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('存在するIDで論理削除に成功すること', async () => {
      const admin = makeAdmin({ id: 5 });
      repo.findOneBy.mockResolvedValue(admin);
      repo.save.mockResolvedValue({
        ...admin,
        deletedAt: new Date(),
      });

      await service.softDelete(5);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 5 });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('存在しないIDで論理削除した時、何も起こらないこと', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await service.softDelete(999);

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('業務ルール・例外ケース', () => {
    it('email一意性制約違反時、エラーが伝搬すること', async () => {
      const error = new Error('UNIQUE constraint failed: admin_users.email');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      repo.save.mockRejectedValue(error);

      await expect(
        service.create('管理者', 'duplicate@example.com', 'password123', 'general'),
      ).rejects.toThrow('UNIQUE constraint failed');
    });

    it('ロール値は super または general のみ許可（型安全）', async () => {
      const hashedPassword = 'hashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const adminSuper = makeAdmin({ role: 'super' });
      repo.save.mockResolvedValue(adminSuper);

      const result = await service.create('管理者', 'admin@example.com', 'password123', 'super');

      expect(result.role).toBe('super');
    });

    it('更新時、部分的な更新（nameのみ）でroleは変更されないこと', async () => {
      const original = makeAdmin({ id: 5, name: '元の名前', role: 'general' });
      const updated = makeAdmin({ id: 5, name: '新しい名前', role: 'general' });

      repo.findOneBy.mockResolvedValue(original);
      repo.save.mockResolvedValue(updated);

      const result = await service.update(5, { name: '新しい名前' });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '新しい名前',
          role: 'general',
        }),
      );
      expect(result?.role).toBe('general');
    });
  });
});
