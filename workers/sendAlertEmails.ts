import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

/**
 * send-alert-emails (a cada 4h): para cada inscrito, agrupa ofertas novas
 * (últimas 4h) nas categorias de interesse e envia um digest via Resend.
 * Sem RESEND_API_KEY apenas registra no log (no-op).
 */
async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[alert] (mock) e-mail para ${to}: ${subject}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL ?? "ofertas@busqueioferta.com.br",
      to,
      subject,
      html,
    }),
  });
}

export function createAlertWorker(connection: ConnectionOptions) {
  return new Worker(
    QUEUE_NAMES.sendAlertEmails,
    async () => {
      const since = new Date(Date.now() - 4 * 3600_000);
      const subs = await prisma.alertSubscription.findMany({ where: { active: true } });
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

      let sent = 0;
      for (const sub of subs) {
        const offers = await prisma.offer.findMany({
          where: { status: "ACTIVE", category: { in: sub.categories }, createdAt: { gte: since } },
          orderBy: { score: "desc" },
          take: 10,
        });
        if (offers.length === 0) continue;

        const html = `
          <h2>🔥 Novas ofertas pra você</h2>
          <ul>${offers
            .map(
              (o) =>
                `<li><a href="${base}/oferta/${o.id}">${o.title}</a> — <b>${formatPrice(o.currentPrice)}</b> (-${Math.round(o.discountPercent)}%)</li>`,
            )
            .join("")}</ul>
          <p>busqueioferta</p>`;

        await sendEmail(sub.email, `${offers.length} novas ofertas das suas categorias`, html);
        await prisma.alertSubscription.update({ where: { id: sub.id }, data: { lastSentAt: new Date() } });
        sent++;
      }
      console.log(`[alert] digests enviados: ${sent}`);
      return { sent };
    },
    { connection },
  );
}
