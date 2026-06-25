import Script from "next/script";

/**
 * Google Analytics 4 — só é injetado quando NEXT_PUBLIC_GA4_MEASUREMENT_ID
 * estiver definido. Sem o ID, não renderiza nada (zero overhead).
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
