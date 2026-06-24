// Tek şifreli admin oturumu — imzalı çerez (HMAC-SHA256, Web Crypto).
// server-only DEĞİL: hem server action'larda hem (gerekirse) edge'de çalışsın.
import { signValue, verifyValue } from "./hmac";

export const COOKIE_NAME = "vibes_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

export async function createToken(): Promise<string> {
  return signValue(`admin.${Date.now()}`);
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  return (await verifyValue(token)) !== null;
}

export function checkPassword(pw: string): boolean {
  const real = process.env.ADMIN_PASSWORD || "vibes1234";
  return pw.length > 0 && pw === real;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
