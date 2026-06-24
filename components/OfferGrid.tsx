import type { Offer } from "@prisma/client";
import { OfferCard } from "./OfferCard";

export function OfferGrid({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="text-4xl">🔍</span>
        <p className="text-gray-300">Nenhuma oferta encontrada por aqui.</p>
        <p className="text-sm text-gray-500">Volte em breve — atualizamos as ofertas a cada 2 horas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
