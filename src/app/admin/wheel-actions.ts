"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/require-admin";
import * as repo from "@/lib/menu-repo";
import * as wheel from "@/lib/wheel-repo";
import type { WheelSlotInput } from "@/lib/wheel-repo";
import { currentGateToken } from "@/lib/spin-gate";
import { BASE_PATH } from "@/lib/base-path";

function revalidateWheel() {
  revalidatePath("/cark");
  revalidatePath("/admin/cark");
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function parseSlotForm(fd: FormData): WheelSlotInput {
  const productIdRaw = String(fd.get("productId") ?? "").trim();
  const productId = productIdRaw ? Number(productIdRaw) : null;
  const weightRaw = Number(fd.get("weight"));
  const angleRaw = Number(fd.get("angle"));
  const colorRaw = String(fd.get("color") ?? "").trim();
  return {
    productId: productId && productId > 0 ? productId : null,
    label: String(fd.get("label") ?? "").trim(),
    rewardNote: String(fd.get("rewardNote") ?? "").trim() || null,
    color: HEX_COLOR.test(colorRaw) ? colorRaw : "#db1010",
    weight: Number.isFinite(weightRaw) && weightRaw > 0 ? Math.round(weightRaw) : 1,
    angle: Number.isFinite(angleRaw) && angleRaw > 0 ? angleRaw : 1,
  };
}

export async function createWheelSlotAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const input = parseSlotForm(formData);
  if (input.label) wheel.createWheelSlot(input);
  revalidateWheel();
}

export async function updateWheelSlotAction(
  id: number,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const input = parseSlotForm(formData);
  if (input.label) wheel.updateWheelSlot(id, input);
  revalidateWheel();
}

export async function deleteWheelSlotAction(id: number): Promise<void> {
  await requireAdmin();
  wheel.deleteWheelSlot(id);
  revalidateWheel();
}

export async function moveWheelSlotAction(
  id: number,
  dir: number,
): Promise<void> {
  await requireAdmin();
  wheel.moveWheelSlot(id, dir < 0 ? -1 : 1);
  revalidateWheel();
}

export async function setWheelEnabledAction(enabled: boolean): Promise<void> {
  await requireAdmin();
  repo.setSetting("wheel_enabled", enabled ? "1" : "0");
  revalidateWheel();
}

export type RedeemFormState = { error?: string; success?: string };

export async function redeemPrizeFormAction(
  _prev: RedeemFormState | undefined,
  formData: FormData,
): Promise<RedeemFormState> {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Kod girin." };
  const res = wheel.redeemPrize(code);
  revalidateWheel();
  if (!res.ok) return { error: res.error };
  return {
    success: `${res.win.customerUsername} — "${res.win.label}" kullanıldı.`,
  };
}

/** Barmenin okuttuğu, dakikada bir değişen alkol-kapısı QR'ı. */
export async function getGateQrAction(): Promise<{ svg: string; url: string }> {
  await requireAdmin();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const token = await currentGateToken();
  const url = `${proto}://${host}${BASE_PATH}/api/spin-gate?g=${token}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 220 });
  return { svg, url };
}
