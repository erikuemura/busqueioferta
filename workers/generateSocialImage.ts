import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES, enqueuePublishSocial } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { generateOfferImage } from "@/lib/imageGenerator";
import { getCategoryMeta } from "@/lib/categories";

interface JobData {
  offerId: string;
  platform: string;
}

const OUTPUT_DIR = path.join(process.cwd(), "public", "generated");

/**
 * generate-social-image: gera a arte (quadrada p/ feed, story p/ stories),
 * salva em /public/generated (troque por Cloudinary em produção) e atualiza
 * o SocialPost; em seguida enfileira a publicação.
 */
export function createGenerateImageWorker(connection: ConnectionOptions) {
  return new Worker<JobData>(
    QUEUE_NAMES.generateSocialImage,
    async (job) => {
      const { offerId, platform } = job.data;
      const offer = await prisma.offer.findUnique({ where: { id: offerId } });
      if (!offer) throw new Error(`Oferta ${offerId} não encontrada`);

      const format = platform === "INSTAGRAM" || platform === "TIKTOK" ? "story" : "square";
      const buffer = await generateOfferImage({
        productImage: offer.imageUrl,
        title: offer.title,
        originalPrice: offer.originalPrice,
        currentPrice: offer.currentPrice,
        discountPercent: offer.discountPercent,
        marketplace: offer.marketplace,
        gradient: getCategoryMeta(offer.category).gradient,
        format,
      });

      await mkdir(OUTPUT_DIR, { recursive: true });
      const fileName = `${offerId}-${platform.toLowerCase()}.png`;
      await writeFile(path.join(OUTPUT_DIR, fileName), buffer);
      const imageUrl = `/generated/${fileName}`;

      const post = await prisma.socialPost.findFirst({
        where: { offerId, platform: platform as never, status: { in: ["PENDING", "FAILED"] } },
        orderBy: { createdAt: "desc" },
      });
      if (post) {
        await prisma.socialPost.update({ where: { id: post.id }, data: { imageUrl, status: "SCHEDULED" } });
        await enqueuePublishSocial(post.id);
      }

      return { imageUrl };
    },
    { connection },
  );
}
