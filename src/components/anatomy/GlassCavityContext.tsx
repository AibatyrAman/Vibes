"use client";

import { createContext, useContext } from "react";
import type { Point } from "@/lib/glass-cavity";

/** Bardak tipi → kalibre edilmiş dolum poligonu (admin override'ları). */
const GlassCavityContext = createContext<Record<string, Point[]>>({});

export function GlassCavityProvider({
  value,
  children,
}: {
  value: Record<string, Point[]>;
  children: React.ReactNode;
}) {
  return (
    <GlassCavityContext.Provider value={value}>
      {children}
    </GlassCavityContext.Provider>
  );
}

export function useGlassCavity(type: string | undefined): Point[] | undefined {
  const map = useContext(GlassCavityContext);
  return type ? map[type] : undefined;
}
