import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogoMark } from "@/components/Logo";
import { CustomerAuthForm } from "@/components/CustomerAuthForm";

export const metadata: Metadata = {
  title: "Criar conta grátis",
  description: "Cadastre-se grátis e receba as melhores ofertas das suas categorias favoritas no WhatsApp e e-mail.",
};

const PERKS = [
  "🎯 Ofertas das categorias que você escolher",
  "💬 Entre nos grupos de WhatsApp por nicho",
  "📧 Resumo das melhores ofertas por e-mail",
  "🔔 Sem spam — você controla tudo",
];

export default async function CadastroPage() {
  const session = await auth();
  if (session?.user) redirect("/conta");

  return (
    <>
      <Header />
      <main className="container-page grid items-center gap-8 py-12 md:grid-cols-2">
        <div className="hidden md:block">
          <h1 className="text-3xl font-extrabold leading-tight">
            Crie sua conta e <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">nunca perca</span> uma oferta
          </h1>
          <ul className="mt-6 space-y-3 text-gray-300">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2">{p}</li>
            ))}
          </ul>
        </div>
        <div className="card w-full max-w-sm justify-self-center p-8 md:justify-self-end">
          <LogoMark className="mb-4 h-10 w-10" />
          <h2 className="text-xl font-bold">Criar conta grátis</h2>
          <p className="mb-6 mt-1 text-sm text-gray-400">Leva 30 segundos. Sem cartão, sem complicação.</p>
          <CustomerAuthForm mode="register" />
        </div>
      </main>
      <Footer />
    </>
  );
}
