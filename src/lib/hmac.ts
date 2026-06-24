// Ortak imzalı çerez yardımcıları (Web Crypto) — admin auth (auth.ts) ve
// müşteri auth (customer-auth.ts) bunu paylaşır.

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

export async function hmacHex(value: string): Promise<string> {
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

/** value.signature biçimli token üretir. */
export async function signValue(value: string): Promise<string> {
  return `${value}.${await hmacHex(value)}`;
}

/** signValue ile üretilmiş bir token'ı doğrular, geçerliyse value'yu döndürür. */
export async function verifyValue(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmacHex(value);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++)
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? value : null;
}
