import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { organizationLd, webSiteLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700", "800"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "busqueioferta";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — As melhores ofertas e descontos do Brasil`,
    template: `%s · ${siteName}`,
  },
  description:
    "Curadoria inteligente das melhores ofertas, cupons e descontos dos principais marketplaces do Brasil. Economize de verdade.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName,
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: siteName },
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
        <FavoritesProvider>{children}</FavoritesProvider>
        <ScrollToTop />
        <CookieConsent />
        <PWAInstallPrompt />
        <JsonLd data={[organizationLd(), webSiteLd()]} />
        <Analytics />
      </body>
    </html>
  );
}
