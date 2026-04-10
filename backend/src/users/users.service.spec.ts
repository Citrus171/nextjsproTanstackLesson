import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

type MockRepository = {
  findOneBy: jest.MockedFunction<Repository<UserEntity>['findOneBy']>;
  create: jest.MockedFunction<Repository<UserEntity>['create']>;
  save: jest.MockedFunction<Repository<UserEntity>['save']>;
  update: jest.MockedFunction<Repository<UserEntity>['update']>;
};

const mockRepository = (): MockRepository => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  Object.assign(new UserEntity(), {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<MockRepository>(getRepositoryToken(UserEntity));
  });

  // ── create ────────────────────────────────────────────────
  describe('create', () => {
    it('新規ユーザーを作成してname・emailを保存しパスワードをハッシュ化する', async () => {
      repo.findOneBy.mockResolvedValue(null);
      const user = makeUser({ name: '山田太郎' });
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.create('山田太郎', 'test@example.com', 'password123');

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: '山田太郎', email: 'test@example.com' }),
      );
      // パスワードがハッシュ化されていること
      const savedPassword: string = (repo.create.mock.calls[0][0] as { password: string }).password;
      await expect(bcrypt.compare('password123', savedPassword)).resolves.toBe(true);
      expect(result).toEqual(user);
    });

    it('既存メールアドレスはConflictExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      await expect(service.create('山田太郎', 'test@example.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create('山田太郎', 'test@example.com', 'password123')).rejects.toThrow(
        'このメールアドレスは既に登録されています',
      );
    });

    it('ConflictException時はsaveを呼ばない', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      await service.create('山田太郎', 'test@example.com', 'pass').catch(() => {});
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  // ── findByEmail ───────────────────────────────────────────
  describe('findByEmail', () => {
    it('存在するメールアドレスのユーザーを返す', async () => {
      const user = makeUser();
      repo.findOneBy.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(user);
    });

    it('存在しないメールアドレスはnullを返す', async () => {
      repo.findOneBy.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  // ── findById ──────────────────────────────────────────────
  describe('findById', () => {
    it('存在するIDのユーザーを返す', async () => {
      const user = makeUser({ id: 10 });
      repo.findOneBy.mockResolvedValue(user);

      const result = await service.findById(10);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 10 });
      expect(result).toEqual(user);
    });

    it('存在しないIDはNotFoundExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── changePassword ────────────────────────────────────────
  describe('changePassword', () => {
    it('正しい現在のパスワードの時、新しいパスワードをハッシュ化して保存する', async () => {
      const currentHashed = await bcrypt.hash('currentPass', 10);
      const user = makeUser({ id: 1, password: currentHashed });
      repo.findOneBy.mockResolvedValue(user);
      repo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.changePassword(1, 'currentPass', 'newPassword123');

      const savedPassword: string = (repo.update.mock.calls[0][1] as { password: string }).password;
      await expect(bcrypt.compare('newPassword123', savedPassword)).resolves.toBe(true);
    });

    it('現在のパスワードが不一致の時、UnauthorizedExceptionを投げる', async () => {
      const currentHashed = await bcrypt.hash('correctPass', 10);
      const user = makeUser({ password: currentHashed });
      repo.findOneBy.mockResolvedValue(user);

      await expect(service.changePassword(1, 'wrongPass', 'newPassword123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('パスワード不一致の時はupdateを呼ばない', async () => {
      const currentHashed = await bcrypt.hash('correctPass', 10);
      const user = makeUser({ password: currentHashed });
      repo.findOneBy.mockResolvedValue(user);

      await service.changePassword(1, 'wrongPass', 'newPassword123').catch(() => {});

      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
