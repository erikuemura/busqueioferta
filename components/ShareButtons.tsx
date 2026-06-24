"use client";

import { useState } from "react";

interface Props {
  offerId: string;
  whatsappUrl: string;
  affiliateUrl: string;
}

export function ShareButtons({ offerId, whatsappUrl, affiliateUrl }: Props) {
  const [copied, setCopied] = useState(false);

  function track() {
    // incrementa shares sem bloquear a ação
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

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={track}
        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 font-semibold text-black transition hover:brightness-95"
      >
        💬 Compartilhar no WhatsApp
      </a>
      <button onClick={copyLink} className="btn-ghost">
        {copied ? "✓ Link copiado!" : "🔗 Copiar link"}
      </button>
    </div>
  );
}
