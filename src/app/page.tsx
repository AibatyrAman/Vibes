import { redirect } from "next/navigation";

// /vibes kökü → menüye yönlendir (basePath ile /vibes/menu).
export default function RootIndex() {
  redirect("/menu");
}
