/** Boot-time guard — prod'da SESSION_SECRET/ADMIN_PASSWORD eksikse süreç
 *  açılışta patlar (PM2 logunda net görünür) yerine sessizce gömülü
 *  fallback'lere (hmac.ts, auth.ts) düşüp güvenliği kırar. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;

  const missing = ["SESSION_SECRET", "ADMIN_PASSWORD"].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    throw new Error(
      `Eksik ortam değişkenleri: ${missing.join(", ")}. ` +
        `/var/www/aizho/.env dosyasını kontrol et (bkz. .env.example).`,
    );
  }
}
