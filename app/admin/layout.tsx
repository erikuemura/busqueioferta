import Link from "next/link";
import { auth } from "@/lib/auth";
import { isStaff } from "./guard";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/ofertas", label: "Ofertas", icon: "🏷️" },
  { href: "/admin/social", label: "Fila Social", icon: "📲" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Sem sessão de equipe: rende apenas o conteúdo (página de login) sem o shell.
  if (!session?.user || !isStaff(role)) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] p-4 md:flex">
        <Link href="/admin/dashboard" className="mb-6 flex items-center gap-2 px-2 font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">🔥</span>
          Painel
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
          <Link href="/" className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5">
            ↗ Ver site
          </Link>
        </nav>
        <div className="border-t border-[var(--border)] pt-3">
          <p className="px-2 text-xs text-gray-500">{session.user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}
