/**
 * Publicação no Instagram via Graph API (Fase 2).
 * Requer conta Business + Facebook App aprovado (escopo instagram_content_publish).
 *
 * Fluxo de 2 passos:
 *  1. POST /{ig-user-id}/media  { image_url, caption } → creation_id
 *  2. POST /{ig-user-id}/media_publish { creation_id }
 */
export interface InstagramPostInput {
  imageUrl: string;
  caption: string;
}

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
}

export async function publishToInstagram(input: InstagramPostInput): Promise<{ id: string }> {
  if (!isInstagramConfigured()) {
    throw new Error("Instagram não configurado (INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID).");
  }
  const token = process.env.INSTAGRAM_ACCESS_TOKEN!;
  const igUser = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
  const base = "https://graph.facebook.com/v21.0";

  const createRes = await fetch(`${base}/${igUser}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: input.imageUrl, caption: input.caption, access_token: token }),
  });
  if (!createRes.ok) throw new Error(`IG create media: ${createRes.status} ${await createRes.text()}`);
  const { id: creationId } = (await createRes.json()) as { id: string };

  const pubRes = await fetch(`${base}/${igUser}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  if (!pubRes.ok) throw new Error(`IG publish: ${pubRes.status} ${await pubRes.text()}`);
  return (await pubRes.json()) as { id: string };
}
