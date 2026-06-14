import Link from "next/link";
import { listProductsFlat } from "@/lib/menu-repo";
import ProductTable from "@/components/admin/ProductTable";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = listProductsFlat();
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase leading-none text-ink">
            Ürünler & Fiyatlar
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
            {products.length} ürün · fiyat / indirim / yeni tablodan anında
            değişir
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/admin/chef-note"
            className="border-2 border-ink bg-paper px-4 py-2.5 font-display text-lg uppercase tracking-wide text-ink shadow-pop-sm transition-transform hover:-translate-y-0.5"
          >
            Şef önerisi
          </Link>
          <Link
            href="/admin/products/new"
            className="border-2 border-ink bg-navy px-4 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5"
          >
            + Yeni ürün
          </Link>
        </div>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
