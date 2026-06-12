import type { CSSProperties } from "react";

type Props = {
  /** absolute-positioning + sizing utilities from the parent */
  className?: string;
  /** degrees of tilt, like a hand-stuck piece of tape */
  rotate?: number;
  tone?: "paper" | "red" | "navy";
  style?: CSSProperties;
};

const TONES: Record<NonNullable<Props["tone"]>, string> = {
  paper: "bg-[rgba(244,241,234,0.6)]",
  red: "bg-[rgba(230,57,70,0.4)]",
  navy: "bg-[rgba(42,75,155,0.4)]",
};

/**
 * Semi-transparent "masking tape" strip with a diagonal sheen. Drop it on the
 * corner of any collage element and tilt it a few degrees.
 */
export default function TapeStrip({
  className = "",
  rotate = -6,
  tone = "paper",
  style,
}: Props) {
  return (
    <span
      aria-hidden
      className={`tape-sheen pointer-events-none absolute block h-7 w-24 border-y border-black/10 shadow-[2px_2px_0_rgba(17,24,39,0.25)] ${TONES[tone]} ${className}`}
      style={{ rotate: `${rotate}deg`, ...style }}
    />
  );
}
