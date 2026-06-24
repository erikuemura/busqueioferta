/**
 * Publicação no TikTok via Content Posting API (modo PHOTO).
 *
 * Pré-requisitos no TikTok for Developers:
 *  - App com escopo `video.publish` (e `video.upload`) aprovado.
 *  - O domínio das imagens (PULL_FROM_URL) precisa estar VERIFICADO no portal,
 *    senão o init falha. Em produção use o domínio público do site/CDN.
 *  - Apps não auditados só publicam com privacy_level = "SELF_ONLY" (rascunho
 *    privado). Após a auditoria, libere "PUBLIC_TO_EVERYONE".
 *    Configure via TIKTOK_PRIVACY_LEVEL.
 *
 * Fluxo: init (devolve publish_id) → polling de status até PUBLISH_COMPLETE.
 */
const API = "https://open.tiktokapis.com/v2";

export interface TikTokPostInput {
  imageUrl: string;
  caption: string;
  title?: string;
}

export function isTikTokConfigured(): boolean {
  return Boolean(process.env.TIKTOK_ACCESS_TOKEN);
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchStatus(publishId: string): Promise<{ status: string; failReason?: string }> {
  const res = await fetch(`${API}/post/publish/status/fetch/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ publish_id: publishId }),
  });
  if (!res.ok) throw new Error(`TikTok status: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data?: { status?: string; fail_reason?: string } };
  return { status: json.data?.status ?? "UNKNOWN", failReason: json.data?.fail_reason };
}

export async function publishToTikTok(input: TikTokPostInput): Promise<{ id: string }> {
  if (!isTikTokConfigured()) {
    throw new Error("TikTok não configurado (TIKTOK_ACCESS_TOKEN).");
  }

  const privacy = process.env.TIKTOK_PRIVACY_LEVEL ?? "SELF_ONLY";

  const initRes = await fetch(`${API}/post/publish/content/init/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      post_info: {
        title: input.title ?? input.caption.slice(0, 90),
        description: input.caption,
        privacy_level: privacy,
        disable_comment: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_cover_index: 0,
        photo_images: [input.imageUrl],
      },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    }),
  });

  if (!initRes.ok) throw new Error(`TikTok init: ${initRes.status} ${await initRes.text()}`);
  const initJson = (await initRes.json()) as {
    data?: { publish_id?: string };
    error?: { code?: string; message?: string };
  };
  const publishId = initJson.data?.publish_id;
  if (!publishId) {
    throw new Error(`TikTok init sem publish_id: ${initJson.error?.message ?? JSON.stringify(initJson)}`);
  }

  // Polling de status (até ~30s)
  for (let attempt = 0; attempt < 10; attempt++) {
    await sleep(3000);
    const { status, failReason } = await fetchStatus(publishId);
    if (status === "PUBLISH_COMPLETE") return { id: publishId };
    if (status === "FAILED") throw new Error(`TikTok publish falhou: ${failReason ?? "desconhecido"}`);
  }

  // Ainda processando — devolve o id; o status pode ser reconsultado depois.
  return { id: publishId };
}
