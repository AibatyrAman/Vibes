import "server-only";
import { getDb } from "./db";

export type Customer = {
  id: number;
  username: string;
  phone: string;
  stamps: number;
  freeAvailable: number;
  createdAt: string;
};

type CustomerRow = {
  id: number;
  username: string;
  phone: string;
  stamps: number;
  free_available: number;
  created_at: string;
};

function toCustomer(r: CustomerRow): Customer {
  return {
    id: r.id,
    username: r.username,
    phone: r.phone,
    stamps: r.stamps,
    freeAvailable: r.free_available,
    createdAt: r.created_at,
  };
}

export function getCustomer(id: number): Customer | null {
  const r = getDb()
    .prepare("SELECT * FROM customers WHERE id = ?")
    .get(id) as CustomerRow | undefined;
  return r ? toCustomer(r) : null;
}

export function findByUsername(username: string): Customer | null {
  const r = getDb()
    .prepare("SELECT * FROM customers WHERE username = ?")
    .get(username) as CustomerRow | undefined;
  return r ? toCustomer(r) : null;
}

export function findByPhone(phone: string): Customer | null {
  const r = getDb()
    .prepare("SELECT * FROM customers WHERE phone = ?")
    .get(phone) as CustomerRow | undefined;
  return r ? toCustomer(r) : null;
}

/** Kullanıcı adı/telefon ile arar (bira defteri admin araması için). */
export function findCustomer(query: string): Customer | null {
  const q = query.trim();
  if (!q) return null;
  return findByUsername(q) ?? findByPhone(q);
}

export function listCustomers(): Customer[] {
  const rows = getDb()
    .prepare("SELECT * FROM customers ORDER BY created_at DESC")
    .all() as CustomerRow[];
  return rows.map(toCustomer);
}

export type RegisterResult =
  | { ok: true; customer: Customer }
  | { ok: false; error: string };

/**
 * Kayıt/giriş tek akış: kullanıcı adı yoksa yeni hesap açar; varsa telefonun
 * eşleştiğini doğrular (giriş). Telefon başka bir hesaba aitse hata döner.
 */
export function registerOrLogin(
  username: string,
  phone: string,
): RegisterResult {
  const uname = username.trim();
  const ph = phone.trim();
  if (!uname || !ph) return { ok: false, error: "Kullanıcı adı ve telefon gerekli." };

  const byUsername = findByUsername(uname);
  if (byUsername) {
    if (byUsername.phone !== ph)
      return { ok: false, error: "Bu kullanıcı adı farklı bir telefonla kayıtlı." };
    return { ok: true, customer: byUsername };
  }

  const byPhone = findByPhone(ph);
  if (byPhone)
    return { ok: false, error: "Bu telefon numarası başka bir kullanıcı adıyla kayıtlı." };

  const res = getDb()
    .prepare("INSERT INTO customers (username, phone) VALUES (?, ?)")
    .run(uname, ph);
  return { ok: true, customer: getCustomer(Number(res.lastInsertRowid))! };
}
