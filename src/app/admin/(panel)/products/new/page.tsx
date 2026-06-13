import { listCategories } from "@/lib/menu-repo";
import ProductForm from "@/components/admin/ProductForm";
import { createProductAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  const categories = listCategories();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-4xl uppercase leading-none text-ink">
        Yeni Ürün
      </h1>
      <ProductForm action={createProductAction} categories={categories} />
    </div>
  );
}
