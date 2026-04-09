import { ConflictException } from '@nestjs/common';
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
};

const mockRepository = (): MockRepository => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
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
    it('新規ユーザーを作成してパスワードをハッシュ化する', async () => {
      repo.findOneBy.mockResolvedValue(null);
      const user = makeUser();
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.create('test@example.com', 'password123');

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
      // パスワードがハッシュ化されていること
      const savedPassword: string = (repo.create.mock.calls[0][0] as { password: string }).password;
      await expect(bcrypt.compare('password123', savedPassword)).resolves.toBe(true);
      expect(result).toEqual(user);
    });

    it('既存メールアドレスはConflictExceptionを投げる', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      await expect(service.create('test@example.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create('test@example.com', 'password123')).rejects.toThrow(
        'このメールアドレスは既に登録されています',
      );
    });

    it('ConflictException時はsaveを呼ばない', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      await service.create('test@example.com', 'pass').catch(() => {});
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
});
