type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Mini "cn": junta classes condicionais sem depender de clsx/tailwind-merge.
 * Aceita strings, arrays e objetos { classe: boolean }.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === "string" || typeof val === "number") {
      out.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (typeof val === "object") {
      for (const [k, v] of Object.entries(val)) if (v) out.push(k);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function calcDiscountPercent(original: number, current: number): number {
  if (!original || original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

/** Texto relativo curto: "2h", "3d" para expiração. */
export function timeUntil(date: Date | string): string {
  const ms = new Date(date).getTime() - Date.now();
  if (ms <= 0) return "expirada";
  const h = Math.floor(ms / 3_600_000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
