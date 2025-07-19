// src/pages/_app.tsx
import '../styles/globals.css';   // ← global styles
import type { AppProps } from 'next/app'
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next"

export default function MyApp({ Component, pageProps } ) {
  return (
    <>
      <Script
        id="google-adsense"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3386217398063878"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Component {...pageProps} />
    </>
   );
}