import type { GalleryName, GalleryPhoto } from "@/lib/gallery-repo";
import { getGallery } from "@/lib/gallery-repo";
import {
  deleteGalleryPhotoAction,
  moveGalleryPhotoAction,
} from "@/app/admin/gallery-actions";
import { mediaUrl } from "@/lib/base-path";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import MoveButtons from "@/components/admin/MoveButtons";
import GalleryUploadForm from "@/components/admin/GalleryUploadForm";

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

      <GalleryUploadForm galleryKey={galleryKey} />

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
