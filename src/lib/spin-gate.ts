// Çark "alkol kapısı": barmen admin paneldeki değişen QR'ı okutmadan kimse
// çevirmeyi açamaz. Token 60 sn'de bir döner (ekran görüntüsü riskini düşürür);
// okutunca kısa ömürlü bir "unlock" çerezi set edilir, bir çevirmede tüketilir.
import "server-only";
import { cookies } from "next/headers";
import { hmacHex, signValue, verifyValue } from "./hmac";
import { getSetting } from "./menu-repo";
import type { Customer } from "./customer-repo";

const WINDOW_SEC = 60;
const UNLOCK_TTL_SEC = 60 * 15; // 15 dk — okutup masaya dönüp çevirecek kadar
export const SPIN_GATE_COOKIE = "vibes_spin_gate";

function windowIndex(offset = 0): number {
  return Math.floor(Date.now() / 1000 / WINDOW_SEC) - offset;
}

/** Şu anki pencereye ait QR token'ı (kısa, okunaklı hex). */
export async function currentGateToken(): Promise<string> {
  const hex = await hmacHex(`spingate.${windowIndex()}`);
  return hex.slice(0, 10).toUpperCase();
}

/** Token şu anki VEYA bir önceki pencereyle eşleşiyorsa geçerli (rollover toleransı). */
export async function isValidGateToken(token: string): Promise<boolean> {
  const t = token.trim().toUpperCase();
  if (!t) return false;
  for (const offset of [0, 1]) {
    const hex = await hmacHex(`spingate.${windowIndex(offset)}`);
    if (hex.slice(0, 10).toUpperCase() === t) return true;
  }
  return false;
}

/** QR okutulunca çağrılır — kısa ömürlü unlock çerezi set eder. */
export async function setUnlock(): Promise<void> {
  const expiresAt = Date.now() + UNLOCK_TTL_SEC * 1000;
  const store = await cookies();
  store.set(SPIN_GATE_COOKIE, await signValue(`spinunlock.${expiresAt}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_TTL_SEC,
  });
}

/** Geçerli (süresi dolmamış) bir unlock çerezi var mı? */
export async function hasUnlock(): Promise<boolean> {
  const store = await cookies();
  const value = await verifyValue(store.get(SPIN_GATE_COOKIE)?.value);
  if (!value) return false;
  const m = /^spinunlock\.(\d+)$/.exec(value);
  if (!m) return false;
  return Number(m[1]) > Date.now();
}

/** Bir çevirmede unlock çerezini tüketir (tek kullanımlık). */
export async function consumeUnlock(): Promise<void> {
  const store = await cookies();
  store.delete(SPIN_GATE_COOKIE);
}

const normalizePhone = (s: string) => s.replace(/\D/g, "");

/** Test hesabı mı? (ayardaki spin_test_phone ile eşleşen telefon — sınırsız/QR'sız). */
export function isTestCustomer(customer: Pick<Customer, "phone">): boolean {
  const testPhone = getSetting("spin_test_phone", "");
  if (!testPhone) return false;
  return normalizePhone(customer.phone) === normalizePhone(testPhone);
}

/** Şu an çevirme hakkı var mı? (test hesabı VEYA geçerli unlock çerezi).
 *  customer henüz giriş yapmamışsa da unlock çerezi tek başına yeterlidir —
 *  QR'ı kayıt olmadan önce de okutmuş olabilir. */
export async function isSpinUnlocked(
  customer?: Pick<Customer, "phone"> | null,
): Promise<boolean> {
  if (customer && isTestCustomer(customer)) return true;
  return hasUnlock();
}
