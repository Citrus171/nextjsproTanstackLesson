import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('有効なJWTペイロードの時、subをidにマッピングしてidを返すこと', () => {
      const result = strategy.validate({ sub: 42, type: 'user' as const });
      expect(result).toEqual({ id: 42 });
    });

    it('type が "user" でない時、UnauthorizedExceptionを投げること', () => {
      expect(() =>
        strategy.validate({ sub: 1, type: 'admin' as unknown as 'user' }),
      ).toThrow(UnauthorizedException);
    });
  });
});
