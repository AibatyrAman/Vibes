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

// next.config.ts serverActions.bodySizeLimit (10mb) ve nginx
// client_max_body_size (10m) altında kalmalı.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// `file.type` istemci kontrollüdür (tarayıcı MIME algısına dayanır, güvenilmez);
// gerçek dosya içeriğini ilk baytlardan doğrular.
const MAGIC_CHECK: Record<string, (buf: Buffer) => boolean> = {
  png: (b) =>
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47,
  jpg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) =>
    b.length >= 12 &&
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP",
};

export type SaveUploadResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

/** Dosyayı uploads klasörüne yazar, üretilen dosya adını döndürür. */
export async function saveUpload(file: File): Promise<SaveUploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "Dosya boş." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Dosya çok büyük (maksimum ${MAX_UPLOAD_BYTES / 1024 / 1024}MB).`,
    };
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return { ok: false, error: "Sadece PNG, WEBP veya JPG yükleyebilirsin." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!MAGIC_CHECK[ext](buf)) {
    return {
      ok: false,
      error: "Dosya içeriği beklenen resim formatıyla eşleşmiyor.",
    };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { ok: true, name };
}

export async function deleteUpload(name: string | null | undefined) {
  if (!name) return;
  const safe = path.basename(name);
  await fs.rm(path.join(UPLOAD_DIR, safe), { force: true }).catch(() => {});
}
