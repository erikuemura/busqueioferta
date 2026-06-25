/**
 * Publicação em Página do Facebook via Graph API.
 * Requer Page Access Token (FACEBOOK_PAGE_ACCESS_TOKEN) + FACEBOOK_PAGE_ID
 * com a permissão `pages_manage_posts`.
 *
 * Foto com legenda: POST /{page-id}/photos { url, caption }.
 */
export interface FacebookPostInput {
  imageUrl: string;
  caption: string;
}

export function isFacebookConfigured(): boolean {
  return Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID);
}

export async function publishToFacebook(input: FacebookPostInput): Promise<{ id: string }> {
  if (!isFacebookConfigured()) throw new Error("Facebook não configurado (FACEBOOK_PAGE_ACCESS_TOKEN / FACEBOOK_PAGE_ID).");
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!;
  const pageId = process.env.FACEBOOK_PAGE_ID!;

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: input.imageUrl, caption: input.caption, access_token: token }),
  });
  if (!res.ok) throw new Error(`Facebook publish: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { post_id?: string; id: string };
  return { id: data.post_id ?? data.id };
}
