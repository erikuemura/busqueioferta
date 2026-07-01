import { getSetting } from "@/lib/settings";
import { absoluteUrl } from "@/lib/seo";
import { requireSession } from "../../guard";
import { CaptureBookmarklet } from "./CaptureBookmarklet";

export const dynamic = "force-dynamic";

/**
 * Gera o código do bookmarklet: roda no navegador do próprio usuário (não no
 * nosso servidor) quando ele clica o favorito estando na página de um produto.
 * Lê campos comuns de título/preço/imagem via seletores best-effort e envia
 * para /api/capture. Sem automação servidor→marketplace.
 */
function buildBookmarkletCode(captureUrl: string, token: string): string {
  const js = `
(function(){
  function txt(sel){var e=document.querySelector(sel);return e?e.textContent.trim():null;}
  function img(sel){var e=document.querySelector(sel);return e?(e.src||e.getAttribute('data-src')||null):null;}
  function num(s){if(!s)return null;var n=parseFloat(s.replace(/[^0-9,.-]/g,'').replace(/\\.(?=.*\\.)/g,'').replace(',','.'));return isNaN(n)?null:n;}

  var title = txt('.ui-pdp-title') || txt('h1') || document.title;
  var priceFraction = txt('.ui-pdp-price__second-line .andes-money-amount__fraction') || txt('.andes-money-amount__fraction');
  var currentPrice = num(priceFraction);
  var originalText = txt('.ui-pdp-price__original-value .andes-money-amount__fraction') || txt('s .andes-money-amount__fraction');
  var originalPrice = num(originalText) || currentPrice;
  // sanidade: "preço original" só faz sentido se for MAIOR que o atual —
  // evita mandar um valor lido por engano de outro elemento da página
  if (!originalPrice || originalPrice <= currentPrice) originalPrice = currentPrice;
  var image = img('.ui-pdp-gallery__figure img') || img('.ui-pdp-image') || img('picture img');

  if(!title || !currentPrice){
    alert('busqueioferta: não consegui ler título/preço nesta página. Preencha manualmente no painel.');
    return;
  }

  fetch('${captureUrl}', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      token: '${token}',
      url: location.href,
      title: title,
      imageUrl: image || '',
      currentPrice: currentPrice,
      originalPrice: originalPrice
    })
  }).then(function(r){return r.json();}).then(function(d){
    if(d.ok){ alert('✅ Oferta capturada como rascunho! Abra o painel para revisar.'); }
    else { alert('Erro: ' + (d.error || 'falha desconhecida')); }
  }).catch(function(){ alert('Não foi possível enviar. Confira sua internet e tente de novo.'); });
})();`;
  return `javascript:${encodeURIComponent(js.replace(/\s+/g, " ").trim())}`;
}

export default async function CapturePage() {
  await requireSession();
  const token = await getSetting("captureToken");
  const captureUrl = absoluteUrl("/api/capture");
  const bookmarklet = token ? buildBookmarkletCode(captureUrl, token) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Capturar oferta (bookmarklet)</h1>
        <p className="mt-1 text-gray-400">
          Arraste o botão abaixo para a barra de favoritos. Quando estiver navegando numa página de
          produto (ex.: Mercado Livre), clique nele — os dados são lidos no{" "}
          <strong>seu navegador</strong> e a oferta entra como rascunho para você revisar.
        </p>
      </div>

      <CaptureBookmarklet bookmarklet={bookmarklet} hasToken={Boolean(token)} />

      <div className="card space-y-2 p-5 text-sm text-gray-400">
        <h2 className="font-semibold text-white">Como funciona</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Gere o token (uma vez) e arraste o bookmarklet para os favoritos do navegador.</li>
          <li>Navegue normalmente até a página do produto que você quer publicar.</li>
          <li>Clique no bookmarklet — ele lê título, preço e imagem da própria página.</li>
          <li>A oferta é criada como <strong>rascunho</strong>; revise e publique em Ofertas.</li>
        </ol>
        <p className="pt-2 text-xs text-amber-400">
          ⚠️ Isso não faz busca nem monitoramento automático — só captura a página que você já está
          visualizando, no momento em que você clica.
        </p>
      </div>
    </div>
  );
}
