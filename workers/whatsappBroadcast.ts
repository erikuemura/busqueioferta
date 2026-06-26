import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { broadcastOfferWhatsapp } from "@/lib/broadcast";

interface JobData {
  offerId: string;
}

/**
 * whatsapp-broadcast: envia uma oferta no WhatsApp dos clientes do nicho.
 * Reutiliza a mesma função usada pelo painel (dedup + status em DirectMessage).
 */
export function createWhatsappBroadcastWorker(connection: ConnectionOptions) {
  return new Worker<JobData>(
    QUEUE_NAMES.whatsappBroadcast,
    async (job) => {
      const r = await broadcastOfferWhatsapp(job.data.offerId, 5000);
      console.log(`[broadcast] oferta ${job.data.offerId}:`, r);
      return r;
    },
    { connection },
  );
}
