import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

const mockUsersService = {
  findById: jest.fn(),
} as unknown as UsersService;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(mockUsersService);
  });

  describe('validate', () => {
    it('有効なJWTペイロードかつ存在するユーザーの時、idを返すこと', async () => {
      (mockUsersService.findById as jest.Mock).mockResolvedValue({ id: 42 });

      const result = await strategy.validate({ sub: 42, type: 'user' as const });

      expect(mockUsersService.findById).toHaveBeenCalledWith(42);
      expect(result).toEqual({ id: 42 });
    });

    it('type が "user" でない時、UnauthorizedExceptionを投げること', async () => {
      await expect(
        strategy.validate({ sub: 1, type: 'admin' as unknown as 'user' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findById).not.toHaveBeenCalled();
    });

    it('論理削除済みユーザーの時（findByIdがNotFoundExceptionを投げる）、UnauthorizedExceptionを投げること', async () => {
      (mockUsersService.findById as jest.Mock).mockRejectedValue(
        new NotFoundException('ユーザーが見つかりません'),
      );

      await expect(
        strategy.validate({ sub: 99, type: 'user' as const }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
