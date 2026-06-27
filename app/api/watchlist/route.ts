import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  return user?.id ?? null;
}

/**
 * GET ?offerId= → estado de favorito de uma oferta (e se está logado).
 * GET sem offerId → lista de ids favoritados do usuário (para os cards).
 */
export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offerId");
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ loggedIn: false, favorited: false, ids: [] });

  if (!offerId) {
    const rows = await prisma.watchlist.findMany({ where: { userId }, select: { offerId: true } });
    return NextResponse.json({ loggedIn: true, ids: rows.map((r) => r.offerId) });
  }

  const fav = await prisma.watchlist.findUnique({
    where: { userId_offerId: { userId, offerId } },
    select: { id: true },
  });
  return NextResponse.json({ loggedIn: true, favorited: Boolean(fav) });
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Faça login" }, { status: 401 });
  const offerId = (await req.json().catch(() => ({})))?.offerId;
  if (typeof offerId !== "string") return NextResponse.json({ error: "offerId obrigatório" }, { status: 400 });
  await prisma.watchlist.upsert({
    where: { userId_offerId: { userId, offerId } },
    update: {},
    create: { userId, offerId },
  });
  return NextResponse.json({ ok: true, favorited: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Faça login" }, { status: 401 });
  const offerId = (await req.json().catch(() => ({})))?.offerId;
  if (typeof offerId !== "string") return NextResponse.json({ error: "offerId obrigatório" }, { status: 400 });
  await prisma.watchlist.deleteMany({ where: { userId, offerId } });
  return NextResponse.json({ ok: true, favorited: false });
}
