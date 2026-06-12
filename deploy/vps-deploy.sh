#!/usr/bin/env bash
# VPS'te çalıştırılır: en son kodu çek, bağımlılıkları kur, statik build al.
# Kullanım (VPS'te):  bash /var/www/aizho/deploy/vps-deploy.sh
set -euo pipefail

cd /var/www/aizho
echo "→ git pull..."
git pull --ff-only

echo "→ bağımlılıklar (npm ci)..."
npm ci

echo "→ statik build..."
npm run build

echo "✓ aizho.me güncellendi (out/ yenilendi)."
