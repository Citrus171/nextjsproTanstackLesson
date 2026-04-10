import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('有効なJWTペイロードの時、subをidにマッピングしてid/emailを返すこと', () => {
      const result = strategy.validate({ sub: 42, email: 'user@example.com' });
      expect(result).toEqual({ id: 42, email: 'user@example.com' });
    });

  });
});
