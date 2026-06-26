import type { Offer } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { getMarketplaceMeta } from "@/lib/categories";

export interface TemplateVars {
  titulo: string;
  marketplace: string;
  precoOriginal: string;
  preco: string;
  desconto: string;
  link: string;
  perfil: string;
}

export function offerToVars(offer: Pick<Offer, "title" | "marketplace" | "originalPrice" | "currentPrice" | "discountPercent" | "affiliateUrl">): TemplateVars {
  return {
    titulo: offer.title,
    marketplace: getMarketplaceMeta(offer.marketplace).label,
    precoOriginal: formatPrice(offer.originalPrice),
    preco: formatPrice(offer.currentPrice),
    desconto: String(Math.round(offer.discountPercent)),
    link: offer.affiliateUrl,
    perfil: process.env.NEXT_PUBLIC_SOCIAL_HANDLE ?? "@busqueioferta",
  };
}

/** Substitui {variavel} no template. Suporta ~~texto~~ (riscado do WhatsApp). */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return (vars as unknown as Record<string, string>)[key] ?? `{${key}}`;
  });
}

/** Monta a URL wa.me com o texto já codificado. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Envia mensagem via API de WhatsApp (Zapi / Evolution).
 * No MVP, se não configurado, apenas devolve a mensagem pronta para envio manual.
 */
export async function sendWhatsappMessage(message: string): Promise<{ sent: boolean; message: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!apiUrl || !token) return { sent: false, message };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  return { sent: res.ok, message };
}

export function isWhatsappApiConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

/**
 * Normaliza telefone brasileiro para o formato E.164 sem '+': 55 + DDD + número.
 * Aceita entradas com máscara; devolve null se claramente inválido.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (!d.startsWith("55") && (d.length === 10 || d.length === 11)) d = "55" + d;
  // 55 + DDD(2) + 8/9 dígitos = 12 ou 13
  if (d.length < 12 || d.length > 13) return null;
  return d;
}

/**
 * Envia uma mensagem a um número específico via API de WhatsApp.
 * O corpo é configurável por provedor (Zapi/Evolution):
 *  - Zapi:      { phone, message }
 *  - Evolution: { number, text } → defina WHATSAPP_API_BODY=evolution
 */
export async function sendWhatsappTo(phone: string, message: string): Promise<{ sent: boolean; error?: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!apiUrl || !token) return { sent: false, error: "WhatsApp API não configurada" };

  const normalized = normalizePhone(phone);
  if (!normalized) return { sent: false, error: "Telefone inválido" };

  const evolution = process.env.WHATSAPP_API_BODY === "evolution";
  const body = evolution ? { number: normalized, text: message } : { phone: normalized, message };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { sent: false, error: `HTTP ${res.status}` };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: (err as Error).message };
  }
}
