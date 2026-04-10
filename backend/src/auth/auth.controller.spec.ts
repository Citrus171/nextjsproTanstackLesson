import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  adminLogin: jest.fn(),
};

const adminRequest = {
  user: {
    id: 10,
    role: 'super' as const,
  },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('有効な入力の時、nameをサービスに渡してユーザー登録結果を返すこと', async () => {
      const expected = { id: 1, email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register({ name: '山田太郎', email: 'test@example.com', password: 'pass' });

      expect(mockAuthService.register).toHaveBeenCalledWith('山田太郎', 'test@example.com', 'pass');
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('有効な認証情報の時、アクセストークンを返すこと', async () => {
      const expected = { accessToken: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login({ email: 'test@example.com', password: 'pass' });

      expect(result).toEqual(expected);
    });

    it('サービスがエラーを投げた時、エラーが伝播すること', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        controller.login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('adminLogin', () => {
    it('有効な認証情報の時、adminLoginサービスを呼びアクセストークンを返すこと', async () => {
      const expected = { accessToken: 'admin-jwt-token' };
      mockAuthService.adminLogin.mockResolvedValue(expected);

      const result = await controller.adminLogin({ email: 'admin@example.com', password: 'password123' });

      expect(mockAuthService.adminLogin).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(result).toEqual(expected);
    });

    it('サービスがエラーを投げた時、エラーが伝播すること', async () => {
      mockAuthService.adminLogin.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        controller.adminLogin({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('adminMe', () => {
    it('認証済み管理者のidとroleを返すこと', () => {
      expect(controller.adminMe(adminRequest)).toEqual({ id: 10, role: 'super' });
    });
  });

  describe('superOnly', () => {
    it('到達した時、ok:trueを返すこと', () => {
      expect(controller.superOnly()).toEqual({ ok: true });
    });
  });
});
