/**
 * Publicação de Pins via Pinterest API v5.
 * Requer PINTEREST_ACCESS_TOKEN (escopo pins:write) + PINTEREST_BOARD_ID.
 *
 * POST /v5/pins { board_id, title, description, link, media_source }.
 * O `link` deve ser o link de afiliado — o Pinterest é ótimo para tráfego de produto.
 */
export interface PinterestPostInput {
  imageUrl: string;
  caption: string;
  title?: string;
  link?: string;
}

export function isPinterestConfigured(): boolean {
  return Boolean(process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID);
}

export async function publishToPinterest(input: PinterestPostInput): Promise<{ id: string }> {
  if (!isPinterestConfigured()) throw new Error("Pinterest não configurado (PINTEREST_ACCESS_TOKEN / PINTEREST_BOARD_ID).");
  const token = process.env.PINTEREST_ACCESS_TOKEN!;
  const boardId = process.env.PINTEREST_BOARD_ID!;

  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      board_id: boardId,
      title: (input.title ?? input.caption).slice(0, 100),
      description: input.caption.slice(0, 800),
      link: input.link,
      media_source: { source_type: "image_url", url: input.imageUrl },
    }),
  });
  if (!res.ok) throw new Error(`Pinterest publish: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
