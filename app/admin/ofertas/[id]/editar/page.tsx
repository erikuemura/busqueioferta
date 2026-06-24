import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "../../../guard";
import { OfferForm } from "../../OfferForm";

export const dynamic = "force-dynamic";

export default async function EditOfferPage({ params }: { params: { id: string } }) {
  await requireSession();
  const offer = await prisma.offer.findUnique({ where: { id: params.id } });
  if (!offer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/ofertas" className="text-sm text-gray-400 hover:text-white">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Editar oferta</h1>
      </div>
      <OfferForm offer={offer} />
    </div>
  );
}
