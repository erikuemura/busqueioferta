import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { runAutoPublish } from "@/lib/scheduler";

/**
 * schedule-social: roda nos horários configurados (publishTimes). Seleciona as
 * melhores ofertas e agenda posts respeitando score mínimo, dedup e limites
 * diários por plataforma. A imagem e a publicação seguem nas filas seguintes.
 */
export function createScheduleSocialWorker(connection: ConnectionOptions) {
  return new Worker(
    QUEUE_NAMES.scheduleSocial,
    async () => {
      const results = await runAutoPublish();
      results.forEach((r) =>
        console.log(`[schedule] ${r.platform}: ${r.queued} agendado(s), restam ${r.remaining}`),
      );
      if (results.length === 0) console.log("[schedule] nenhuma plataforma com credenciais — nada a publicar.");
      return results;
    },
    { connection },
  );
}
