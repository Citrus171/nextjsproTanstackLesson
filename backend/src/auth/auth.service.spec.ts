import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  Object.assign(new UserEntity(), {
    id: 1,
    email: 'test@example.com',
    password: '',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService: jest.Mocked<Partial<UsersService>> = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    const mockJwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  // ── register ──────────────────────────────────────────────
  describe('register', () => {
    it('有効なname・メールアドレス・パスワードの時、id/emailを返すこと', async () => {
      const user = makeUser({ id: 5, email: 'new@example.com', name: '山田太郎' });
      usersService.create.mockResolvedValue(user);

      const result = await service.register('山田太郎', 'new@example.com', 'pass');

      expect(usersService.create).toHaveBeenCalledWith('山田太郎', 'new@example.com', 'pass');
      expect(result).toEqual({ id: 5, email: 'new@example.com' });
    });

    it('パスワードをレスポンスに含まない', async () => {
      const user = makeUser({ password: 'hashed' });
      usersService.create.mockResolvedValue(user);

      const result = await service.register('山田太郎', 'test@example.com', 'pass');

      expect(result).not.toHaveProperty('password');
    });
  });

  // ── login ─────────────────────────────────────────────────
  describe('login', () => {
    it('正しい認証情報でアクセストークンを返す', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      const user = makeUser({ password: hashed });
      usersService.findByEmail.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.login('test@example.com', 'correct');

      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
    });

    it('JWTペイロードに type:"user" と sub が含まれること', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      const user = makeUser({ id: 42, password: hashed });
      usersService.findByEmail.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('token');

      await service.login('test@example.com', 'correct');

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 42, type: 'user' });
    });

    it('存在しないメールアドレスはUnauthorizedExceptionを投げる', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('no@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('パスワード不一致はUnauthorizedExceptionを投げる', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      const user = makeUser({ password: hashed });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('メールアドレス/パスワード不一致のエラーメッセージは同一（列挙攻撃対策）', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const err1 = await service.login('no@example.com', 'pass').catch((e: UnauthorizedException) => e);

      const hashed = await bcrypt.hash('correct', 10);
      usersService.findByEmail.mockResolvedValue(makeUser({ password: hashed }));
      const err2 = await service.login('test@example.com', 'wrong').catch((e: UnauthorizedException) => e);

      expect((err1 as UnauthorizedException).message).toBe((err2 as UnauthorizedException).message);
    });
  });
});
