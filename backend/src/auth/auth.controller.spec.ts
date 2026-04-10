import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
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
    it('有効な入力の時、ユーザー登録結果を返すこと', async () => {
      const expected = { id: 1, email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register({ email: 'test@example.com', password: 'pass' });

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
});
