#!/usr/bin/env bash
# VPS'te güncelleme: kodu çek, kur, build al, PM2 ile yeniden başlat.
# Kullanım (VPS'te):  bash /var/www/aizho/deploy/vps-deploy.sh
# NOT: ilk kurulumda /var/www/aizho/.env (ADMIN_PASSWORD, SESSION_SECRET) oluşturulmalı.
set -euo pipefail

cd /var/www/aizho
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
