"use client";

import { useState } from "react";

interface Props {
  offerId: string;
  whatsappUrl: string;
  affiliateUrl: string;
  shareUrl: string; // URL da página da oferta (para redes que abrem o link)
  title: string;
}

export function ShareButtons({ offerId, whatsappUrl, affiliateUrl, shareUrl, title }: Props) {
  const [copied, setCopied] = useState(false);

  function track() {
    navigator.sendBeacon?.(`/api/track/click?offerId=${offerId}&type=share`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      track();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }

  const enc = encodeURIComponent;
  const telegram = `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(title)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  const twitter = `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}`;

  const ext =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition hover:brightness-110";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={track} className={ext} style={{ background: "#25D366", color: "#000" }}>
        💬 WhatsApp
      </a>
      <a href={telegram} target="_blank" rel="noopener noreferrer" onClick={track} className={ext} style={{ background: "#229ED9" }}>
        ✈️ Telegram
      </a>
      <a href={facebook} target="_blank" rel="noopener noreferrer" onClick={track} className={ext} style={{ background: "#1877F2" }}>
        Facebook
      </a>
      <a href={twitter} target="_blank" rel="noopener noreferrer" onClick={track} className={ext} style={{ background: "#000" }}>
        𝕏
      </a>
      <button onClick={copyLink} className="btn-ghost">
        {copied ? "✓ Link copiado!" : "🔗 Copiar link"}
      </button>
    </div>
  );
}
