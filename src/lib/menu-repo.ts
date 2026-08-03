import "server-only";
import { getDb } from "./db";
import type {
  Allergen,
  Category,
  DrinkLayer,
  GlassType,
  PriceVariant,
  Product,
} from "@/data/menu";
import { parsePoints, type Point } from "./glass-cavity";

type ProductRow = {
  id: number;
  category_id: number;
  sub_group: string | null;
  name: string;
  description: string | null;
  price: number;
  variants: string | null;
  on_sale: number;
  sale_price: number | null;
  is_new: number;
  tag: string | null;
  ingredients: string | null;
  allergens: string | null;
  abv: number | null;
  kcal: number | null;
  story: string | null;
  glass_type: string | null;
  layers: string | null;
  photo: string | null;
  position: number;
};

type CategoryRow = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  info_style: "modal" | "sheet" | "inline";
  note: string | null;
  position: number;
  default_open: number;
};

export type AdminCategory = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  infoStyle: "modal" | "sheet" | "inline";
  note: string | null;
  position: number;
  defaultOpen: boolean;
};

export type AdminProduct = {
  id: number;
  categoryId: number;
  categoryTitle: string;
  subGroup: string | null;
  name: string;
  description: string | null;
  price: number;
  variants: PriceVariant[] | null;
  onSale: boolean;
  salePrice: number | null;
  isNew: boolean;
  tag: string | null;
  ingredients: string[];
  allergens: Allergen[];
  abv: number | null;
  kcal: number | null;
  story: string | null;
  glassType: GlassType | null;
  layers: DrinkLayer[];
  photo: string | null;
  position: number;
};

export type ProductInput = Omit<
  AdminProduct,
  "id" | "categoryTitle" | "position"
>;

const parseArr = <T,>(s: string | null): T[] =>
  s ? (JSON.parse(s) as T[]) : [];

function toPublicProduct(r: ProductRow): Product {
  const variants = r.variants
    ? (JSON.parse(r.variants) as PriceVariant[])
    : null;
  return {
    id: r.id,
    name: r.name,
    desc: r.description ?? undefined,
    price: variants ?? r.price,
    isNew: !!r.is_new,
    tag: r.tag ?? undefined,
    onSale: !!r.on_sale,
    salePrice: r.sale_price ?? undefined,
    ingredients: r.ingredients ? parseArr<string>(r.ingredients) : undefined,
    allergens: r.allergens ? parseArr<Allergen>(r.allergens) : undefined,
    abv: r.abv ?? undefined,
    kcal: r.kcal ?? undefined,
    story: r.story ?? undefined,
    glassType: (r.glass_type as GlassType | null) ?? undefined,
    layers: r.layers ? parseArr<DrinkLayer>(r.layers) : undefined,
    photo: r.photo ?? undefined,
  };
}

/** Public menü (anasayfa). */
export function getMenu(): Category[] {
  const db = getDb();
  const cats = db
    .prepare("SELECT * FROM categories ORDER BY position, id")
    .all() as CategoryRow[];
  const prodStmt = db.prepare(
    "SELECT * FROM products WHERE category_id = ? ORDER BY position, id",
  );

  return cats.map((c) => {
    const rows = prodStmt.all(c.id) as ProductRow[];
    const items = rows.filter((r) => !r.sub_group).map(toPublicProduct);

    const order: string[] = [];
    const map = new Map<string, Product[]>();
    for (const r of rows) {
      if (!r.sub_group) continue;
      if (!map.has(r.sub_group)) {
        map.set(r.sub_group, []);
        order.push(r.sub_group);
      }
      map.get(r.sub_group)!.push(toPublicProduct(r));
    }
    const groups = order.map((label) => ({ label, items: map.get(label)! }));

    return {
      id: c.slug,
      title: c.title,
      kicker: c.kicker,
      accent: c.accent,
      defaultOpen: !!c.default_open,
      infoStyle: c.info_style,
      note: c.note ?? undefined,
      items: items.length ? items : undefined,
      groups: groups.length ? groups : undefined,
    } satisfies Category;
  });
}

// ---------- admin reads ----------

export function listCategories(): AdminCategory[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM categories ORDER BY position, id")
    .all() as CategoryRow[];
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    kicker: c.kicker,
    accent: c.accent,
    infoStyle: c.info_style,
    note: c.note,
    position: c.position,
    defaultOpen: !!c.default_open,
  }));
}

function toAdminProduct(r: ProductRow & { category_title?: string }): AdminProduct {
  return {
    id: r.id,
    categoryId: r.category_id,
    categoryTitle: r.category_title ?? "",
    subGroup: r.sub_group,
    name: r.name,
    description: r.description,
    price: r.price,
    variants: r.variants ? (JSON.parse(r.variants) as PriceVariant[]) : null,
    onSale: !!r.on_sale,
    salePrice: r.sale_price,
    isNew: !!r.is_new,
    tag: r.tag,
    ingredients: parseArr<string>(r.ingredients),
    allergens: parseArr<Allergen>(r.allergens),
    abv: r.abv,
    kcal: r.kcal,
    story: r.story,
    glassType: (r.glass_type as GlassType | null) ?? null,
    layers: parseArr<DrinkLayer>(r.layers),
    photo: r.photo,
    position: r.position,
  };
}

/** Fiyat tablosu için: tüm ürünler, kategori sırasına göre. */
export function listProductsFlat(): AdminProduct[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.*, c.title AS category_title, c.position AS cat_pos
         FROM products p JOIN categories c ON c.id = p.category_id
        ORDER BY c.position, c.id, p.position, p.id`,
    )
    .all() as (ProductRow & { category_title: string })[];
  return rows.map(toAdminProduct);
}

export function getProduct(id: number): AdminProduct | null {
  const db = getDb();
  const r = db
    .prepare(
      `SELECT p.*, c.title AS category_title
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?`,
    )
    .get(id) as (ProductRow & { category_title: string }) | undefined;
  return r ? toAdminProduct(r) : null;
}

// ---------- admin writes ----------

function productParams(input: ProductInput) {
  return {
    category_id: input.categoryId,
    sub_group: input.subGroup || null,
    name: input.name,
    description: input.description || null,
    price: input.price,
    variants:
      input.variants && input.variants.length
        ? JSON.stringify(input.variants)
        : null,
    on_sale: input.onSale ? 1 : 0,
    sale_price: input.salePrice ?? null,
    is_new: input.isNew ? 1 : 0,
    tag: input.tag || null,
    ingredients: input.ingredients?.length
      ? JSON.stringify(input.ingredients)
      : null,
    allergens: input.allergens?.length
      ? JSON.stringify(input.allergens)
      : null,
    abv: input.abv ?? null,
    kcal: input.kcal ?? null,
    story: input.story || null,
    glass_type: input.glassType || null,
    layers: input.layers?.length ? JSON.stringify(input.layers) : null,
    photo: input.photo || null,
  };
}

export function createProduct(input: ProductInput): number {
  const db = getDb();
  const pos =
    (
      db
        .prepare(
          "SELECT COALESCE(MAX(position),-1)+1 AS p FROM products WHERE category_id = ?",
        )
        .get(input.categoryId) as { p: number }
    ).p ?? 0;
  const res = db
    .prepare(
      `INSERT INTO products
        (category_id,sub_group,name,description,price,variants,on_sale,sale_price,is_new,tag,ingredients,allergens,abv,kcal,story,glass_type,layers,photo,position)
       VALUES
        (@category_id,@sub_group,@name,@description,@price,@variants,@on_sale,@sale_price,@is_new,@tag,@ingredients,@allergens,@abv,@kcal,@story,@glass_type,@layers,@photo,@position)`,
    )
    .run({ ...productParams(input), position: pos });
  return Number(res.lastInsertRowid);
}

export function updateProduct(id: number, input: ProductInput): void {
  getDb()
    .prepare(
      `UPDATE products SET
        category_id=@category_id, sub_group=@sub_group, name=@name, description=@description,
        price=@price, variants=@variants, on_sale=@on_sale, sale_price=@sale_price,
        is_new=@is_new, tag=@tag, ingredients=@ingredients, allergens=@allergens,
        abv=@abv, kcal=@kcal, story=@story,
        glass_type=@glass_type, layers=@layers, photo=@photo
       WHERE id=@id`,
    )
    .run({ ...productParams(input), id });
}

/** Tablodan hızlı güncelleme (fiyat / indirim / yeni). */
export function quickUpdateProduct(
  id: number,
  patch: { price?: number; onSale?: boolean; salePrice?: number | null; isNew?: boolean },
): void {
  const db = getDb();
  if (patch.price !== undefined)
    db.prepare("UPDATE products SET price=? WHERE id=?").run(patch.price, id);
  if (patch.onSale !== undefined)
    db.prepare("UPDATE products SET on_sale=? WHERE id=?").run(
      patch.onSale ? 1 : 0,
      id,
    );
  if (patch.salePrice !== undefined)
    db.prepare("UPDATE products SET sale_price=? WHERE id=?").run(
      patch.salePrice,
      id,
    );
  if (patch.isNew !== undefined)
    db.prepare("UPDATE products SET is_new=? WHERE id=?").run(
      patch.isNew ? 1 : 0,
      id,
    );
}

export function deleteProduct(id: number): void {
  getDb().prepare("DELETE FROM products WHERE id=?").run(id);
}

/** Ürünü kendi kategorisi içinde bir sıra yukarı/aşağı taşır. */
export function moveProduct(id: number, dir: -1 | 1): void {
  const db = getDb();
  const row = db.prepare("SELECT category_id FROM products WHERE id=?").get(id) as
    | { category_id: number }
    | undefined;
  if (!row) return;
  const ids = (
    db
      .prepare(
        "SELECT id FROM products WHERE category_id=? ORDER BY position, id",
      )
      .all(row.category_id) as { id: number }[]
  ).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const upd = db.prepare("UPDATE products SET position=? WHERE id=?");
  db.transaction(() => ids.forEach((pid, idx) => upd.run(idx, pid)))();
}

export function createCategory(input: {
  slug: string;
  title: string;
  kicker: string;
  accent: "navy" | "red";
  infoStyle: "modal" | "sheet" | "inline";
  note?: string | null;
}): number {
  const db = getDb();
  const pos =
    (
      db
        .prepare("SELECT COALESCE(MAX(position),-1)+1 AS p FROM categories")
        .get() as { p: number }
    ).p ?? 0;
  const res = db
    .prepare(
      `INSERT INTO categories (slug,title,kicker,accent,info_style,note,position,default_open)
       VALUES (@slug,@title,@kicker,@accent,@info_style,@note,@position,0)`,
    )
    .run({
      slug: input.slug,
      title: input.title,
      kicker: input.kicker,
      accent: input.accent,
      info_style: input.infoStyle,
      note: input.note || null,
      position: pos,
    });
  return Number(res.lastInsertRowid);
}

export function updateCategory(
  id: number,
  input: {
    slug: string;
    title: string;
    kicker: string;
    accent: "navy" | "red";
    infoStyle: "modal" | "sheet" | "inline";
    note?: string | null;
  },
): void {
  getDb()
    .prepare(
      `UPDATE categories SET slug=@slug, title=@title, kicker=@kicker, accent=@accent, info_style=@info_style, note=@note WHERE id=@id`,
    )
    .run({
      slug: input.slug,
      title: input.title,
      kicker: input.kicker,
      accent: input.accent,
      info_style: input.infoStyle,
      note: input.note || null,
      id,
    });
}

export function deleteCategory(id: number): void {
  getDb().prepare("DELETE FROM categories WHERE id=?").run(id);
}

/** Kategoriyi bir sıra yukarı/aşağı taşır (menü sırasını değiştirir). */
export function moveCategory(id: number, dir: -1 | 1): void {
  const db = getDb();
  const ids = (
    db.prepare("SELECT id FROM categories ORDER BY position, id").all() as {
      id: number;
    }[]
  ).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const upd = db.prepare("UPDATE categories SET position=? WHERE id=?");
  db.transaction(() => ids.forEach((cid, idx) => upd.run(idx, cid)))();
}

// ---------- ayarlar (anahtar/değer) ----------

export function getSetting(key: string, fallback = ""): string {
  const r = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return r?.value ?? fallback;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

// ---------- bardak dolum poligonları (kalibrasyon override'ları) ----------

/** settings'teki tüm `glass_cav_*` override'larını { type: Point[] } döndürür. */
export function getGlassCavities(): Record<string, Point[]> {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings WHERE key LIKE 'glass_cav_%'")
    .all() as { key: string; value: string }[];
  const out: Record<string, Point[]> = {};
  for (const r of rows) {
    const pts = parsePoints(r.value);
    if (pts && pts.length >= 3) out[r.key.replace("glass_cav_", "")] = pts;
  }
  return out;
}

// ---------- kampanyalar ----------

type CampaignRow = {
  id: number;
  name: string;
  description: string | null;
  original_price: number | null;
  price: number;
  active: number;
  position: number;
};

export type CampaignItem = {
  productId: number;
  quantity: number;
  productName: string;
};

export type AdminCampaign = {
  id: number;
  name: string;
  description: string | null;
  originalPrice: number | null;
  price: number;
  active: boolean;
  position: number;
  items: CampaignItem[];
};

export type CampaignInput = {
  name: string;
  description: string | null;
  originalPrice: number | null;
  price: number;
  active: boolean;
  items: { productId: number; quantity: number }[];
};

function withItems(
  db: ReturnType<typeof getDb>,
  row: CampaignRow,
): AdminCampaign {
  const items = db
    .prepare(
      `SELECT ci.product_id, ci.quantity, p.name AS product_name
         FROM campaign_items ci JOIN products p ON p.id = ci.product_id
        WHERE ci.campaign_id = ? ORDER BY ci.id`,
    )
    .all(row.id) as { product_id: number; quantity: number; product_name: string }[];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    originalPrice: row.original_price,
    price: row.price,
    active: !!row.active,
    position: row.position,
    items: items.map((i) => ({
      productId: i.product_id,
      quantity: i.quantity,
      productName: i.product_name,
    })),
  };
}

function insertCampaignItems(
  db: ReturnType<typeof getDb>,
  campaignId: number,
  items: { productId: number; quantity: number }[],
) {
  const stmt = db.prepare(
    "INSERT INTO campaign_items (campaign_id, product_id, quantity) VALUES (?, ?, ?)",
  );
  for (const it of items)
    if (it.productId && it.quantity > 0)
      stmt.run(campaignId, it.productId, it.quantity);
}

export function getActiveCampaigns(): AdminCampaign[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM campaigns WHERE active = 1 ORDER BY position, id")
    .all() as CampaignRow[];
  return rows.map((r) => withItems(db, r));
}

export function listCampaigns(): AdminCampaign[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM campaigns ORDER BY position, id")
    .all() as CampaignRow[];
  return rows.map((r) => withItems(db, r));
}

export function getCampaign(id: number): AdminCampaign | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id) as
    | CampaignRow
    | undefined;
  return r ? withItems(db, r) : null;
}

export function createCampaign(input: CampaignInput): number {
  const db = getDb();
  const pos =
    (db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS p FROM campaigns").get() as {
      p: number;
    }).p ?? 0;
  return db.transaction(() => {
    const res = db
      .prepare(
        "INSERT INTO campaigns (name,description,original_price,price,active,position) VALUES (?,?,?,?,?,?)",
      )
      .run(
        input.name,
        input.description || null,
        input.originalPrice ?? null,
        input.price,
        input.active ? 1 : 0,
        pos,
      );
    const cid = Number(res.lastInsertRowid);
    insertCampaignItems(db, cid, input.items);
    return cid;
  })();
}

export function updateCampaign(id: number, input: CampaignInput): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      "UPDATE campaigns SET name=?, description=?, original_price=?, price=?, active=? WHERE id=?",
    ).run(
      input.name,
      input.description || null,
      input.originalPrice ?? null,
      input.price,
      input.active ? 1 : 0,
      id,
    );
    db.prepare("DELETE FROM campaign_items WHERE campaign_id = ?").run(id);
    insertCampaignItems(db, id, input.items);
  })();
}

export function deleteCampaign(id: number): void {
  getDb().prepare("DELETE FROM campaigns WHERE id=?").run(id);
}

export function setCampaignActive(id: number, active: boolean): void {
  getDb()
    .prepare("UPDATE campaigns SET active=? WHERE id=?")
    .run(active ? 1 : 0, id);
}
