"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  checkPassword,
  createToken,
  COOKIE_NAME,
  cookieOptions,
  verifyToken,
} from "@/lib/auth";
import * as repo from "@/lib/menu-repo";
import type { ProductInput } from "@/lib/menu-repo";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import type {
  Allergen,
  DrinkLayer,
  GlassType,
  PriceVariant,
} from "@/data/menu";

const GLASS_TYPES: GlassType[] = [
  "rocks",
  "highball",
  "martini",
  "coupe",
  "wine",
  "tekila",
  "mug",
];

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
}

/** Mutasyon action'larını korur — oturum yoksa login'e atar. */
async function requireAdmin() {
  const store = await cookies();
  if (!(await verifyToken(store.get(COOKIE_NAME)?.value)))
    redirect("/admin/login");
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

async function parseProductForm(fd: FormData): Promise<ProductInput> {
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

  // --- içecek anatomisi ---
  const glassRaw = str("glassType");
  const glassType =
    glassRaw && GLASS_TYPES.includes(glassRaw as GlassType)
      ? (glassRaw as GlassType)
      : null;

  let layers: DrinkLayer[] = [];
  try {
    const parsed = JSON.parse(String(fd.get("layers") ?? "[]"));
    if (Array.isArray(parsed))
      layers = parsed
        .map((x) => ({
          name: String(x.name ?? "").trim(),
          percent: Math.max(0, Math.min(100, Number(x.percent) || 0)),
          color: /^#[0-9a-fA-F]{6}$/.test(String(x.color))
            ? String(x.color)
            : "#cccccc",
        }))
        .filter((l) => l.name && l.percent > 0);
  } catch {
    layers = [];
  }

  // foto: yeni dosya yüklendiyse kaydet; yoksa mevcut korunur, "kaldır"
  // işaretliyse silinir.
  const existingPhoto = str("photoExisting");
  let photo: string | null = existingPhoto;
  const removePhoto = bool("removePhoto");
  const file = fd.get("photo");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) {
      await deleteUpload(existingPhoto);
      photo = saved;
    }
  } else if (removePhoto) {
    await deleteUpload(existingPhoto);
    photo = null;
  }

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
    glassType,
    layers,
    photo,
  };
}

// ---------- product CRUD ----------

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const input = await parseProductForm(formData);
  if (input.name && input.categoryId) repo.createProduct(input);
  revalidateAll();
  redirect("/admin");
}

export async function updateProductAction(
  id: number,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const input = await parseProductForm(formData);
  if (input.name && input.categoryId) repo.updateProduct(id, input);
  revalidateAll();
  redirect("/admin");
}

export async function deleteProductAction(id: number): Promise<void> {
  await requireAdmin();
  await deleteUpload(repo.getProduct(id)?.photo);
  repo.deleteProduct(id);
  revalidateAll();
}

/** Düzenleme sayfasındaki Sil butonu için — siler ve listeye döner. */
export async function deleteProductAndBackAction(id: number): Promise<void> {
  await requireAdmin();
  await deleteUpload(repo.getProduct(id)?.photo);
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
  await requireAdmin();
  repo.quickUpdateProduct(id, patch);
  revalidateAll();
}

// ---------- category CRUD ----------

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  repo.deleteCategory(id);
  revalidateAll();
}

// ---------- ayarlar ----------

export async function saveGlassCavityAction(
  type: string,
  points: [number, number][],
): Promise<void> {
  await requireAdmin();
  if (!GLASS_TYPES.includes(type as GlassType)) return;
  const clean = (Array.isArray(points) ? points : [])
    .filter(
      (p) =>
        Array.isArray(p) &&
        typeof p[0] === "number" &&
        typeof p[1] === "number",
    )
    .map(([x, y]) => [Math.round(x), Math.round(y)] as [number, number]);
  if (clean.length < 3) return;
  repo.setSetting(`glass_cav_${type}`, JSON.stringify(clean));
  revalidateAll();
}

/** Varsayılana dön — override kaydını boşaltır (getGlassCavities yok sayar). */
export async function resetGlassCavityAction(type: string): Promise<void> {
  await requireAdmin();
  if (!GLASS_TYPES.includes(type as GlassType)) return;
  repo.setSetting(`glass_cav_${type}`, "");
  revalidateAll();
}

export async function updateChefNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const note = String(formData.get("chefNote") ?? "").trim();
  repo.setSetting("chef_note", note);
  revalidateAll();
  redirect("/admin/settings");
}

// ---------- kampanyalar ----------

function parseCampaignForm(fd: FormData): repo.CampaignInput {
  const num = (k: string) => {
    const v = fd.get(k);
    if (v == null || String(v).trim() === "") return null;
    const n = Number(String(v).replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };
  let items: { productId: number; quantity: number }[] = [];
  try {
    const parsed = JSON.parse(String(fd.get("items") ?? "[]"));
    if (Array.isArray(parsed))
      items = parsed
        .map((x) => ({
          productId: Number(x.productId),
          quantity: Math.max(1, Number(x.quantity) || 1),
        }))
        .filter((x) => x.productId > 0);
  } catch {
    items = [];
  }
  return {
    name: String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim() || null,
    originalPrice: num("originalPrice"),
    price: num("price") ?? 0,
    active: fd.get("active") === "on" || fd.get("active") === "true",
    items,
  };
}

export async function createCampaignAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const input = parseCampaignForm(formData);
  if (input.name) repo.createCampaign(input);
  revalidateAll();
  redirect("/admin/campaigns");
}

export async function updateCampaignAction(
  id: number,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const input = parseCampaignForm(formData);
  if (input.name) repo.updateCampaign(id, input);
  revalidateAll();
  redirect("/admin/campaigns");
}

export async function deleteCampaignAction(id: number): Promise<void> {
  await requireAdmin();
  repo.deleteCampaign(id);
  revalidateAll();
}

export async function deleteCampaignAndBackAction(id: number): Promise<void> {
  await requireAdmin();
  repo.deleteCampaign(id);
  revalidateAll();
  redirect("/admin/campaigns");
}

export async function toggleCampaignActiveAction(
  id: number,
  active: boolean,
): Promise<void> {
  await requireAdmin();
  repo.setCampaignActive(id, active);
  revalidateAll();
}

export async function setCampaignsEnabledAction(
  enabled: boolean,
): Promise<void> {
  await requireAdmin();
  repo.setSetting("campaigns_enabled", enabled ? "1" : "0");
  revalidateAll();
}
