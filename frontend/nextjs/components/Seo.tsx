// components/Seo.tsx
import { ArticleSummary } from '../lib/api';

export function ArticleSchema(article: ArticleSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.ImageUrl,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "Life Science Feed"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Life Science Feed"
    }
  };
}

export function WebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Life Science Feed",
    "description": "Your only reliable one-stop shop for medical news, clinical reference, and education.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://lifesciencefeed.com"
  };
}

export function OrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Life Science Feed",
    "description": "Medical news and clinical reference platform",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://lifesciencefeed.com"
  };
}

// Default export for easier importing
const Seo = {
  ArticleSchema,
  WebsiteSchema,
  OrganizationSchema
};

export default Seo;

