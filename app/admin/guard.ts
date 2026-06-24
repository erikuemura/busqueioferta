import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Garante sessão válida em páginas/admin. Redireciona para login se ausente. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}
