// Çark "alkol kapısı": barmen admin paneldeki değişen QR'ı okutmadan kimse
// çevirmeyi açamaz. Token 60 sn'de bir döner (ekran görüntüsü riskini düşürür)
// VE bir kez okutulunca DB'de tüketilmiş sayılır (used_gate_tokens) — aynı
// token'ın fotoğrafı paylaşılsa bile pencere içinde ikinci kez kullanılamaz.
// Okutunca kısa ömürlü bir "unlock" çerezi set edilir; bu da DB'de jti ile
// izlenir (spin_unlocks), böylece çerez kopyalansa bile bir çevirmede
// sunucu tarafında geçersiz kılınır.
import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { hmacHex, signValue, verifyValue } from "./hmac";
import { getSetting } from "./menu-repo";
import { getDb } from "./db";
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

/** Token şu anki VEYA bir önceki pencereyle eşleşiyorsa VE daha önce
 *  kullanılmadıysa geçerli (rollover toleransı + tek kullanımlık). */
export async function isValidGateToken(token: string): Promise<boolean> {
  const t = token.trim().toUpperCase();
  if (!t) return false;
  let matches = false;
  for (const offset of [0, 1]) {
    const hex = await hmacHex(`spingate.${windowIndex(offset)}`);
    if (hex.slice(0, 10).toUpperCase() === t) {
      matches = true;
      break;
    }
  }
  if (!matches) return false;
  const res = getDb()
    .prepare(
      "INSERT OR IGNORE INTO used_gate_tokens (token, used_at) VALUES (?, ?)",
    )
    .run(t, Date.now());
  return res.changes > 0;
}

/** QR okutulunca çağrılır — DB'de izlenen, kısa ömürlü unlock çerezi set eder. */
export async function setUnlock(): Promise<void> {
  const jti = crypto.randomUUID();
  const expiresAt = Date.now() + UNLOCK_TTL_SEC * 1000;
  getDb()
    .prepare(
      "INSERT INTO spin_unlocks (jti, expires_at, used_at) VALUES (?, ?, NULL)",
    )
    .run(jti, expiresAt);
  const store = await cookies();
  store.set(SPIN_GATE_COOKIE, await signValue(`spinunlock.${jti}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_TTL_SEC,
  });
}

function unlockJti(value: string): string | null {
  const m = /^spinunlock\.([0-9a-f-]{36})$/.exec(value);
  return m ? m[1] : null;
}

/** Geçerli (süresi dolmamış VE henüz tüketilmemiş) bir unlock çerezi var mı? */
export async function hasUnlock(): Promise<boolean> {
  const store = await cookies();
  const value = await verifyValue(store.get(SPIN_GATE_COOKIE)?.value);
  const jti = value ? unlockJti(value) : null;
  if (!jti) return false;
  const row = getDb()
    .prepare("SELECT expires_at, used_at FROM spin_unlocks WHERE jti = ?")
    .get(jti) as { expires_at: number; used_at: number | null } | undefined;
  if (!row || row.used_at != null) return false;
  return row.expires_at > Date.now();
}

/** Bir çevirmede unlock'u sunucu tarafında da tüketir (tek kullanımlık) —
 *  yalnızca çerezi silmek yetmez, kopyalanmış bir çerez de artık geçersiz. */
export async function consumeUnlock(): Promise<void> {
  const store = await cookies();
  const value = await verifyValue(store.get(SPIN_GATE_COOKIE)?.value);
  const jti = value ? unlockJti(value) : null;
  if (jti) {
    getDb()
      .prepare("UPDATE spin_unlocks SET used_at = ? WHERE jti = ?")
      .run(Date.now(), jti);
  }
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
