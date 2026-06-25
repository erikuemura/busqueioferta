"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";

const VALID = new Set(CATEGORIES.map((c) => c.value));

export interface ProfileInput {
  name?: string;
  phone?: string;
  interests: string[];
  wantsWhatsapp: boolean;
  wantsEmail: boolean;
}

export async function updateProfileAction(input: ProfileInput) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/entrar");

  const interests = input.interests.filter((c) => VALID.has(c as Category)) as Category[];
  // normaliza telefone: só dígitos (com DDI/DDD)
  const phone = input.phone ? input.phone.replace(/\D/g, "") : null;

  await prisma.user.update({
    where: { email },
    data: {
      name: input.name?.trim() || undefined,
      phone,
      interests,
      wantsWhatsapp: input.wantsWhatsapp,
      wantsEmail: input.wantsEmail,
    },
  });

  revalidatePath("/conta");
  return { ok: true };
}
