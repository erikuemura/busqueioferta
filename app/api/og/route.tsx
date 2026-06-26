import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Imagem Open Graph de marca, gerada dinamicamente.
 *   /api/og?title=Texto
 * Usada como preview social padrão das páginas (categoria, guia, cupom, etc.).
 */
export function GET(req: NextRequest) {
  const title = (req.nextUrl.searchParams.get("title") ?? "As melhores ofertas do Brasil").slice(0, 110);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "linear-gradient(135deg, #1b1410 0%, #0a0c10 60%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #FF7A33, #E11D48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
            }}
          >
            🔥
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800 }}>
            busque<span style={{ color: "#FF5A1F" }}>ioferta</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, lineHeight: 1.1, maxWidth: "1000px" }}>
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "28px", color: "#9aa6b8" }}>
          <span style={{ color: "#34d399" }}>✓</span> Ofertas, cupons e descontos verificados
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
