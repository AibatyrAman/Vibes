import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/** Yüklenen dosyalar DB ile aynı kalıcı kökte (`data/uploads`) tutulur —
 *  repo dışı, deploy'larda korunur. /api/media/<name> ile servis edilir. */
const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "vibes.db");

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(path.dirname(DB_PATH), "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

export const MEDIA_CONTENT_TYPE: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
};

/** Dosyayı uploads klasörüne yazar, üretilen dosya adını döndürür. */
export async function saveUpload(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return null; // sadece png/webp/jpg
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return name;
}

export async function deleteUpload(name: string | null | undefined) {
  if (!name) return;
  const safe = path.basename(name);
  await fs.rm(path.join(UPLOAD_DIR, safe), { force: true }).catch(() => {});
}
