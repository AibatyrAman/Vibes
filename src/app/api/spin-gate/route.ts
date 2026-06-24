import { NextResponse, type NextRequest } from "next/server";
import { isValidGateToken, setUnlock } from "@/lib/spin-gate";
import { BASE_PATH } from "@/lib/base-path";

export const dynamic = "force-dynamic";

/** Barmenin okuttuğu QR buraya gelir — geçerliyse unlock çerezi set edip
 *  çark sayfasına yönlendirir. Geçersiz/eski token'da da çark sayfasına
 *  döner, ama kilitli kalır (sayfa eğlenceli mesajı gösterir).
 *  NOT: request.nextUrl.clone() basePath'i bu ortamda kaybedebiliyor —
 *  bilerek ham URL + BASE_PATH sabiti ile kuruyoruz. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("g") ?? "";
  if (await isValidGateToken(token)) {
    await setUnlock();
  }
  return NextResponse.redirect(new URL(`${BASE_PATH}/cark`, request.url));
}
