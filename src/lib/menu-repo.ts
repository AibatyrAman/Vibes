import "server-only";
import { getDb } from "./db";
import type { Allergen, Category, PriceVariant, Product } from "@/data/menu";

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
        (category_id,sub_group,name,description,price,variants,on_sale,sale_price,is_new,tag,ingredients,allergens,abv,kcal,story,position)
       VALUES
        (@category_id,@sub_group,@name,@description,@price,@variants,@on_sale,@sale_price,@is_new,@tag,@ingredients,@allergens,@abv,@kcal,@story,@position)`,
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
        abv=@abv, kcal=@kcal, story=@story
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
    title: string;
    kicker: string;
    accent: "navy" | "red";
    infoStyle: "modal" | "sheet" | "inline";
    note?: string | null;
  },
): void {
  getDb()
    .prepare(
      `UPDATE categories SET title=@title, kicker=@kicker, accent=@accent, info_style=@info_style, note=@note WHERE id=@id`,
    )
    .run({
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
