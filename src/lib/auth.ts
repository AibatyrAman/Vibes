// Tek şifreli admin oturumu — imzalı çerez (HMAC-SHA256, Web Crypto).
// server-only DEĞİL: hem server action'larda hem (gerekirse) edge'de çalışsın.

export const COOKIE_NAME = "vibes_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

async function hmacHex(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createToken(): Promise<string> {
  const value = `admin.${Date.now()}`;
  return `${value}.${await hmacHex(value)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmacHex(value);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++)
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
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
