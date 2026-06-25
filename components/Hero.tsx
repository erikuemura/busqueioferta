import Link from "next/link";

export function Hero({ offerCount, couponCount }: { offerCount: number; couponCount: number }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#1b1410] via-[var(--card)] to-[var(--bg-soft)] px-6 py-10 sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          🔥 Curadoria inteligente de ofertas
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          As melhores ofertas do Brasil,{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">sem garimpo</span>
        </h1>
        <p className="mt-3 text-base text-gray-300 sm:text-lg">
          Reunimos promoções, cupons e descontos dos maiores marketplaces — comparados por preço,
          reputação e relevância. Você só pega a oferta.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cupons" className="btn-brand">🎟️ Ver cupons do dia</Link>
          <Link href="/alertas" className="btn-ghost">🔔 Receber alertas</Link>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
          <span className="inline-flex items-center gap-1.5">
            <strong className="text-white">{offerCount}+</strong> ofertas ativas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <strong className="text-white">{couponCount}+</strong> cupons válidos
          </span>
          <span className="inline-flex items-center gap-1.5">🏪 7 marketplaces</span>
          <span className="inline-flex items-center gap-1.5">⏱ atualizado a cada 2h</span>
        </div>
      </div>
    </section>
  );
}
