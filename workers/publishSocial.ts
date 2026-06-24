import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/social/whatsapp";
import { publishToInstagram } from "@/lib/social/instagram";
import { publishToTikTok } from "@/lib/social/tiktok";
import { publishToTelegram } from "@/lib/social/telegram";

interface JobData {
  socialPostId: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * publish-social: publica o SocialPost na rede correspondente.
 * Imagens locais (/generated/...) são convertidas em URL absoluta para as APIs.
 */
export function createPublishWorker(connection: ConnectionOptions) {
  return new Worker<JobData>(
    QUEUE_NAMES.publishSocial,
    async (job) => {
      const post = await prisma.socialPost.findUnique({ where: { id: job.data.socialPostId } });
      if (!post) throw new Error("SocialPost não encontrado");
      const caption = post.caption ?? "";
      const imageUrl = post.imageUrl?.startsWith("/") ? `${SITE_URL}${post.imageUrl}` : post.imageUrl ?? undefined;

      try {
        let externalId: string | undefined;
        switch (post.platform) {
          case "WHATSAPP": {
            const r = await sendWhatsappMessage(caption);
            externalId = r.sent ? "sent" : undefined;
            break;
          }
          case "INSTAGRAM": {
            if (imageUrl) externalId = (await publishToInstagram({ imageUrl, caption })).id;
            break;
          }
          case "TIKTOK": {
            if (imageUrl) externalId = (await publishToTikTok({ imageUrl, caption })).id;
            break;
          }
          case "TELEGRAM": {
            externalId = String((await publishToTelegram({ caption, imageUrl })).id);
            break;
          }
        }

        await prisma.socialPost.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: new Date(), externalId, error: null },
        });
        return { published: true, externalId };
      } catch (err) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: { status: "FAILED", error: (err as Error).message },
        });
        throw err;
      }
    },
    { connection },
  );
}
