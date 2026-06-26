import { prisma } from "./prisma";
import { getSetting } from "./settings";
import { offerToVars, renderTemplate, sendWhatsappTo, isWhatsappApiConfigured } from "./social/whatsapp";
import { logger } from "./logger";

export interface BroadcastResult {
  total: number; // clientes elegíveis
  sent: number;
  skipped: number; // já receberam essa oferta
  failed: number;
  dryRun: boolean; // true quando a API não está configurada (apenas simula/registra elegíveis)
}

/**
 * Envia uma oferta no WhatsApp dos clientes que:
 *  - têm papel CUSTOMER, optaram por WhatsApp e têm telefone;
 *  - têm a categoria da oferta entre seus interesses;
 *  - ainda não receberam ESSA oferta (dedup por DirectMessage).
 *
 * Roda de forma síncrona (cap padrão 200) — funciona sem Redis. Para volumes
 * maiores, enfileire via worker `whatsapp-broadcast`.
 */
export async function broadcastOfferWhatsapp(offerId: string, cap = 200): Promise<BroadcastResult> {
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) throw new Error("Oferta não encontrada");

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      wantsWhatsapp: true,
      phone: { not: null },
      interests: { has: offer.category },
    },
    select: { id: true, phone: true, name: true },
    take: cap,
  });

  const result: BroadcastResult = {
    total: customers.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    dryRun: !isWhatsappApiConfigured(),
  };
  if (customers.length === 0) return result;

  const template = await getSetting("whatsappTemplate");
  const message = renderTemplate(template, offerToVars(offer));

  for (const c of customers) {
    // dedup: já enviou essa oferta a esse cliente?
    const already = await prisma.directMessage.findUnique({
      where: { userId_offerId_channel: { userId: c.id, offerId, channel: "WHATSAPP" } },
      select: { id: true },
    });
    if (already) {
      result.skipped++;
      continue;
    }

    if (result.dryRun) {
      // Sem API configurada: registra como PENDING (fila para envio manual/futuro).
      await prisma.directMessage.create({
        data: { userId: c.id, offerId, channel: "WHATSAPP", status: "PENDING" },
      });
      result.sent++;
      continue;
    }

    const { sent, error } = await sendWhatsappTo(c.phone!, message);
    await prisma.directMessage.create({
      data: { userId: c.id, offerId, channel: "WHATSAPP", status: sent ? "SENT" : "FAILED", error: error ?? null },
    });
    if (sent) result.sent++;
    else result.failed++;
  }

  logger.info("broadcast.whatsapp", { offerId, ...result });
  return result;
}
