import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statik HTML/CSS/JS üret (out/ klasörü) — nginx'ten direkt servis için.
  output: "export",
};

export default nextConfig;
