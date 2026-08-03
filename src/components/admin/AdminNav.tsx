"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Ürünler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/campaigns", label: "Kampanyalar" },
  { href: "/admin/glasses", label: "Bardaklar" },
  { href: "/admin/cark", label: "Çark" },
  { href: "/admin/bira-defteri", label: "Bira Defteri" },
  { href: "/admin/galeri", label: "Galeri" },
] as const;

const linkClass = "transition-colors hover:text-red";

/** Admin üst barın gezinme kısmı — masaüstünde yatay bar, mobilde hamburger
 *  panel. Menü 8 öğe + logo taşıdığından mobilde `flex` tek başına sığmıyordu
 *  (bkz. plan); burada genişlik masaüstünde korunup mobilde katlanıyor. */
export default function AdminNav({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Rota değişince paneli kapat — React'in "render sırasında state ayarlama"
  // deseni: bir efekt yerine render içinde koşullu setState (bkz. react.dev/
  // learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <nav
        className="hidden gap-4 font-mono text-xs font-bold uppercase tracking-widest md:flex"
        aria-label="Admin menüsü"
      >
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass}>
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-paper/60 ${linkClass}`}
        >
          Site ↗
        </Link>
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="grid size-9 shrink-0 place-items-center border-2 border-paper/40 text-paper transition-colors hover:border-red hover:text-red md:hidden"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="admin-mobile-nav"
          className="absolute inset-x-0 top-full flex flex-col border-b-4 border-red bg-ink px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest text-paper md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b border-paper/10 py-3 ${linkClass}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`border-b border-paper/10 py-3 text-paper/60 ${linkClass}`}
          >
            Site ↗
          </Link>
          <form action={logoutAction} className="pt-3">
            <button
              type="submit"
              className={`text-paper/70 ${linkClass}`}
            >
              Çıkış
            </button>
          </form>
        </div>
      )}
    </>
  );
}
