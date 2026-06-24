"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerToken,
  customerCookieOptions,
  getCustomerId,
} from "@/lib/customer-auth";
import { registerOrLogin } from "@/lib/customer-repo";
import { spin, type SpinResult } from "@/lib/wheel-repo";

export type CustomerFormState = { error?: string };

/** Kayıt/giriş tek form — kullanıcı adı yoksa hesap açar, varsa telefonu doğrular. */
export async function registerOrLoginAction(
  _prev: CustomerFormState | undefined,
  formData: FormData,
): Promise<CustomerFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!username || !phone) return { error: "Kullanıcı adı ve telefon gerekli." };

  const res = registerOrLogin(username, phone);
  if (!res.ok) return { error: res.error };

  const store = await cookies();
  store.set(
    CUSTOMER_COOKIE_NAME,
    await createCustomerToken(res.customer.id),
    customerCookieOptions,
  );
  revalidatePath("/cark");
  revalidatePath("/bira-defteri");
  return {};
}

export async function customerLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE_NAME);
  revalidatePath("/cark");
  revalidatePath("/bira-defteri");
}

export type SpinActionResult =
  | { ok: true; result: SpinResult }
  | { ok: false; error: string };

/** Müşteri çarkı çevirir — sonuç sunucuda seçilir, günde 1 ile sınırlıdır. */
export async function spinAction(): Promise<SpinActionResult> {
  const customerId = await getCustomerId();
  if (!customerId) return { ok: false, error: "Önce katılmalısın." };
  try {
    const result = spin(customerId);
    revalidatePath("/cark");
    revalidatePath("/admin/cark");
    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Çark çevrilemedi.",
    };
  }
}
