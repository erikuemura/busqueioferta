/**
 * Identidade visual do busqueioferta.
 * LogoMark = ícone (selo com chama + etiqueta de preço); Logo = ícone + wordmark.
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="busqueioferta">
      <defs>
        <linearGradient id="bo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A33" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bo-grad)" />
      {/* etiqueta de preço (tag) */}
      <g transform="translate(8 9)" fill="#ffffff" opacity="0.18">
        <path d="M2 2h11l9 9-11 11-11-11V2z" />
      </g>
      {/* chama */}
      <g transform="translate(11.5 8) scale(0.74)" fill="#ffffff">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0 drop-shadow-sm" />
      <span className="text-lg font-extrabold tracking-tight">
        busque<span className="text-brand">ioferta</span>
      </span>
    </span>
  );
}
