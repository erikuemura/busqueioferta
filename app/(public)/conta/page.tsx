import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWhatsappGroupsFor } from "@/lib/whatsappGroups";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignOutButton } from "@/components/SignOutButton";
import { AccountForm } from "./AccountForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/entrar");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, phone: true, interests: true, wantsWhatsapp: true, wantsEmail: true },
  });
  if (!user) redirect("/entrar");

  const groups = await getWhatsappGroupsFor(user.interests);
  const firstName = (user.name || user.email).split(" ")[0];

  return (
    <>
      <Header />
      <main className="container-page py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Olá, {firstName} 👋</h1>
            <p className="text-gray-400">Configure as ofertas que você quer receber. É rápido e você controla tudo.</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <AccountForm
            initial={{
              name: user.name ?? "",
              phone: user.phone ?? "",
              interests: user.interests,
              wantsWhatsapp: user.wantsWhatsapp,
              wantsEmail: user.wantsEmail,
            }}
          />

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold">Grupos de WhatsApp 💬</h2>
              {groups.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">
                  {user.interests.length === 0
                    ? "Escolha seus interesses ao lado e salve para liberar os grupos do seu nicho."
                    : "Os grupos para os seus interesses ainda estão sendo preparados. Volte em breve!"}
                </p>
              ) : (
                <>
                  <p className="mb-3 mt-1 text-sm text-gray-400">Entre nos grupos e receba as ofertas em primeira mão:</p>
                  <div className="flex flex-col gap-2">
                    {groups.map((g) => (
                      <a
                        key={g.url}
                        href={g.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-95"
                        style={{ background: "#25D366" }}
                      >
                        {g.label} <span>›</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="card p-5 text-sm text-gray-400">
              <h2 className="mb-1 font-bold text-white">Como funciona</h2>
              Você escolhe os nichos, entra nos grupos do seu interesse e recebe as melhores ofertas no
              WhatsApp e por e-mail. Pode ajustar ou sair quando quiser.
              <Link href="/sobre" className="mt-2 block text-brand hover:underline">Saiba mais</Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
