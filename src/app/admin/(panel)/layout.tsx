import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const ok = await verifyToken(store.get(COOKIE_NAME)?.value);
  if (!ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b-4 border-red bg-ink px-4 py-3 text-paper">
        <div className="flex items-center gap-5">
          <Logo className="h-6 text-red" />
          <nav className="flex gap-4 font-mono text-xs font-bold uppercase tracking-widest">
            <Link href="/admin" className="transition-colors hover:text-red">
              Ürünler
            </Link>
            <Link
              href="/admin/categories"
              className="transition-colors hover:text-red"
            >
              Kategoriler
            </Link>
            <Link
              href="/admin/campaigns"
              className="transition-colors hover:text-red"
            >
              Kampanyalar
            </Link>
            <Link
              href="/admin/glasses"
              className="transition-colors hover:text-red"
            >
              Bardaklar
            </Link>
            <Link
              href="/admin/settings"
              className="transition-colors hover:text-red"
            >
              Ayarlar
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-paper/60 transition-colors hover:text-red"
            >
              Site ↗
            </Link>
          </nav>
        </div>
        <form action={logoutAction}>
          <button className="font-mono text-xs font-bold uppercase tracking-widest text-paper/70 transition-colors hover:text-red">
            Çıkış
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
