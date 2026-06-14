import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tüm site /vibes altında: menü /vibes/menu, admin /vibes/admin.
  // NOT: değişirse src/lib/base-path.ts içindeki BASE_PATH ile senkron tut.
  basePath: "/vibes",
  // Dinamik mod (PM2 ile `next start`): admin paneli + SQLite için gerekli.
  // (Statik export kaldırıldı; nginx artık proxy_pass ile bu sunucuya gider.)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
