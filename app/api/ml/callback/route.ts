import { type NextRequest } from "next/server";
import { mlExchangeCode } from "@/lib/marketplaces/mlAuth";
import { absoluteUrl } from "@/lib/seo";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function html(title: string, body: string, ok: boolean, detail?: string) {
  return new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;background:#0a0c10;color:#e9edf3;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}
    .c{max-width:520px}.b{display:inline-block;margin-top:16px;background:#FF5A1F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:12px;font-weight:700}
    .e{font-size:48px}
    .d{margin-top:14px;text-align:left;background:#151922;border:1px solid #232936;border-radius:10px;padding:10px 14px;font-size:12px;color:#f59e0b;white-space:pre-wrap;word-break:break-word}
    </style></head>
    <body><div class="c"><div class="e">${ok ? "✅" : "⚠️"}</div><h1>${title}</h1><p style="color:#9aa6b8">${body}</p>
    ${detail ? `<div class="d">${detail}</div>` : ""}
    <a class="b" href="${absoluteUrl("/admin/configuracoes")}">Voltar ao painel</a></div></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

/** Redirect URI do app ML: troca o code por tokens e guarda o refresh token. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  if (error || !code) {
    return html("Autorização não concluída", "Você cancelou ou houve um erro. Tente novamente.", false, error ?? undefined);
  }
  const redirectUri = absoluteUrl("/api/ml/callback");
  const result = await mlExchangeCode(code, redirectUri);
  if (!result.ok) logger.error("ml.exchange_failed", new Error(result.error), { redirectUri });
  return result.ok
    ? html("Mercado Livre conectado!", "Pronto — já podemos buscar ofertas reais com seu link de afiliado.", true)
    : html("Falha ao conectar", "Não foi possível trocar o código. Veja o detalhe técnico abaixo.", false, result.error);
}
