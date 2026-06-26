import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv(); // fallback .env

import { connection, queues } from "@/lib/queue";
import { getSetting } from "@/lib/settings";
import { createSyncWorker } from "./syncMarketplace";
import { createCheckStatusWorker } from "./checkOfferStatus";
import { createScheduleSocialWorker } from "./scheduleSocial";
import { createGenerateImageWorker } from "./generateSocialImage";
import { createPublishWorker } from "./publishSocial";
import { createAlertWorker } from "./sendAlertEmails";
import { createWhatsappBroadcastWorker } from "./whatsappBroadcast";

/** "07:00,12:00" → ["0 7 * * *", "0 12 * * *"] */
function publishTimesToCron(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const [h, m] = t.split(":");
      return `${Number(m) || 0} ${Number(h) || 0} * * *`;
    });
}

async function main() {
  if (!connection) {
    console.error("✗ REDIS_URL não definido. Configure o Redis para rodar os workers (docker compose up -d).");
    process.exit(1);
  }

  // Workers
  const workers = [
    createSyncWorker(connection),
    createCheckStatusWorker(connection),
    createScheduleSocialWorker(connection),
    createGenerateImageWorker(connection),
    createPublishWorker(connection),
    createAlertWorker(connection),
    createWhatsappBroadcastWorker(connection),
  ];

  workers.forEach((w) =>
    w.on("failed", (job, err) => console.error(`[${w.name}] job ${job?.id} falhou:`, err.message)),
  );

  // Jobs agendados (repeatable) — idempotentes pelo jobId
  await queues.syncMarketplace?.add("sync", {}, { repeat: { every: 2 * 60 * 60_000 }, jobId: "cron-sync" });
  await queues.checkOfferStatus?.add("check", {}, { repeat: { every: 30 * 60_000 }, jobId: "cron-check" });
  await queues.sendAlertEmails?.add("alerts", {}, { repeat: { every: 4 * 60 * 60_000 }, jobId: "cron-alerts" });

  // Publicação social nos horários configurados (regra de negócio #5)
  const cronTimes = publishTimesToCron(await getSetting("publishTimes"));
  for (const pattern of cronTimes) {
    await queues.scheduleSocial?.add("schedule", {}, { repeat: { pattern }, jobId: `cron-social-${pattern}` });
  }

  console.log("✓ Workers ativos: sync, check-status, schedule-social, generate-image, publish-social, send-alerts");
  console.log(`  Agendados: sync(2h), check(30min), alerts(4h), social(${cronTimes.length} horários)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
