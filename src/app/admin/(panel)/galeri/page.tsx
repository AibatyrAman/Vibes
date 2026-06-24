import type { GalleryName, GalleryPhoto } from "@/lib/gallery-repo";
import { getGallery } from "@/lib/gallery-repo";
import {
  addGalleryPhotoAction,
  deleteGalleryPhotoAction,
  moveGalleryPhotoAction,
} from "@/app/admin/gallery-actions";
import { mediaUrl } from "@/lib/base-path";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import MoveButtons from "@/components/admin/MoveButtons";

export const dynamic = "force-dynamic";

const GALLERIES: { key: GalleryName; title: string }[] = [
  { key: "kareler", title: "Vibes'tan Kareler" },
  { key: "yakalayanlar", title: "Vibe'ını Yakalayanlar" },
];

function GallerySection({
  galleryKey,
  title,
  photos,
}: {
  galleryKey: GalleryName;
  title: string;
  photos: GalleryPhoto[];
}) {
  return (
    <div className="grid gap-4">
      <h2 className="font-display text-3xl uppercase text-red">{title}</h2>

      <form
        action={addGalleryPhotoAction}
        encType="multipart/form-data"
        className="flex flex-wrap items-end gap-3 border-2 border-ink bg-paper p-4 shadow-pop-sm"
      >
        <input type="hidden" name="gallery" value={galleryKey} />
        <div className="flex-1">
          <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            Fotoğraf (PNG/WEBP/JPG)
          </label>
          <input
            type="file"
            name="photo"
            accept="image/png,image/webp,image/jpeg"
            required
            className="block w-full font-mono text-xs file:mr-3 file:border-2 file:border-ink file:bg-navy file:px-3 file:py-1.5 file:font-mono file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-paper"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            Açıklama (ops.)
          </label>
          <input
            name="caption"
            className="w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm"
          />
        </div>
        <button className="border-2 border-ink bg-navy px-4 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
          Ekle
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="font-mono text-sm text-ink/50">Henüz fotoğraf yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="border-2 border-ink bg-paper p-2 shadow-pop-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(p.photo)}
                alt={p.caption ?? ""}
                className="aspect-square w-full border-2 border-ink object-cover"
              />
              {p.caption && (
                <p className="mt-1.5 truncate font-mono text-xs text-ink/60">
                  {p.caption}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <MoveButtons
                  id={p.id}
                  index={i}
                  count={photos.length}
                  action={moveGalleryPhotoAction}
                />
                <ConfirmDelete
                  action={deleteGalleryPhotoAction.bind(null, p.id)}
                  message="Bu fotoğraf silinsin mi?"
                  label="Sil"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GaleriAdminPage() {
  return (
    <div className="grid gap-10">
      <h1 className="font-display text-4xl uppercase leading-none text-ink">
        Galeri
      </h1>
      {GALLERIES.map((g) => (
        <GallerySection
          key={g.key}
          galleryKey={g.key}
          title={g.title}
          photos={getGallery(g.key)}
        />
      ))}
    </div>
  );
}
