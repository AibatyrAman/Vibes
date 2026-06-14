// Site /vibes alt-yolunda servis ediliyor (bkz. next.config.ts basePath).
// next/link ve redirect() basePath'i otomatik uygular; ancak HAM string varlık
// URL'leri (CSS url(), <img src>) otomatik öneklenmez — bunlar için bu sabit kullanılır.
// NOT: next.config.ts'teki basePath ile senkron tut.
export const BASE_PATH = "/vibes";

/** Yüklenen ürün fotoğrafı için tam URL (basePath dahil). */
export const mediaUrl = (name: string) => `${BASE_PATH}/api/media/${name}`;

/** public/ altındaki bir varlık için tam URL (basePath dahil). */
export const assetUrl = (path: string) =>
  `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
