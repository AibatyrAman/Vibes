// PM2 yapılandırması — `next start` sürecini yönetir (kurthan/turhan gibi).
// Gizli değerler (ADMIN_PASSWORD, SESSION_SECRET) /var/www/aizho/.env'den
// gelir; Next.js .env dosyasını otomatik yükler. Burada sadece port/NODE_ENV.
module.exports = {
  apps: [
    {
      name: "vibes",
      cwd: "/var/www/aizho",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3005",
      },
    },
  ],
};
