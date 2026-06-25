const STEPS = [
  {
    icon: "🔎",
    title: "Garimpamos por você",
    text: "Monitoramos os maiores marketplaces do Brasil 24h e capturamos as melhores quedas de preço automaticamente.",
  },
  {
    icon: "🧠",
    title: "Curadoria inteligente",
    text: "Não olhamos só o preço: avaliamos desconto real, reputação da loja e relevância antes de publicar a oferta.",
  },
  {
    icon: "💸",
    title: "Você economiza",
    text: "Você compra direto na loja oficial, com a oferta aplicada e link verificado. Simples assim.",
  },
];

export function HowItWorks() {
  return (
    <section className="mt-14">
      <h2 className="section-title mb-6">Como funciona</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card relative p-5">
            <span className="absolute right-4 top-4 text-3xl font-black text-white/5">{i + 1}</span>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-2xl">
              {s.icon}
            </div>
            <h3 className="font-bold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-gray-400">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
