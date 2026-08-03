import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tüm site /vibes altında: menü /vibes/menu, admin /vibes/admin.
  // NOT: değişirse src/lib/base-path.ts içindeki BASE_PATH ile senkron tut.
  basePath: "/vibes",
  // Dinamik mod (PM2 ile `next start`): admin paneli + SQLite için gerekli.
  // (Statik export kaldırıldı; nginx artık proxy_pass ile bu sunucuya gider.)
  serverExternalPackages: ["better-sqlite3"],
  // Varsayılan Server Action body limiti 1MB — telefon fotoğrafları (3-8MB)
  // galeri/ürün formundan sessizce reddediliyordu. nginx client_max_body_size
  // ile birlikte tut (bkz. deploy/nginx-aizho.me.conf).
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
