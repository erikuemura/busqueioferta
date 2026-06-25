import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Ofertas e cupons do Brasil`,
    short_name: SITE_NAME,
    description: "As melhores ofertas, promoções e cupons dos principais marketplaces do Brasil.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0c10",
    theme_color: "#FF5A1F",
    lang: "pt-BR",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
