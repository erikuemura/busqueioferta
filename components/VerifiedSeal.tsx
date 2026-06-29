import { LogoMark } from "./Logo";

/** Selo de marca: reforça que a oferta passou pela curadoria do busqueioferta. */
export function VerifiedSeal({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 ${className}`}
    >
      <LogoMark className="h-7 w-7 shrink-0" />
      <div className="leading-tight">
        <p className="text-xs font-bold text-gray-100">Curadoria verificada</p>
        <p className="text-[11px] text-gray-400">Oferta avaliada pelo busqueioferta</p>
      </div>
      <span className="ml-auto text-emerald-400">✓</span>
    </div>
  );
}
