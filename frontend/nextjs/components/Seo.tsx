// src/components/Seo.tsx
import Head from "next/head";

interface SeoProps {
  title: string;
  description?: string;
}

export default function Seo({ title, description }: SeoProps) {
  const base = "LifeScienceFeed.com";
  return (
    <Head>
      <title>{base} - {title}</title>
      {description && <meta name="description" content={description} />}
      <meta charSet="utf-8" />
      <link rel="icon" href="/images/favicon.png" />
      {/* you can add og: tags here too */}
    </Head>
  );
}
