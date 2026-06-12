import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: "red" | "navy" | "paper";
  /** stamped-on entrance animation */
  animate?: boolean;
  style?: CSSProperties;
};

const TONES: Record<NonNullable<Props["tone"]>, string> = {
  red: "bg-red text-paper border-ink",
  navy: "bg-navy text-paper border-ink",
  paper: "bg-paper text-ink border-ink",
};

/**
 * Round "stamp" sticker. Size it with width/height + text-size utilities via
 * className. Rotation is baked into the stampIn keyframe.
 */
export default function Sticker({
  children,
  className = "",
  tone = "red",
  animate = true,
  style,
}: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-[3px] text-center font-marker uppercase leading-none tracking-tight shadow-pop-sm ${
        TONES[tone]
      } ${animate ? "animate-stamp" : "-rotate-[8deg]"} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
