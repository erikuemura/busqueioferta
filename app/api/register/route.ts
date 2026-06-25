import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({
  name: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().min(1).max(80).optional(),
  ),
  email: z.string().email(),
  password: z.string().min(6, "A senha precisa de ao menos 6 caracteres"),
});

/** Cadastro de cliente (role CUSTOMER). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "register"), 8, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Muitas tentativas. Tente em instantes." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado. Faça login." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, password: hashed, role: "CUSTOMER", wantsEmail: true, wantsWhatsapp: true },
  });

  return NextResponse.json({ ok: true });
}
