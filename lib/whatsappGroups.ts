import type { Category } from "@prisma/client";
import { getSetting } from "./settings";
import { getCategoryMeta } from "./categories";

export interface GroupLink {
  label: string;
  url: string;
  category?: Category;
}

/**
 * Resolve os grupos de WhatsApp relevantes para os interesses do cliente:
 * grupos por categoria configurados + o grupo geral.
 */
export async function getWhatsappGroupsFor(interests: Category[]): Promise<GroupLink[]> {
  const [defaultLink, groupsJson] = await Promise.all([
    getSetting("whatsappGroupDefault"),
    getSetting("whatsappGroups"),
  ]);

  let map: Record<string, string> = {};
  try {
    map = JSON.parse(groupsJson || "{}");
  } catch {
    map = {};
  }

  const out: GroupLink[] = [];
  if (defaultLink) out.push({ label: "Grupo geral de ofertas", url: defaultLink });

  for (const cat of interests) {
    const url = map[cat];
    if (url) out.push({ label: `Ofertas de ${getCategoryMeta(cat).label}`, url, category: cat });
  }
  return out;
}
