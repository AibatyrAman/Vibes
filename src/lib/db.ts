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
    CREATE TABLE IF NOT EXISTS campaigns (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      description    TEXT,
      original_price REAL,
      price          REAL NOT NULL DEFAULT 0,
      active         INTEGER NOT NULL DEFAULT 1,
      position       INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS campaign_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity    INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_camp_items ON campaign_items(campaign_id);

    -- Müşteri hesapları (kullanıcı adı + telefon, SMS yok) — çark + bira defteri ortak kimlik.
    CREATE TABLE IF NOT EXISTS customers (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT UNIQUE NOT NULL,
      phone           TEXT UNIQUE NOT NULL,
      stamps          INTEGER NOT NULL DEFAULT 0,
      free_available  INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Çarkı Felek
    CREATE TABLE IF NOT EXISTS wheel_slots (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
      label       TEXT NOT NULL,
      reward_note TEXT,
      color       TEXT NOT NULL DEFAULT '#db1010',
      weight      INTEGER NOT NULL DEFAULT 1,
      position    INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS wheel_spins (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      slot_id      INTEGER REFERENCES wheel_slots(id) ON DELETE SET NULL,
      product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
      label        TEXT NOT NULL,
      prize_code   TEXT UNIQUE,
      won          INTEGER NOT NULL DEFAULT 0,
      spun_on      TEXT NOT NULL,
      redeemed     INTEGER NOT NULL DEFAULT 0,
      redeemed_at  TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_spin_code ON wheel_spins(prize_code);
    CREATE INDEX IF NOT EXISTS idx_spin_customer ON wheel_spins(customer_id);

    -- Bira Defteri (6+1) geçmişi
    CREATE TABLE IF NOT EXISTS beer_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      action      TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Anasayfa galerileri (admin yüklemeli)
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      gallery    TEXT NOT NULL,
      photo      TEXT NOT NULL,
      caption    TEXT,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_gallery ON gallery_photos(gallery);

    -- Çark alkol-kapısı QR token'larını tek kullanımlık yapar — bir token
    -- (fotoğrafı paylaşılsa bile) geçerlilik penceresi içinde yalnızca bir kez
    -- unlock üretebilir. spin-gate.ts.
    CREATE TABLE IF NOT EXISTS used_gate_tokens (
      token   TEXT PRIMARY KEY,
      used_at INTEGER NOT NULL
    );

    -- Unlock çerezini sunucu tarafında iptal edilebilir yapar — çerez
    -- kopyalansa bile bir kez tüketildikten sonra tekrar kullanılamaz.
    CREATE TABLE IF NOT EXISTS spin_unlocks (
      jti        TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      used_at    INTEGER
    );
  `);
  // varsayılan ayarlar (mevcut DB'lerde de oluşur)
  db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('chef_note', ?)",
  ).run("Tuzlu karamel cortado & portakallı kek.");
  db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('campaigns_enabled', '1')",
  ).run();
  db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('wheel_enabled', '1')",
  ).run();

  // İçecek Anatomisi — mevcut DB'lere kolonları idempotent ekle.
  addColumnIfMissing(db, "products", "glass_type", "TEXT");
  addColumnIfMissing(db, "products", "layers", "TEXT");
  addColumnIfMissing(db, "products", "photo", "TEXT");

  // Çark: görsel açı/genişlik (ağırlıktan bağımsız) — mevcut DB'lere idempotent ekle.
  addColumnIfMissing(db, "wheel_slots", "angle", "REAL NOT NULL DEFAULT 1");

  // Çark artık "günde 1" değil, QR/alkol kapısıyla sınırlı — eski günlük tekillik
  // kısıtını kaldır (mevcut DB'lerde de). Aynı gün birden çok geçerli QR ile
  // birden çok çevirme yapılabilmesi gerekiyor.
  db.exec("DROP INDEX IF EXISTS ux_spin_day");

  // Çark QR/alkol kapısı testi (ops.) — SPIN_TEST_PHONE env'de tanımlıysa o
  // numarayla giren müşteri QR'sız sınırsız çevirebilir. Prod'da boş bırak.
  // NOT: eskiden gerçek bir telefon numarası + hazır hesap repo'ya gömülüydü
  // (herkese açık, kalıcı bir kapı bypass'ıydı) — o ayar burada temizlenir;
  // ilişkili customers satırı (gerçek çevirme geçmişi taşıyabileceğinden)
  // silinmez, sadece "test hesabı" ayrıcalığı kaldırılır.
  const testPhone = process.env.SPIN_TEST_PHONE?.trim();
  if (testPhone) {
    db.prepare(
      `INSERT INTO settings (key, value) VALUES ('spin_test_phone', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(testPhone);
  } else {
    db.prepare(
      "DELETE FROM settings WHERE key = 'spin_test_phone' AND value = '05372877615'",
    ).run();
  }
}

/** Kolon yoksa ekler — `ALTER TABLE ... ADD COLUMN` idempotent migrasyon. */
function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  ddl: string,
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === column))
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
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
