import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

/** Registra (ou atualiza) uma inscrição de push, ligando ao cliente se logado. */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "push"), 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Inscrição inválida" }, { status: 400 });

  const { endpoint, keys } = parsed.data;
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: user?.id ?? null },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: user?.id ?? null },
  });

  return NextResponse.json({ ok: true });
}

/** Cancela uma inscrição pelo endpoint. */
export async function DELETE(req: NextRequest) {
  const endpoint = (await req.json().catch(() => ({})))?.endpoint;
  if (typeof endpoint === "string") {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }
  return NextResponse.json({ ok: true });
}
