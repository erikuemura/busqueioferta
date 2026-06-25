import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export function isStaff(role?: string): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

/** Garante sessão de equipe (ADMIN/EDITOR). Clientes (CUSTOMER) são barrados. */
export async function requireSession() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !isStaff(role)) redirect("/admin/login");
  return session;
}
