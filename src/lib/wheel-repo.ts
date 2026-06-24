import "server-only";
import crypto from "node:crypto";
import { getDb } from "./db";

/** İstanbul saatine göre bugünün tarihi (YYYY-MM-DD) — günde-1 kontrolü için. */
export function todayIstanbul(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

export type WheelSlot = {
  id: number;
  productId: number | null;
  productName: string | null;
  label: string;
  rewardNote: string | null;
  color: string;
  weight: number;
  position: number;
};

type SlotRow = {
  id: number;
  product_id: number | null;
  label: string;
  reward_note: string | null;
  color: string;
  weight: number;
  position: number;
  product_name?: string | null;
};

function toSlot(r: SlotRow): WheelSlot {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name ?? null,
    label: r.label,
    rewardNote: r.reward_note,
    color: r.color,
    weight: r.weight,
    position: r.position,
  };
}

export function getWheelSlots(): WheelSlot[] {
  const rows = getDb()
    .prepare(
      `SELECT s.*, p.name AS product_name
         FROM wheel_slots s LEFT JOIN products p ON p.id = s.product_id
        ORDER BY s.position, s.id`,
    )
    .all() as SlotRow[];
  return rows.map(toSlot);
}

export type WheelSlotInput = {
  productId: number | null;
  label: string;
  rewardNote: string | null;
  color: string;
  weight: number;
};

export function createWheelSlot(input: WheelSlotInput): number {
  const db = getDb();
  const pos =
    (db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS p FROM wheel_slots").get() as {
      p: number;
    }).p ?? 0;
  const res = db
    .prepare(
      `INSERT INTO wheel_slots (product_id, label, reward_note, color, weight, position)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.productId,
      input.label,
      input.rewardNote,
      input.color,
      Math.max(1, input.weight),
      pos,
    );
  return Number(res.lastInsertRowid);
}

export function updateWheelSlot(id: number, input: WheelSlotInput): void {
  getDb()
    .prepare(
      `UPDATE wheel_slots SET product_id=?, label=?, reward_note=?, color=?, weight=?
       WHERE id=?`,
    )
    .run(
      input.productId,
      input.label,
      input.rewardNote,
      input.color,
      Math.max(1, input.weight),
      id,
    );
}

export function deleteWheelSlot(id: number): void {
  getDb().prepare("DELETE FROM wheel_slots WHERE id=?").run(id);
}

/** Slot'u bir sıra yukarı/aşağı taşır. */
export function moveWheelSlot(id: number, dir: -1 | 1): void {
  const db = getDb();
  const ids = (
    db.prepare("SELECT id FROM wheel_slots ORDER BY position, id").all() as {
      id: number;
    }[]
  ).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const upd = db.prepare("UPDATE wheel_slots SET position=? WHERE id=?");
  db.transaction(() => ids.forEach((sid, idx) => upd.run(idx, sid)))();
}

export type SpinResult = {
  slotId: number | null;
  slotIndex: number;
  label: string;
  productName: string | null;
  won: boolean;
  prizeCode: string | null;
  alreadySpunToday: boolean;
};

/** Bugünün spin'i varsa onu döndürür (tekrar çevirtmemek için). */
export function getTodaySpin(customerId: number): SpinResult | null {
  const slots = getWheelSlots();
  const row = getDb()
    .prepare(
      "SELECT * FROM wheel_spins WHERE customer_id=? AND spun_on=?",
    )
    .get(customerId, todayIstanbul()) as
    | {
        slot_id: number | null;
        label: string;
        product_id: number | null;
        won: number;
        prize_code: string | null;
      }
    | undefined;
  if (!row) return null;
  const slotIndex = slots.findIndex((s) => s.id === row.slot_id);
  return {
    slotId: row.slot_id,
    slotIndex: slotIndex >= 0 ? slotIndex : 0,
    label: row.label,
    productName: slots.find((s) => s.id === row.slot_id)?.productName ?? null,
    won: !!row.won,
    prizeCode: row.prize_code,
    alreadySpunToday: true,
  };
}

/**
 * Çevirir: sunucu tarafı ağırlıklı rastgele seçim yapar, günde-1 kuralını
 * UNIQUE(customer_id, spun_on) ile garantiler (çakışırsa bugünün sonucu döner).
 */
export function spin(customerId: number): SpinResult {
  const existing = getTodaySpin(customerId);
  if (existing) return existing;

  const slots = getWheelSlots();
  if (slots.length === 0)
    throw new Error("Çark boş — admin panelden slot ekleyin.");

  const totalWeight = slots.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * totalWeight;
  let chosen = slots[0];
  let chosenIndex = 0;
  for (let i = 0; i < slots.length; i++) {
    r -= slots[i].weight;
    if (r <= 0) {
      chosen = slots[i];
      chosenIndex = i;
      break;
    }
  }

  const won = chosen.productId != null;
  const prizeCode = won ? crypto.randomBytes(4).toString("hex").toUpperCase() : null;
  const today = todayIstanbul();

  try {
    getDb()
      .prepare(
        `INSERT INTO wheel_spins (customer_id, slot_id, product_id, label, prize_code, won, spun_on)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(customerId, chosen.id, chosen.productId, chosen.label, prizeCode, won ? 1 : 0, today);
  } catch {
    // UNIQUE(customer_id, spun_on) çakışması — yarış durumu, bugünün sonucunu döndür.
    return getTodaySpin(customerId)!;
  }

  return {
    slotId: chosen.id,
    slotIndex: chosenIndex,
    label: chosen.label,
    productName: chosen.productName,
    won,
    prizeCode,
    alreadySpunToday: false,
  };
}

export type WheelWin = {
  id: number;
  customerUsername: string;
  label: string;
  prizeCode: string;
  redeemed: boolean;
  createdAt: string;
};

export function listRecentWins(limit = 30): WheelWin[] {
  const rows = getDb()
    .prepare(
      `SELECT w.id, c.username AS customer_username, w.label, w.prize_code,
              w.redeemed, w.created_at
         FROM wheel_spins w JOIN customers c ON c.id = w.customer_id
        WHERE w.won = 1
        ORDER BY w.created_at DESC LIMIT ?`,
    )
    .all(limit) as {
    id: number;
    customer_username: string;
    label: string;
    prize_code: string;
    redeemed: number;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    customerUsername: r.customer_username,
    label: r.label,
    prizeCode: r.prize_code,
    redeemed: !!r.redeemed,
    createdAt: r.created_at,
  }));
}

export type RedeemResult =
  | { ok: true; win: WheelWin }
  | { ok: false; error: string };

/** Garson kodu doğrular ve "kullanıldı" işaretler — tek kullanımlık. */
export function redeemPrize(code: string): RedeemResult {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT w.id, c.username AS customer_username, w.label, w.prize_code,
              w.redeemed, w.created_at
         FROM wheel_spins w JOIN customers c ON c.id = w.customer_id
        WHERE w.prize_code = ? AND w.won = 1`,
    )
    .get(code.trim().toUpperCase()) as
    | {
        id: number;
        customer_username: string;
        label: string;
        prize_code: string;
        redeemed: number;
        created_at: string;
      }
    | undefined;
  if (!row) return { ok: false, error: "Kod bulunamadı." };
  if (row.redeemed) return { ok: false, error: "Bu kod zaten kullanıldı." };

  db.prepare(
    "UPDATE wheel_spins SET redeemed=1, redeemed_at=datetime('now') WHERE id=?",
  ).run(row.id);

  return {
    ok: true,
    win: {
      id: row.id,
      customerUsername: row.customer_username,
      label: row.label,
      prizeCode: row.prize_code,
      redeemed: true,
      createdAt: row.created_at,
    },
  };
}
