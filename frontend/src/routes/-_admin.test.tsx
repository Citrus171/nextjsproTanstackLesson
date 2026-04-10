import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  isAdminAuthenticated: vi.fn(),
}));

import { isAdminAuthenticated } from "@/lib/auth";
import { Route } from "./_admin";

const beforeLoad = Route.options.beforeLoad as NonNullable<
  typeof Route.options.beforeLoad
>;
const beforeLoadContext = {} as NonNullable<Parameters<
  typeof beforeLoad
>[0]>;

describe("admin route guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("管理者トークンがない時、/admin/loginへリダイレクトすること", () => {
    vi.mocked(isAdminAuthenticated).mockReturnValue(false);

    try {
      beforeLoad(beforeLoadContext);
      throw new Error("redirectが発生していません");
    } catch (error) {
      expect(error).toMatchObject({ options: { to: "/admin/login" } });
    }
  });

  it("管理者トークンがある時、リダイレクトしないこと", () => {
    vi.mocked(isAdminAuthenticated).mockReturnValue(true);
    expect(() => beforeLoad(beforeLoadContext)).not.toThrow();
  });
});