import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const validCategories = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

const schema = z.object({
  email: z.string().email(),
  categories: z.array(z.enum(validCategories)).min(1),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "alerts"), 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Muitas tentativas. Tente em instantes." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, categories } = parsed.data;
  await prisma.alertSubscription.upsert({
    where: { email },
    update: { categories, active: true },
    create: { email, categories },
  });

  return NextResponse.json({ ok: true });
}
