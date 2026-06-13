import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dinamik mod (PM2 ile `next start`): admin paneli + SQLite için gerekli.
  // (Statik export kaldırıldı; nginx artık proxy_pass ile bu sunucuya gider.)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
