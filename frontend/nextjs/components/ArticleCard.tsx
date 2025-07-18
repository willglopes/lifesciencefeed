import Link from "next/link";
import Image from "next/image";

export interface ArticleProps {
  article: {
    slug: string;
    title: string;
    excerpt?: string;
    imageUrl?: string;
    categorySlug?: string;
  };
}

export default function ArticleCard({ article }: ArticleProps) {
  const href = article.categorySlug
    ? `/${article.categorySlug}/${article.slug}`
    : `/${article.slug}`;

  return (
    // Move all styling onto the Link itself
    <Link
      href={href}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {article.imageUrl && (
        <div className="h-48 relative">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
