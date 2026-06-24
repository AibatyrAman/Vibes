import "server-only";
import { getDb } from "./db";
import { getCustomer, type Customer } from "./customer-repo";
import { STAMPS_GOAL } from "./loyalty-constants";

export { STAMPS_GOAL } from "./loyalty-constants";
export { findCustomer, listCustomers } from "./customer-repo";
export type { Customer } from "./customer-repo";

/** +1 damga; 6'ya ulaşınca sıfırlanır ve 1 bedava hak eklenir. */
export function addPunch(customerId: number): Customer | null {
  const db = getDb();
  db.transaction(() => {
    const c = db
      .prepare("SELECT stamps FROM customers WHERE id=?")
      .get(customerId) as { stamps: number } | undefined;
    if (!c) return;
    const next = c.stamps + 1;
    if (next >= STAMPS_GOAL) {
      db.prepare(
        "UPDATE customers SET stamps=0, free_available=free_available+1 WHERE id=?",
      ).run(customerId);
    } else {
      db.prepare("UPDATE customers SET stamps=? WHERE id=?").run(next, customerId);
    }
    db.prepare(
      "INSERT INTO beer_log (customer_id, action) VALUES (?, 'punch')",
    ).run(customerId);
  })();
  return getCustomer(customerId);
}

/** Bedava hakkı kullanır (varsa). */
export function redeemFree(customerId: number): Customer | null {
  const db = getDb();
  db.transaction(() => {
    const c = db
      .prepare("SELECT free_available FROM customers WHERE id=?")
      .get(customerId) as { free_available: number } | undefined;
    if (!c || c.free_available <= 0) return;
    db.prepare(
      "UPDATE customers SET free_available=free_available-1 WHERE id=?",
    ).run(customerId);
    db.prepare(
      "INSERT INTO beer_log (customer_id, action) VALUES (?, 'redeem_free')",
    ).run(customerId);
  })();
  return getCustomer(customerId);
}

export function getCustomerCard(id: number): Customer | null {
  return getCustomer(id);
}
