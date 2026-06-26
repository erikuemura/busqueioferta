import { Queue } from "bullmq";
import IORedis from "ioredis";

/**
 * Conexão Redis compartilhada pelas filas BullMQ.
 * Se REDIS_URL não estiver definido, exportamos `null` e os enqueues viram no-op,
 * para que o app Next rode sem Redis durante o desenvolvimento.
 */
export const redisUrl = process.env.REDIS_URL;

export const connection = redisUrl
  ? new IORedis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true })
  : null;

export const QUEUE_NAMES = {
  syncMarketplace: "sync-marketplace",
  checkOfferStatus: "check-offer-status",
  scheduleSocial: "schedule-social",
  generateSocialImage: "generate-social-image",
  publishSocial: "publish-social",
  sendAlertEmails: "send-alert-emails",
  whatsappBroadcast: "whatsapp-broadcast",
} as const;

function makeQueue(name: string): Queue | null {
  return connection ? new Queue(name, { connection }) : null;
}

export const queues = {
  syncMarketplace: makeQueue(QUEUE_NAMES.syncMarketplace),
  checkOfferStatus: makeQueue(QUEUE_NAMES.checkOfferStatus),
  scheduleSocial: makeQueue(QUEUE_NAMES.scheduleSocial),
  generateSocialImage: makeQueue(QUEUE_NAMES.generateSocialImage),
  publishSocial: makeQueue(QUEUE_NAMES.publishSocial),
  sendAlertEmails: makeQueue(QUEUE_NAMES.sendAlertEmails),
  whatsappBroadcast: makeQueue(QUEUE_NAMES.whatsappBroadcast),
};

/** Enfileira a geração de imagem social para uma oferta (no-op sem Redis). */
export async function enqueueGenerateSocialImage(offerId: string, platform: string) {
  if (!queues.generateSocialImage) return false;
  await queues.generateSocialImage.add("generate", { offerId, platform });
  return true;
}

export async function enqueuePublishSocial(socialPostId: string) {
  if (!queues.publishSocial) return false;
  await queues.publishSocial.add("publish", { socialPostId });
  return true;
}

export async function enqueueWhatsappBroadcast(offerId: string) {
  if (!queues.whatsappBroadcast) return false;
  await queues.whatsappBroadcast.add("broadcast", { offerId });
  return true;
}
