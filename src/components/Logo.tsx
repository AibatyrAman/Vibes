import type { CSSProperties } from "react";

/**
 * "vibes" wordmark from public/vibes-logo.svg, used as a CSS mask so it takes
 * the current text color (text-red in the header, text-paper in the footer).
 * Set the height via className; width follows the wordmark's aspect ratio.
 */
export default function Logo({ className = "" }: { className?: string }) {
  const mask: CSSProperties = {
    display: "inline-block",
    aspectRatio: "1330 / 322",
    backgroundColor: "currentColor",
    WebkitMaskImage: "url(/vibes-logo.svg)",
    maskImage: "url(/vibes-logo.svg)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
  return (
    <span role="img" aria-label="vibes" className={className} style={mask} />
  );
}
