"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { addPunch, redeemFree } from "@/lib/loyalty-repo";

function revalidateLoyalty() {
  revalidatePath("/bira-defteri");
  revalidatePath("/admin/bira-defteri");
}

export async function addPunchAction(customerId: number): Promise<void> {
  await requireAdmin();
  addPunch(customerId);
  revalidateLoyalty();
}

export async function redeemFreeAction(customerId: number): Promise<void> {
  await requireAdmin();
  redeemFree(customerId);
  revalidateLoyalty();
}
