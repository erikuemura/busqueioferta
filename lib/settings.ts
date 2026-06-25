import { prisma } from "./prisma";

/** Configurações de automação com defaults (regras de negócio do spec). */
export const DEFAULT_SETTINGS = {
  minDiscount: "15", // % mínimo para publicar
  autoScoreThreshold: "55", // score mínimo para entrar ACTIVE (senão DRAFT)
  searchQueries: "ofertas do dia,promoção,desconto", // termos usados no sync ML
  publishTimes: "07:00,12:00,18:00,21:00",
  maxInstagramPerDay: "8",
  maxTiktokPerDay: "4",
  dedupWindowDays: "7",
  notFoundThreshold: "3", // verificações consecutivas → EXPIRED
  whatsappTemplate: [
    "🔥 OFERTA IMPERDÍVEL!",
    "",
    "📱 {titulo}",
    "🏪 {marketplace}",
    "",
    "~~De: {precoOriginal}~~",
    "✅ Por: {preco}",
    "💰 Economia de {desconto}%!",
    "",
    "⚡ Oferta válida enquanto durar o estoque",
    "",
    "🛒 Compre aqui 👇",
    "{link}",
    "",
    "📲 Siga {perfil} para mais ofertas!",
  ].join("\n"),
  instagramTemplate: "{titulo} por apenas {preco} ({desconto}% OFF) na {marketplace}! Link na bio. {perfil}",
  // Grupo geral de ofertas no WhatsApp (link de convite chat.whatsapp.com/...)
  whatsappGroupDefault: "",
  // Grupos por categoria: JSON { "ELETRONICOS": "https://chat.whatsapp.com/...", ... }
  whatsappGroups: "{}",
  // Canal do Telegram (link público t.me/...)
  telegramChannel: "",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.settings.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key];
}

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.settings.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<SettingKey, string>;
  (Object.keys(DEFAULT_SETTINGS) as SettingKey[]).forEach((k) => {
    out[k] = map.get(k) ?? DEFAULT_SETTINGS[k];
  });
  return out;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
