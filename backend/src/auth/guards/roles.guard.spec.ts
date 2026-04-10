import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

function makeContext(role: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 1, role } : { id: 1 } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('@Rolesが設定されていない時、trueを返すこと', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(makeContext('general'));
    expect(result).toBe(true);
  });

  it('ユーザーのroleが必要ロールに一致する時、trueを返すこと', () => {
    reflector.getAllAndOverride.mockReturnValue(['super']);
    const result = guard.canActivate(makeContext('super'));
    expect(result).toBe(true);
  });

  it('generalロールがgeneralまたはsuperのどちらの要件にも対応できること', () => {
    reflector.getAllAndOverride.mockReturnValue(['super', 'general']);
    const result = guard.canActivate(makeContext('general'));
    expect(result).toBe(true);
  });

  it('ユーザーのroleが必要ロールに一致しない時、ForbiddenExceptionを投げること', () => {
    reflector.getAllAndOverride.mockReturnValue(['super']);
    expect(() => guard.canActivate(makeContext('general'))).toThrow(ForbiddenException);
  });
});
