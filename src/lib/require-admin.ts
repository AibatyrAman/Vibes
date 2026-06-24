import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "./auth";

/** Mutasyon action'larını korur — oturum yoksa login'e atar. */
export async function requireAdmin() {
  const store = await cookies();
  if (!(await verifyToken(store.get(COOKIE_NAME)?.value)))
    redirect("/admin/login");
}
