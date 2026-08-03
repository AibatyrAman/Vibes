// Tek şifreli admin oturumu — imzalı çerez (HMAC-SHA256, Web Crypto).
// server-only DEĞİL: hem server action'larda hem (gerekirse) edge'de çalışsın.
import { hmacHex, signValue, verifyValue } from "./hmac";

export const COOKIE_NAME = "vibes_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

export async function createToken(): Promise<string> {
  return signValue(`admin.${Date.now()}`);
}

/** İmzayı VE payload'ın "admin." öneki + sunucu tarafı süresini doğrular.
 *  NOT: eskiden yalnızca imza kontrol ediliyordu — customer/spin-gate token'ları
 *  aynı SESSION_SECRET'ı paylaştığından, herhangi bir çerez (ör. vibes_customer
 *  değeri vibes_admin adıyla kopyalanarak) admin oturumu olarak kabul
 *  edilebiliyordu. */
export async function verifyToken(token: string | undefined): Promise<boolean> {
  const value = await verifyValue(token);
  if (!value) return false;
  const m = /^admin\.(\d+)$/.exec(value);
  if (!m) return false;
  return Date.now() - Number(m[1]) < MAX_AGE * 1000;
}

/** Sabit-zamanlı karşılaştırma — hmac.ts:38-42'deki desenle aynı. */
export async function checkPassword(pw: string): Promise<boolean> {
  if (!pw) return false;
  const envReal = process.env.ADMIN_PASSWORD;
  if (!envReal && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD env değişkeni prod'da zorunlu.");
  }
  const real = envReal || "vibes1234";
  const [a, b] = await Promise.all([hmacHex(pw), hmacHex(real)]);
  return a === b;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
