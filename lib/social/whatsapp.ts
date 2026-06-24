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
