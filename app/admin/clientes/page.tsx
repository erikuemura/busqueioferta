import { prisma } from "@/lib/prisma";
import { getCategoryMeta } from "@/lib/categories";
import { formatDateTime } from "@/lib/utils";
import { requireSession } from "../guard";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  await requireSession();

  const [customers, total, withPhone, withWhatsapp, withEmail] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, phone: true, interests: true, wantsWhatsapp: true, wantsEmail: true, createdAt: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", phone: { not: null } } }),
    prisma.user.count({ where: { role: "CUSTOMER", wantsWhatsapp: true, phone: { not: null } } }),
    prisma.user.count({ where: { role: "CUSTOMER", wantsEmail: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Cadastrados" value={total} />
        <Stat label="Com telefone" value={withPhone} />
        <Stat label="Aptos a WhatsApp" value={withWhatsapp} />
        <Stat label="Aptos a e-mail" value={withEmail} />
      </div>

      {customers.length === 0 ? (
        <p className="card p-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-[var(--border)] text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Interesses</th>
                <th className="p-3">Canais</th>
                <th className="p-3">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="p-3">
                    <p className="font-medium">{c.name || "—"}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="p-3 text-gray-300">{c.phone || <span className="text-gray-600">—</span>}</td>
                  <td className="max-w-[280px] p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.interests.length === 0 ? (
                        <span className="text-xs text-gray-600">nenhum</span>
                      ) : (
                        c.interests.map((cat) => (
                          <span key={cat} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300">
                            {getCategoryMeta(cat).label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    {c.wantsWhatsapp && c.phone && <span className="mr-1 text-emerald-400">WhatsApp</span>}
                    {c.wantsEmail && <span className="text-sky-400">E-mail</span>}
                  </td>
                  <td className="p-3 text-xs text-gray-400">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}
