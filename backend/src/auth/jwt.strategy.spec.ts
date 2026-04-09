import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('JWTペイロードからid/emailを返す', () => {
      const result = strategy.validate({ sub: 42, email: 'user@example.com' });
      expect(result).toEqual({ id: 42, email: 'user@example.com' });
    });

    it('subをidにマッピングする', () => {
      const result = strategy.validate({ sub: 99, email: 'other@example.com' });
      expect(result.id).toBe(99);
    });
  });
});
