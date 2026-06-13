import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { MENU, type Product } from "@/data/menu";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "vibes.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  _db = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT UNIQUE NOT NULL,
      title        TEXT NOT NULL,
      kicker       TEXT NOT NULL DEFAULT '',
      accent       TEXT NOT NULL DEFAULT 'navy',
      info_style   TEXT NOT NULL DEFAULT 'modal',
      note         TEXT,
      position     INTEGER NOT NULL DEFAULT 0,
      default_open INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      sub_group   TEXT,
      name        TEXT NOT NULL,
      description TEXT,
      price       REAL NOT NULL DEFAULT 0,
      variants    TEXT,                       -- JSON [{label,price}]
      on_sale     INTEGER NOT NULL DEFAULT 0,
      sale_price  REAL,
      is_new      INTEGER NOT NULL DEFAULT 0,
      tag         TEXT,
      ingredients TEXT,                        -- JSON string[]
      allergens   TEXT,                        -- JSON string[]
      abv         REAL,
      kcal        INTEGER,
      story       TEXT,
      position    INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  // varsayılan şef önerisi (mevcut DB'lerde de oluşur)
  db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('chef_note', ?)",
  ).run("Tuzlu karamel cortado & portakallı kek.");
}

/** İlk açılışta menü.ts'teki mevcut menüyü DB'ye taşır. */
function seedIfEmpty(db: Database.Database) {
  const row = db.prepare("SELECT COUNT(*) AS n FROM categories").get() as {
    n: number;
  };
  if (row.n > 0) return;

  const insCat = db.prepare(
    `INSERT INTO categories (slug,title,kicker,accent,info_style,note,position,default_open)
     VALUES (@slug,@title,@kicker,@accent,@info_style,@note,@position,@default_open)`,
  );
  const insProd = db.prepare(
    `INSERT INTO products
       (category_id,sub_group,name,description,price,variants,on_sale,sale_price,is_new,tag,ingredients,allergens,abv,kcal,story,position)
     VALUES
       (@category_id,@sub_group,@name,@description,@price,@variants,0,NULL,@is_new,@tag,@ingredients,@allergens,@abv,@kcal,@story,@position)`,
  );

  const seed = db.transaction(() => {
    MENU.forEach((cat, ci) => {
      const res = insCat.run({
        slug: cat.id,
        title: cat.title,
        kicker: cat.kicker,
        accent: cat.accent,
        info_style: cat.infoStyle ?? "modal",
        note: cat.note ?? null,
        position: ci,
        default_open: cat.defaultOpen ? 1 : 0,
      });
      const categoryId = Number(res.lastInsertRowid);
      let pos = 0;
      const addProduct = (p: Product, subGroup: string | null) => {
        const variants = Array.isArray(p.price) ? p.price : null;
        const price = Array.isArray(p.price) ? p.price[0]?.price ?? 0 : p.price;
        insProd.run({
          category_id: categoryId,
          sub_group: subGroup,
          name: p.name,
          description: p.desc ?? null,
          price,
          variants: variants ? JSON.stringify(variants) : null,
          is_new: p.isNew ? 1 : 0,
          tag: p.tag ?? null,
          ingredients: p.ingredients ? JSON.stringify(p.ingredients) : null,
          allergens: p.allergens ? JSON.stringify(p.allergens) : null,
          abv: p.abv ?? null,
          kcal: p.kcal ?? null,
          story: p.story ?? null,
          position: pos++,
        });
      };
      cat.items?.forEach((p) => addProduct(p, null));
      cat.groups?.forEach((g) => g.items.forEach((p) => addProduct(p, g.label)));
    });
  });
  seed();
}
