// Müşteri oturumu — kullanıcı adı + telefon ile kayıt/giriş, SMS yok.
// İmzalı çerez (auth.ts ile aynı HMAC deseni, hmac.ts'ten paylaşılır).
import { cookies } from "next/headers";
import { signValue, verifyValue } from "./hmac";

export const CUSTOMER_COOKIE_NAME = "vibes_customer";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 yıl

export async function createCustomerToken(customerId: number): Promise<string> {
  return signValue(`customer.${customerId}`);
}

export async function verifyCustomerToken(
  token: string | undefined,
): Promise<number | null> {
  const value = await verifyValue(token);
  if (!value) return null;
  const m = /^customer\.(\d+)$/.exec(value);
  return m ? Number(m[1]) : null;
}

export const customerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

/** Geçerli oturumdaki müşteri id'si, yoksa null. Sayfa/server action'larda kullan. */
export async function getCustomerId(): Promise<number | null> {
  const store = await cookies();
  return verifyCustomerToken(store.get(CUSTOMER_COOKIE_NAME)?.value);
}
