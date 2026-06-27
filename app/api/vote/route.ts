import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  offerId: z.string(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

const COOKIE = "bo_voter";

/**
 * Voto no termômetro da oferta. Dedup por cookie (1 voto por oferta).
 * Reclicar o mesmo valor remove o voto (toggle).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "vote"), 60, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Voto inválido" }, { status: 400 });
  const { offerId, value } = parsed.data;

  let voterKey = req.cookies.get(COOKIE)?.value;
  const newCookie = !voterKey;
  if (!voterKey) voterKey = crypto.randomUUID();

  const existing = await prisma.offerVote.findUnique({
    where: { offerId_voterKey: { offerId, voterKey } },
    select: { value: true },
  });

  let delta = 0;
  let myVote = 0;
  if (!existing) {
    await prisma.offerVote.create({ data: { offerId, voterKey, value } });
    delta = value;
    myVote = value;
  } else if (existing.value === value) {
    // toggle off
    await prisma.offerVote.delete({ where: { offerId_voterKey: { offerId, voterKey } } });
    delta = -existing.value;
    myVote = 0;
  } else {
    await prisma.offerVote.update({ where: { offerId_voterKey: { offerId, voterKey } }, data: { value } });
    delta = value - existing.value;
    myVote = value;
  }

  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: { temperature: { increment: delta } },
    select: { temperature: true },
  });

  const res = NextResponse.json({ temperature: offer.temperature, myVote });
  if (newCookie) {
    res.cookies.set(COOKIE, voterKey, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return res;
}

/** GET ?offerId= → temperatura atual e voto do usuário. */
export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offerId");
  if (!offerId) return NextResponse.json({ temperature: 0, myVote: 0 });
  const voterKey = req.cookies.get(COOKIE)?.value;
  const [offer, vote] = await Promise.all([
    prisma.offer.findUnique({ where: { id: offerId }, select: { temperature: true } }),
    voterKey
      ? prisma.offerVote.findUnique({ where: { offerId_voterKey: { offerId, voterKey } }, select: { value: true } })
      : Promise.resolve(null),
  ]);
  return NextResponse.json({ temperature: offer?.temperature ?? 0, myVote: vote?.value ?? 0 });
}
