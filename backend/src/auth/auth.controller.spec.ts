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
    it('AuthService.register を呼び出して結果を返す', async () => {
      const expected = { id: 1, email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register({ email: 'test@example.com', password: 'pass' });

      expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'pass');
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('AuthService.login を呼び出してトークンを返す', async () => {
      const expected = { accessToken: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login({ email: 'test@example.com', password: 'pass' });

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'pass');
      expect(result).toEqual(expected);
    });

    it('AuthService.login がエラーを投げた場合は伝播する', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        controller.login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
