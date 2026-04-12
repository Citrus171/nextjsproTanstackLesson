import { afterEach, describe, expect, it } from "vitest";
import {
  getAdminToken,
  getToken,
  removeAdminToken,
  removeToken,
  setAdminToken,
  setToken,
  isAdminAuthenticated,
  isAuthenticated,
  decodeAdminToken,
} from "./auth";

const TOKEN_KEY = "access_token";
const ADMIN_TOKEN_KEY = "admin_access_token";

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${header}.${body}.signature`;
}

afterEach(() => {
  localStorage.clear();
});

describe("setToken", () => {
  it("トークンをlocalStorageに保存すること", () => {
    setToken("my.jwt.token");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("my.jwt.token");
  });
});

describe("getToken", () => {
  it("保存済みトークンを返すこと", () => {
    localStorage.setItem(TOKEN_KEY, "my.jwt.token");
    expect(getToken()).toBe("my.jwt.token");
  });

  it("トークンが未保存の時はnullを返すこと", () => {
    expect(getToken()).toBeNull();
  });
});

describe("removeToken", () => {
  it("localStorageからトークンを削除すること", () => {
    localStorage.setItem(TOKEN_KEY, "my.jwt.token");
    removeToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

describe("isAuthenticated", () => {
  it("トークンが存在する時はtrueを返すこと", () => {
    localStorage.setItem(TOKEN_KEY, makeJwt({ sub: 1, type: "user" }));
    expect(isAuthenticated()).toBe(true);
  });

  it("トークンが存在しない時はfalseを返すこと", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("admin JWT の時は false を返すこと", () => {
    localStorage.setItem(
      TOKEN_KEY,
      makeJwt({ sub: 1, type: "admin", role: "general" }),
    );
    expect(isAuthenticated()).toBe(false);
  });
});

describe("setAdminToken", () => {
  it("管理者トークンをlocalStorageに保存すること", () => {
    setAdminToken("admin.jwt.token");
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe("admin.jwt.token");
  });
});

describe("getAdminToken", () => {
  it("保存済みの管理者トークンを返すこと", () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, "admin.jwt.token");
    expect(getAdminToken()).toBe("admin.jwt.token");
  });

  it("管理者トークンが未保存の時はnullを返すこと", () => {
    expect(getAdminToken()).toBeNull();
  });
});

describe("removeAdminToken", () => {
  it("管理者トークンをlocalStorageから削除すること", () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, "admin.jwt.token");
    removeAdminToken();
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
  });
});

describe("isAdminAuthenticated", () => {
  it("typeがadminのJWTの時、trueを返すこと", () => {
    localStorage.setItem(
      ADMIN_TOKEN_KEY,
      makeJwt({ sub: 1, type: "admin", role: "general" }),
    );
    expect(isAdminAuthenticated()).toBe(true);
  });

  it("typeがuserのJWTの時、falseを返すこと", () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, makeJwt({ sub: 1, type: "user" }));
    expect(isAdminAuthenticated()).toBe(false);
  });

  it("JWT形式でないトークンの時、falseを返すこと", () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, "invalid-token");
    expect(isAdminAuthenticated()).toBe(false);
  });
});

describe("decodeAdminToken", () => {
  it("有効な管理者JWTをデコードすること", () => {
    const jwt = makeJwt({ sub: 1, type: "admin", role: "super" });
    const decoded = decodeAdminToken(jwt);
    expect(decoded.sub).toBe(1);
    expect(decoded.type).toBe("admin");
    expect(decoded.role).toBe("super");
  });

  it("generalロールのJWTもデコードすること", () => {
    const jwt = makeJwt({ sub: 2, type: "admin", role: "general" });
    const decoded = decodeAdminToken(jwt);
    expect(decoded.role).toBe("general");
  });

  it("JWT形式が不正な時、エラーを投げること", () => {
    expect(() => decodeAdminToken("invalid-token")).toThrow();
  });

  it("sub が number でない時、エラーを投げること", () => {
    const jwt = makeJwt({ sub: "1", type: "admin", role: "super" });
    expect(() => decodeAdminToken(jwt)).toThrow();
  });

  it("role が super でも general でもない時、エラーを投げること", () => {
    const jwt = makeJwt({ sub: 1, type: "admin", role: "invalid" });
    expect(() => decodeAdminToken(jwt)).toThrow();
  });

  it("type が admin でない時、エラーを投げること", () => {
    const jwt = makeJwt({ sub: 1, type: "user", role: "super" });
    expect(() => decodeAdminToken(jwt)).toThrow();
  });
});
