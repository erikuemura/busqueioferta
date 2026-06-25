import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { requireSession } from "../guard";
import { RetryButton } from "./RetryButton";
import { AutoPublishButton } from "./AutoPublishButton";

export const dynamic = "force-dynamic";

const PLATFORMS = ["WHATSAPP", "INSTAGRAM", "TIKTOK", "TELEGRAM"] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-500/15 text-gray-300",
  SCHEDULED: "bg-sky-500/15 text-sky-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
};

export default async function SocialPage({ searchParams }: { searchParams: { platform?: string } }) {
  await requireSession();

  const where: Prisma.SocialPostWhereInput = searchParams.platform
    ? { platform: searchParams.platform as never }
    : {};

  const posts = await prisma.socialPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { offer: { select: { id: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Fila de publicação social</h1>
        <AutoPublishButton />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/social" className={chip(!searchParams.platform)}>
          Todas
        </Link>
        {PLATFORMS.map((p) => (
          <Link key={p} href={`/admin/social?platform=${p}`} className={chip(searchParams.platform === p)}>
            {p}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="card p-8 text-center text-gray-500">
          Nenhuma publicação na fila. Publique uma oferta em <Link href="/admin/ofertas" className="text-brand">Ofertas</Link>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <div key={p.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{p.platform}</span>
                <span className={`rounded px-2 py-0.5 font-semibold ${STATUS_COLORS[p.status]}`}>{p.status}</span>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl ?? `/api/social/${p.offer.id}/image?format=square`}
                alt="arte"
                className="aspect-square w-full rounded-lg border border-[var(--border)] object-cover"
              />

              <Link href={`/admin/ofertas/${p.offer.id}/editar`} className="line-clamp-1 text-sm hover:text-brand">
                {p.offer.title}
              </Link>

              {p.caption && (
                <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--bg)] p-2 text-xs text-gray-400">
                  {p.caption}
                </pre>
              )}

              <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                <span>{formatDateTime(p.publishedAt ?? p.createdAt)}</span>
                {p.status === "FAILED" && <RetryButton id={p.id} />}
              </div>
              {p.error && <p className="text-xs text-accent">{p.error}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-brand text-white" : "border border-[var(--border)] text-gray-300 hover:bg-white/5"
  }`;
}
