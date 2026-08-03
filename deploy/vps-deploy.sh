#!/usr/bin/env bash
# VPS'te güncelleme: kodu çek, kur, build al, PM2 ile yeniden başlat.
# Kullanım (VPS'te):  bash /var/www/aizho/deploy/vps-deploy.sh
# NOT: ilk kurulumda /var/www/aizho/.env (ADMIN_PASSWORD, SESSION_SECRET) oluşturulmalı.
set -euo pipefail

cd /var/www/aizho

echo "→ .env kontrolü..."
if [ ! -f .env ]; then
  echo "✗ /var/www/aizho/.env bulunamadı. .env.example'a bakıp oluştur." >&2
  exit 1
fi
set -a; source .env; set +a
if [ -z "${SESSION_SECRET:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "✗ .env içinde SESSION_SECRET ve/veya ADMIN_PASSWORD boş." >&2
  exit 1
fi

echo "→ git pull..."
git pull --ff-only

echo "→ bağımlılıklar (npm ci)..."
npm ci

echo "→ build..."
npm run build

echo "→ PM2 (reload/start)..."
pm2 startOrReload deploy/ecosystem.config.js --update-env
pm2 save

echo "✓ vibes güncellendi (PM2, port 3005). Menü: https://aizho.me  ·  Admin: https://aizho.me/admin"
