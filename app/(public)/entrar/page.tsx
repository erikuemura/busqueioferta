import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogoMark } from "@/components/Logo";
import { CustomerAuthForm } from "@/components/CustomerAuthForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function EntrarPage() {
  const session = await auth();
  if (session?.user) redirect("/conta");

  return (
    <>
      <Header />
      <main className="container-page grid place-items-center py-12">
        <div className="card w-full max-w-sm p-8">
          <LogoMark className="mb-4 h-10 w-10" />
          <h1 className="text-xl font-bold">Entrar na sua conta</h1>
          <p className="mb-6 mt-1 text-sm text-gray-400">Acesse para gerenciar as ofertas que você recebe.</p>
          <CustomerAuthForm mode="login" />
        </div>
      </main>
      <Footer />
    </>
  );
}
