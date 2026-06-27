import type { PriceStats } from "@/lib/priceHistory";
import { formatPrice, formatDateTime } from "@/lib/utils";

const W = 300;
const H = 90;
const PAD = 6;

export function PriceChart({ stats, current }: { stats: PriceStats; current: number }) {
  // inclui o ponto atual ao final
  const pts = [...stats.points.map((p) => p.price), current];
  const range = Math.max(1, stats.max - stats.min);
  const stepX = pts.length > 1 ? (W - PAD * 2) / (pts.length - 1) : 0;
  const y = (price: number) => H - PAD - ((price - stats.min) / range) * (H - PAD * 2);
  const x = (i: number) => PAD + i * stepX;

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
  const minY = y(stats.min).toFixed(1);

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Histórico de preço</h2>
        <span className="text-xs text-gray-500">{stats.days} dias</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* linha do menor preço */}
        <line x1="0" y1={minY} x2={W} y2={minY} stroke="#34d399" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
        <path d={area} fill="url(#pc-fill)" />
        <path d={line} fill="none" stroke="#FF5A1F" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(pts.length - 1)} cy={y(current)} r="2.6" fill="#FF5A1F" />
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-gray-500">Menor</p>
          <p className="font-bold text-emerald-400">{formatPrice(stats.min)}</p>
        </div>
        <div>
          <p className="text-gray-500">Atual</p>
          <p className="font-bold text-brand">{formatPrice(current)}</p>
        </div>
        <div>
          <p className="text-gray-500">Maior</p>
          <p className="font-bold text-gray-300">{formatPrice(stats.max)}</p>
        </div>
      </div>

      {stats.isLowest ? (
        <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-400">
          🎯 Está no menor preço dos últimos {stats.days} dias!
        </p>
      ) : (
        <p className="mt-3 text-center text-xs text-gray-500">
          Acompanhamos desde {formatDateTime(stats.points[0]?.recordedAt)}
        </p>
      )}
    </div>
  );
}
