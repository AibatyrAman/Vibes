import { NextResponse, type NextRequest } from "next/server";
import { isValidGateToken, setUnlock } from "@/lib/spin-gate";
import { BASE_PATH } from "@/lib/base-path";

export const dynamic = "force-dynamic";

/** Barmenin okuttuğu QR buraya gelir — geçerliyse unlock çerezi set edip
 *  çark sayfasına yönlendirir. Geçersiz/eski token'da da çark sayfasına
 *  döner, ama kilitli kalır (sayfa eğlenceli mesajı gösterir).
 *  NOT: `new URL(path, request.url)` ile mutlak Location KURMUYORUZ —
 *  `request.url` Next'te Host header'ından değil sunucunun dinlediği
 *  host:port'tan geliyor (nginx arkasında PM2 portu, ör. localhost:3005),
 *  bu da müşterinin telefonunda açılmayan bir Location üretiyordu.
 *  Göreli path + BASE_PATH kullanmak host/port'tan tamamen bağımsız. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("g") ?? "";
  const ok = await isValidGateToken(token);
  if (ok) {
    await setUnlock();
  }
  const location = `${BASE_PATH}/cark${ok ? "" : "?kapi=gecersiz"}`;
  return new NextResponse(null, { status: 307, headers: { Location: location } });
}
