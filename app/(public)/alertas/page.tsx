import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AlertForm } from "./AlertForm";

export const metadata = {
  title: "Alertas de ofertas por e-mail",
  description: "Receba as melhores ofertas das suas categorias favoritas direto no e-mail.",
};

export default function AlertsPage() {
  return (
    <>
      <Header />
      <main className="container-page py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-bold">🔔 Alertas de ofertas</h1>
          <p className="mt-2 text-gray-400">
            Cadastre seu e-mail e escolha as categorias de interesse. Avisamos assim que aparecer uma
            oferta nova do seu nicho — sem spam.
          </p>
          <div className="card mt-6 p-6">
            <AlertForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
