import { ForbiddenException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { SuperAdminGuard } from "./super-admin.guard";

function makeContext(role?: "super" | "general"): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 1, role } : { id: 1 } }),
    }),
  } as unknown as ExecutionContext;
}

describe("SuperAdminGuard", () => {
  let guard: SuperAdminGuard;

  beforeEach(() => {
    guard = new SuperAdminGuard();
  });

  it("superロールの時、アクセスを許可すること", () => {
    const result = guard.canActivate(makeContext("super"));
    expect(result).toBe(true);
  });

  it("generalロールの時、ForbiddenExceptionを投げること", () => {
    expect(() => guard.canActivate(makeContext("general"))).toThrow(
      ForbiddenException,
    );
  });

  it("roleが存在しない時、ForbiddenExceptionを投げること", () => {
    expect(() => guard.canActivate(makeContext())).toThrow(ForbiddenException);
  });
});
