import fs from "node:fs/promises";
import path from "node:path";
import { MEDIA_CONTENT_TYPE, UPLOAD_DIR } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/** Yüklenen ürün fotoğraflarını kalıcı uploads klasöründen servis eder. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const safe = path.basename(name); // path traversal koruması
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const type = MEDIA_CONTENT_TYPE[ext];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
