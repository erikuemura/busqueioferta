import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

const validCategories = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

const schema = z.object({
  email: z.string().email(),
  categories: z.array(z.enum(validCategories)).min(1),
});

export async function POST(req: NextRequest) {
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
