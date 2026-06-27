/** Cor do termômetro conforme a "temperatura" (votos líquidos). */
export function tempClass(t: number): string {
  if (t >= 200) return "text-red-500";
  if (t >= 50) return "text-orange-500";
  if (t > 0) return "text-amber-400";
  if (t === 0) return "text-gray-400";
  return "text-sky-400";
}

export function tempLabel(t: number): string {
  return `${t}°`;
}
