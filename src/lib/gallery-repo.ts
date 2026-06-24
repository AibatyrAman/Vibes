import "server-only";
import { getDb } from "./db";

export type GalleryName = "kareler" | "yakalayanlar";

export type GalleryPhoto = {
  id: number;
  gallery: GalleryName;
  photo: string;
  caption: string | null;
  position: number;
};

type Row = {
  id: number;
  gallery: string;
  photo: string;
  caption: string | null;
  position: number;
};

const toPhoto = (r: Row): GalleryPhoto => ({
  id: r.id,
  gallery: r.gallery as GalleryName,
  photo: r.photo,
  caption: r.caption,
  position: r.position,
});

export function getGallery(gallery: GalleryName): GalleryPhoto[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM gallery_photos WHERE gallery=? ORDER BY position, id",
    )
    .all(gallery) as Row[];
  return rows.map(toPhoto);
}

export function listAllGalleryPhotos(): GalleryPhoto[] {
  const rows = getDb()
    .prepare("SELECT * FROM gallery_photos ORDER BY gallery, position, id")
    .all() as Row[];
  return rows.map(toPhoto);
}

export function addGalleryPhoto(
  gallery: GalleryName,
  photo: string,
  caption: string | null,
): number {
  const db = getDb();
  const pos =
    (
      db
        .prepare(
          "SELECT COALESCE(MAX(position),-1)+1 AS p FROM gallery_photos WHERE gallery=?",
        )
        .get(gallery) as { p: number }
    ).p ?? 0;
  const res = db
    .prepare(
      "INSERT INTO gallery_photos (gallery, photo, caption, position) VALUES (?, ?, ?, ?)",
    )
    .run(gallery, photo, caption, pos);
  return Number(res.lastInsertRowid);
}

export function getGalleryPhoto(id: number): GalleryPhoto | null {
  const r = getDb()
    .prepare("SELECT * FROM gallery_photos WHERE id=?")
    .get(id) as Row | undefined;
  return r ? toPhoto(r) : null;
}

export function deleteGalleryPhoto(id: number): void {
  getDb().prepare("DELETE FROM gallery_photos WHERE id=?").run(id);
}

export function moveGalleryPhoto(id: number, dir: -1 | 1): void {
  const db = getDb();
  const row = db
    .prepare("SELECT gallery FROM gallery_photos WHERE id=?")
    .get(id) as { gallery: string } | undefined;
  if (!row) return;
  const ids = (
    db
      .prepare(
        "SELECT id FROM gallery_photos WHERE gallery=? ORDER BY position, id",
      )
      .all(row.gallery) as { id: number }[]
  ).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const upd = db.prepare("UPDATE gallery_photos SET position=? WHERE id=?");
  db.transaction(() => ids.forEach((pid, idx) => upd.run(idx, pid)))();
}
