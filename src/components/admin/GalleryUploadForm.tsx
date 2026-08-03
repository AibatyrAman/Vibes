"use client";

import { useActionState } from "react";
import type { GalleryName } from "@/lib/gallery-repo";
import { addGalleryPhotoAction } from "@/app/admin/gallery-actions";

/** Galeri yükleme formu — hatayı (yanlış format, çok büyük dosya vb.)
 *  sessizce yutmak yerine kullanıcıya gösterir (bkz. plan 4c). */
export default function GalleryUploadForm({
  galleryKey,
}: {
  galleryKey: GalleryName;
}) {
  const [state, action, pending] = useActionState(addGalleryPhotoAction, {});

  return (
    <form
      action={action}
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
      <button
        disabled={pending}
        className="border-2 border-ink bg-navy px-4 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Yükleniyor…" : "Ekle"}
      </button>
      {state?.error && (
        <p className="w-full font-mono text-xs font-bold text-red">
          {state.error}
        </p>
      )}
    </form>
  );
}
