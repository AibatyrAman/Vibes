"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  checkPassword,
  createToken,
  COOKIE_NAME,
  cookieOptions,
} from "@/lib/auth";
import * as repo from "@/lib/menu-repo";
import type { ProductInput } from "@/lib/menu-repo";
import type { Allergen, PriceVariant } from "@/data/menu";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function slugify(s: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return s
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `kategori-${Date.now()}`;
}

// ---------- auth ----------

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) return { error: "Şifre yanlış." };
  const c = await cookies();
  c.set(COOKIE_NAME, await createToken(), cookieOptions);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  redirect("/admin/login");
}

// ---------- form parsing ----------

function parseProductForm(fd: FormData): ProductInput {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const num = (k: string) => {
    const v = fd.get(k);
    if (v == null || String(v).trim() === "") return null;
    const n = Number(String(v).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };
  const bool = (k: string) => {
    const v = fd.get(k);
    return v === "on" || v === "true" || v === "1";
  };

  const ingredients = (str("ingredients") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const allergens = fd.getAll("allergens").map(String) as Allergen[];

  let variants: PriceVariant[] | null = null;
  const variantsRaw = str("variants");
  if (variantsRaw) {
    const parsed = variantsRaw
      .split("\n")
      .map((line) => {
        const [label, price] = line.split("|").map((s) => s.trim());
        const n = Number((price ?? "").replace(",", "."));
        return label && price && !Number.isNaN(n)
          ? { label, price: n }
          : null;
      })
      .filter((v): v is PriceVariant => v !== null);
    if (parsed.length) variants = parsed;
  }

  return {
    categoryId: Number(fd.get("categoryId")),
    subGroup: str("subGroup"),
    name: str("name") ?? "",
    description: str("description"),
    price: num("price") ?? 0,
    variants,
    onSale: bool("onSale"),
    salePrice: num("salePrice"),
    isNew: bool("isNew"),
    tag: str("tag"),
    ingredients,
    allergens,
    abv: num("abv"),
    kcal: num("kcal"),
    story: str("story"),
  };
}

// ---------- product CRUD ----------

export async function createProductAction(formData: FormData): Promise<void> {
  const input = parseProductForm(formData);
  if (input.name && input.categoryId) repo.createProduct(input);
  revalidateAll();
  redirect("/admin");
}

export async function updateProductAction(
  id: number,
  formData: FormData,
): Promise<void> {
  const input = parseProductForm(formData);
  if (input.name && input.categoryId) repo.updateProduct(id, input);
  revalidateAll();
  redirect("/admin");
}

export async function deleteProductAction(id: number): Promise<void> {
  repo.deleteProduct(id);
  revalidateAll();
}

/** Düzenleme sayfasındaki Sil butonu için — siler ve listeye döner. */
export async function deleteProductAndBackAction(id: number): Promise<void> {
  repo.deleteProduct(id);
  revalidateAll();
  redirect("/admin");
}

export async function quickUpdateAction(
  id: number,
  patch: {
    price?: number;
    onSale?: boolean;
    salePrice?: number | null;
    isNew?: boolean;
  },
): Promise<void> {
  repo.quickUpdateProduct(id, patch);
  revalidateAll();
}

// ---------- category CRUD ----------

export async function createCategoryAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/categories");
  repo.createCategory({
    slug: slugify(title),
    title,
    kicker: String(formData.get("kicker") ?? "").trim(),
    accent: (formData.get("accent") === "red" ? "red" : "navy") as
      | "navy"
      | "red",
    infoStyle: (["modal", "sheet", "inline"].includes(
      String(formData.get("infoStyle")),
    )
      ? String(formData.get("infoStyle"))
      : "modal") as "modal" | "sheet" | "inline",
    note: String(formData.get("note") ?? "").trim() || null,
  });
  revalidateAll();
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  id: number,
  formData: FormData,
): Promise<void> {
  repo.updateCategory(id, {
    title: String(formData.get("title") ?? "").trim(),
    kicker: String(formData.get("kicker") ?? "").trim(),
    accent: (formData.get("accent") === "red" ? "red" : "navy") as
      | "navy"
      | "red",
    infoStyle: (["modal", "sheet", "inline"].includes(
      String(formData.get("infoStyle")),
    )
      ? String(formData.get("infoStyle"))
      : "modal") as "modal" | "sheet" | "inline",
    note: String(formData.get("note") ?? "").trim() || null,
  });
  revalidateAll();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: number): Promise<void> {
  repo.deleteCategory(id);
  revalidateAll();
}
