import Link from "next/link";
import { requireSession } from "../../guard";
import { OfferForm } from "../OfferForm";

export const dynamic = "force-dynamic";

export default async function NewOfferPage() {
  await requireSession();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/ofertas" className="text-sm text-gray-400 hover:text-white">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Nova oferta manual</h1>
      </div>
      <OfferForm />
    </div>
  );
}
