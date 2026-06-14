import type { ReactNode } from "react";
import type { Garnish } from "@/data/menu";

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Bardak ağzına oturan küçük line-art jestler (28×28). */
export const GARNISH_ART: Record<Garnish, ReactNode> = {
  lemon: (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M4 18 A12 12 0 0 1 24 18 Z" />
        <path d="M14 18 L14 8 M14 18 L7 12 M14 18 L21 12" />
      </g>
    </svg>
  ),
  "orange-peel": (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M8 4 C20 6 22 18 12 22 C6 24 6 16 12 15 C17 14 16 9 11 9" />
      </g>
    </svg>
  ),
  olive: (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M14 2 L14 16" />
        <ellipse cx="14" cy="20" rx="6" ry="7" />
      </g>
    </svg>
  ),
  mint: (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M14 26 L14 12" />
        <path d="M14 12 C6 12 6 4 14 6 C22 4 22 12 14 12" />
        <path d="M14 16 C8 16 8 10 14 11" />
      </g>
    </svg>
  ),
  straw: (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M9 26 L19 2" />
        <path d="M13 26 L23 2" />
      </g>
    </svg>
  ),
  "coffee-bean": (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <ellipse cx="14" cy="14" rx="7" ry="11" transform="rotate(28 14 14)" />
        <path d="M9 8 C14 12 14 16 19 20" />
      </g>
    </svg>
  ),
  cherry: (
    <svg viewBox="0 0 28 28" className="size-full">
      <g {...s}>
        <path d="M20 4 C12 8 10 14 11 19" />
        <circle cx="9" cy="21" r="5" />
      </g>
    </svg>
  ),
};

/** Renkli (gerçek) jest görselleri — public/anatomy/garnishes altında.
 *  Burada olmayan jestler line-art (GARNISH_ART) ile gösterilir. */
export const GARNISH_IMAGES: Partial<Record<Garnish, string>> = {
  lemon: "/anatomy/garnishes/lemon.svg",
};

export const GARNISH_LABELS: Record<Garnish, string> = {
  lemon: "Limon dilimi",
  "orange-peel": "Portakal kabuğu",
  olive: "Zeytin",
  mint: "Nane",
  straw: "Pipet",
  "coffee-bean": "Kahve çekirdeği",
  cherry: "Vişne",
};
