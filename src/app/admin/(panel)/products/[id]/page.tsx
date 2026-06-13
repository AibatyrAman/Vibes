import { notFound } from "next/navigation";
import { getProduct, listCategories } from "@/lib/menu-repo";
import ProductForm from "@/components/admin/ProductForm";
import {
  deleteProductAndBackAction,
  updateProductAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pid = Number(id);
  const product = getProduct(pid);
  if (!product) notFound();
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-4xl uppercase leading-none text-ink">
        Ürünü Düzenle
      </h1>
      <ProductForm
        action={updateProductAction.bind(null, pid)}
        product={product}
        categories={categories}
      />
      <form
        action={deleteProductAndBackAction.bind(null, pid)}
        className="mt-4"
      >
        <button className="border-2 border-ink bg-red px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5">
          Bu ürünü sil
        </button>
      </form>
    </div>
  );
}
