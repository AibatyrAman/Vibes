"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkPassword, createToken, COOKIE_NAME, cookieOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
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
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/cark");
  revalidatePath("/bira-defteri");
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

/** `base` zaten kullanılıyorsa `-2`, `-3`... ekleyerek benzersiz hale getirir —
 *  aynı/benzer başlıklı iki kategori aynı slug'a düşüp UNIQUE ihlaliyle
 *  çökmesin diye (categories.slug TEXT UNIQUE NOT NULL). */
function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ---------- auth ----------

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const pw = String(formData.get("password") ?? "");
  if (!(await checkPassword(pw))) return { error: "Şifre yanlış." };
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

/** parseProductForm içinde saveUpload başarısız olursa fırlatılır — çağıran
 *  action bunu yakalayıp useActionState'e kullanıcı dostu hata döndürür. */
class UploadValidationError extends Error {}

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
    if (!saved.ok) throw new UploadValidationError(saved.error);
    await deleteUpload(existingPhoto);
    photo = saved.name;
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
    hasIce: bool("hasIce"),
  };
}

// ---------- product CRUD ----------

export type ProductFormState = { error?: string };

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  let input: ProductInput;
  try {
    input = await parseProductForm(formData);
  } catch (e) {
    if (e instanceof UploadValidationError) return { error: e.message };
    throw e;
  }
  if (input.name && input.categoryId) repo.createProduct(input);
  revalidateAll();
  redirect("/admin");
}

export async function updateProductAction(
  id: number,
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  let input: ProductInput;
  try {
    input = await parseProductForm(formData);
  } catch (e) {
    if (e instanceof UploadValidationError) return { error: e.message };
    throw e;
  }
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

export async function moveProductAction(
  id: number,
  dir: number,
): Promise<void> {
  await requireAdmin();
  repo.moveProduct(id, dir < 0 ? -1 : 1);
  revalidateAll();
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
  const taken = new Set(repo.listCategories().map((c) => c.slug));
  repo.createCategory({
    slug: uniqueSlug(slugify(title), taken),
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
  const title = String(formData.get("title") ?? "").trim();
  const taken = new Set(
    repo.listCategories().filter((c) => c.id !== id).map((c) => c.slug),
  );
  repo.updateCategory(id, {
    slug: uniqueSlug(slugify(title), taken),
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

export async function deleteCategoryAction(id: number): Promise<void> {
  await requireAdmin();
  repo.deleteCategory(id);
  revalidateAll();
}

export async function moveCategoryAction(
  id: number,
  dir: number,
): Promise<void> {
  await requireAdmin();
  repo.moveCategory(id, dir < 0 ? -1 : 1);
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
  redirect("/admin/chef-note");
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
