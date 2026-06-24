"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { saveUpload, deleteUpload } from "@/lib/uploads";
import * as repo from "@/lib/gallery-repo";
import type { GalleryName } from "@/lib/gallery-repo";

const GALLERIES: GalleryName[] = ["kareler", "yakalayanlar"];

function revalidateGallery() {
  revalidatePath("/");
  revalidatePath("/admin/galeri");
}

export async function addGalleryPhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const gallery = String(formData.get("gallery") ?? "");
  if (!GALLERIES.includes(gallery as GalleryName)) return;
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;
  const saved = await saveUpload(file);
  if (!saved) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;
  repo.addGalleryPhoto(gallery as GalleryName, saved, caption);
  revalidateGallery();
}

export async function deleteGalleryPhotoAction(id: number): Promise<void> {
  await requireAdmin();
  const photo = repo.getGalleryPhoto(id);
  await deleteUpload(photo?.photo);
  repo.deleteGalleryPhoto(id);
  revalidateGallery();
}

export async function moveGalleryPhotoAction(
  id: number,
  dir: number,
): Promise<void> {
  await requireAdmin();
  repo.moveGalleryPhoto(id, dir < 0 ? -1 : 1);
  revalidateGallery();
}
