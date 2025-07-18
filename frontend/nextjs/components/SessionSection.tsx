// src/components/SessionSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ArticleSummary {
  slug: string;
  therapyAreaSlug: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
}

interface SessionSectionProps {
  /** number of featured articles in the top row */
  primaryCount?: number;
  /** number of featured articles in the bottom row */
  secondaryCount?: number;
}

export default function SessionSection({
  primaryCount = 4,
  secondaryCount = 8,
}: SessionSectionProps) {
  const [primaryItems, setPrimaryItems] = useState<ArticleSummary[]>([]);
  const [secondaryItems, setSecondaryItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const total = primaryCount + secondaryCount;

    async function loadArticles() {
      try {
        const params = new URLSearchParams({
          'filters[Featured][$eq]': 'true',
          'sort[0]': 'publishedAt:desc',
          'pagination[limit]': total.toString(),
          populate: '*',
        });
        const url = `${base}/api/articles?${params.toString()}`;
        console.log('SessionSection fetching URL:', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        const json = await res.json();
        console.log('SessionSection raw JSON:', json);

        // Normalize entries: support both nested attributes or flat
        const rawEntries: any[] = Array.isArray(json.data)
          ? json.data.map((entry: any) => entry.attributes ?? entry)
          : [];

        const items: ArticleSummary[] = rawEntries.map((raw: any, idx: number) => {
          // slug
          const slug = raw.slug ?? raw.Slug ?? `item-${idx}`;          
          // therapy-area slug
          const therapyAreaSlug = raw.therapyAreaSlug?.slug ?? raw.therapyAreaSlug ?? '';
          // title
          const title = raw.Title ?? raw.title ?? '';
          // excerpt
          const excerpt = raw.Summary ?? raw.excerpt ?? raw.summary ?? '';
          // image: heroImage or image
          let imageUrl = '';
          const heroField = raw.heroImage ?? raw.heroimage;
          const imgField = raw.image;
          const heroUrl = heroField?.data?.attributes?.url ?? heroField?.url;
          const imgUrl = imgField?.data?.attributes?.url ?? imgField?.url;
          if (heroUrl) imageUrl = heroUrl;
          else if (imgUrl) imageUrl = imgUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${base}${imageUrl}`;
          }

          return { slug, title, excerpt, imageUrl };
        });

        setPrimaryItems(items.slice(0, primaryCount));
        setSecondaryItems(items.slice(primaryCount, total));
      } catch (err) {
        console.error('SessionSection load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [primaryCount, secondaryCount]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading featured articles…</div>;
  }

  if (!primaryItems.length && !secondaryItems.length) {
    return <div className="py-8 text-center text-gray-500">No featured articles available.</div>;
  }

  return (
    <section className="space-y-8 mb-12 border-t pt-4 border-gray-200">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 items-center">
        <span className="text-2xl font-serif">Featured Articles</span>
        <Link href="/articles" className="text-md font-serif justify-self-end">
          View all
        </Link>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {primaryItems.map((item, i) => (
          <div key={`${item.slug}-${i}`} className="flex flex-col">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded" />
            )}
            <h3 className="font-serif text-lg mt-2">
              <Link href={`/therapy-area/${item.therapyAreaSlug}/${item.slug}`}>{item.title}</Link>
            </h3>
            {item.excerpt && (
              <p className="text-sm text-gray-600 mt-1">
                {item.excerpt}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {secondaryItems.map((item, i) => (
          <div key={`${item.slug}-sec-${i}`} className="flex flex-col">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-24 object-cover rounded"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 rounded" />
            )}
            <h4 className="text-sm font-medium mt-1">
              <Link href={`/${item.slug}`}>{item.title}</Link>
            </h4>
          </div>
        ))}
      </div>
    </section>
  );
}
