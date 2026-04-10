import { UnauthorizedException } from '@nestjs/common';
import { AdminJwtStrategy } from './admin-jwt.strategy';

describe('AdminJwtStrategy', () => {
  let strategy: AdminJwtStrategy;

  beforeEach(() => {
    strategy = new AdminJwtStrategy();
  });

  describe('validate', () => {
    it('有効な管理者JWTペイロードの時、id・roleをマッピングして返すこと', () => {
      const result = strategy.validate({ sub: 10, type: 'admin', role: 'super' });
      expect(result).toEqual({ id: 10, role: 'super' });
    });

    it('generalロールの場合もid・roleを返すこと', () => {
      const result = strategy.validate({ sub: 5, type: 'admin', role: 'general' });
      expect(result).toEqual({ id: 5, role: 'general' });
    });

    it('type が "admin" でない時、UnauthorizedExceptionを投げること', () => {
      expect(() =>
        strategy.validate({ sub: 1, type: 'user' as unknown as 'admin', role: 'general' }),
      ).toThrow(UnauthorizedException);
    });
  });
});
