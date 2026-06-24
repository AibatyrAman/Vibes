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
  /** Görsel dilim genişliği — kazanma şansını etkilemez, sadece çarktaki boyutu. */
  angle: number;
  position: number;
};

type SlotRow = {
  id: number;
  product_id: number | null;
  label: string;
  reward_note: string | null;
  color: string;
  weight: number;
  angle: number;
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
    angle: r.angle,
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
  angle: number;
};

export function createWheelSlot(input: WheelSlotInput): number {
  const db = getDb();
  const pos =
    (db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS p FROM wheel_slots").get() as {
      p: number;
    }).p ?? 0;
  const res = db
    .prepare(
      `INSERT INTO wheel_slots (product_id, label, reward_note, color, weight, angle, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.productId,
      input.label,
      input.rewardNote,
      input.color,
      Math.max(1, input.weight),
      Math.max(0.1, input.angle),
      pos,
    );
  return Number(res.lastInsertRowid);
}

export function updateWheelSlot(id: number, input: WheelSlotInput): void {
  getDb()
    .prepare(
      `UPDATE wheel_slots SET product_id=?, label=?, reward_note=?, color=?, weight=?, angle=?
       WHERE id=?`,
    )
    .run(
      input.productId,
      input.label,
      input.rewardNote,
      input.color,
      Math.max(1, input.weight),
      Math.max(0.1, input.angle),
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
};

export type PendingPrize = {
  id: number;
  label: string;
  prizeCode: string;
  createdAt: string;
};

/** Müşterinin henüz garsona göstermediği (kullanılmamış) kazanım kodları. */
export function getPendingPrizes(customerId: number): PendingPrize[] {
  const rows = getDb()
    .prepare(
      `SELECT id, label, prize_code, created_at FROM wheel_spins
        WHERE customer_id=? AND won=1 AND redeemed=0
        ORDER BY created_at DESC`,
    )
    .all(customerId) as {
    id: number;
    label: string;
    prize_code: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    prizeCode: r.prize_code,
    createdAt: r.created_at,
  }));
}

/**
 * Çevirir: sunucu tarafı ağırlıklı rastgele seçim yapar. Çevirme hakkı
 * QR/alkol kapısı (spin-gate.ts) tarafından kontrol edilir — burada günlük
 * bir sınır YOKTUR, her çağrı bir spin kaydı oluşturur.
 */
export function spin(customerId: number): SpinResult {
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

  getDb()
    .prepare(
      `INSERT INTO wheel_spins (customer_id, slot_id, product_id, label, prize_code, won, spun_on)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      customerId,
      chosen.id,
      chosen.productId,
      chosen.label,
      prizeCode,
      won ? 1 : 0,
      todayIstanbul(),
    );

  return {
    slotId: chosen.id,
    slotIndex: chosenIndex,
    label: chosen.label,
    productName: chosen.productName,
    won,
    prizeCode,
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
