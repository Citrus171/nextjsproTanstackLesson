const TOKEN_KEY = "access_token";
const ADMIN_TOKEN_KEY = "admin_access_token";

interface JwtPayload {
  type?: string;
}

interface AdminJwtPayload extends JwtPayload {
  sub: number;
  role: "super" | "general";
  type: "admin";
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  return payload?.type === "user";
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  return payload?.type === "admin";
}

export function decodeAdminToken(token: string): AdminJwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as AdminJwtPayload;
  } catch {
    throw new Error("Failed to decode token");
  }
}
