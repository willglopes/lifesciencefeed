export function ArticleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.publishedAt,
    author: { "@type": "Person", name: article.author.name },
    publisher: {
      "@type": "Organization",
      name: "LifeScienceFeed",
      logo: { "@type":"ImageObject", url: "https://www.lifesciencefeed.com/logo.png" }
    },
    mainEntityOfPage: {
      "@type":"WebPage",
      "@id": `https://www.lifesciencefeed.com/${article.categorySlug}/${article.slug}`
    },
  };
}
