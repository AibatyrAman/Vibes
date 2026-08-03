import type { GalleryPhoto } from "@/lib/gallery-repo";
import { mediaUrl } from "@/lib/base-path";
import CategoryBand from "@/components/CategoryBand";
import TapeStrip from "@/components/scrap/TapeStrip";

const ROT = [-2, 1.5, -1, 2, -1.5, 1];

export default function Gallery({
  title,
  kicker,
  photos,
  accent = "navy",
}: {
  title: string;
  kicker: string;
  photos: GalleryPhoto[];
  accent?: "navy" | "red";
}) {
  const shadow = accent === "navy" ? "shadow-pop-navy" : "shadow-pop-red";
  const shadowHover =
    accent === "navy" ? "hover:shadow-pop-navy-lg" : "hover:shadow-pop-red-lg";
  const tapeTone = accent === "navy" ? "navy" : "red";

  return (
    <section className="border-b-4 border-ink bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <CategoryBand title={title} kicker={kicker} accent={accent} />

        {photos.length === 0 ? (
          <p className="font-mono text-sm text-ink/60">
            Yakında burada fotoğraflar olacak.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <figure
                key={p.id}
                style={{ rotate: `${ROT[i % ROT.length]}deg` }}
                className={`relative border-2 border-ink bg-paper p-2 ${shadow} transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:animate-wobble ${shadowHover}`}
              >
                {i === 0 && (
                  <TapeStrip
                    className="-left-4 -top-3 w-20"
                    rotate={-10}
                    tone={tapeTone}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(p.photo)}
                  alt={p.caption ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full border border-ink/15 object-cover"
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
