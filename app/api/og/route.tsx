import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Imagem Open Graph de marca, gerada dinamicamente.
 *   /api/og?title=Texto
 * Regras do satori: todo elemento com >1 filho precisa de display:flex; emojis
 * são evitados (exigem fonte de emoji).
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              marginRight: "18px",
              background: "linear-gradient(135deg, #FF8A3D, #FF5A1F 55%, #E11D48)",
            }}
          />
          <div style={{ display: "flex", fontSize: "36px", fontWeight: 800 }}>
            <span>busque</span>
            <span style={{ color: "#FF5A1F" }}>ioferta</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "66px", fontWeight: 800, lineHeight: 1.1, maxWidth: "1040px" }}>
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: "30px", color: "#34d399" }}>
          <div style={{ display: "flex", color: "#9aa6b8" }}>Ofertas, cupons e descontos verificados</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
