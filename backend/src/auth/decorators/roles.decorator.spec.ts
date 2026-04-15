import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('ROLES_KEY が "roles" であること', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('Roles デコレーターが定義されていること', () => {
    const decorator = Roles('super');
    expect(decorator).toBeDefined();
  });

  it('複数のロールを受け付けること', () => {
    const decorator = Roles('super', 'general');
    expect(decorator).toBeDefined();
  });
});
