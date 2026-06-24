import type { GalleryPhoto } from "@/lib/gallery-repo";
import { mediaUrl } from "@/lib/base-path";

const ROT = [-2, 1.5, -1, 2, -1.5, 1];

export default function Gallery({
  title,
  kicker,
  photos,
}: {
  title: string;
  kicker: string;
  photos: GalleryPhoto[];
}) {
  return (
    <section className="border-b-4 border-ink bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 -rotate-1">
          <h2 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
            {title}
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
            {kicker}
          </p>
        </div>

        {photos.length === 0 ? (
          <p className="font-mono text-sm text-ink/40">
            Yakında burada fotoğraflar olacak.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <figure
                key={p.id}
                style={{ rotate: `${ROT[i % ROT.length]}deg` }}
                className="border-2 border-ink bg-white p-2 shadow-pop-sm transition-transform hover:-translate-y-1 hover:shadow-pop"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(p.photo)}
                  alt={p.caption ?? ""}
                  className="aspect-square w-full border border-ink/10 object-cover"
                />
                {p.caption && (
                  <figcaption className="mt-1.5 truncate px-0.5 font-mono text-[11px] text-ink/60">
                    {p.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
