// src/components/Cardiology.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ArticleSummary {
  slug: string;
  category?: string;
  therapy_areas?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
}

interface CardiologyProps {
  /** how many to show in the top grid */
  primaryCount?: number;
  /** how many to show in the bottom row */
  secondaryCount?: number;
}

export default function Cardiology({
  primaryCount = 4,
  secondaryCount = 8,
}: CardiologyProps) {
  const [primaryItems, setPrimaryItems] = useState<ArticleSummary[]>([]);
  const [secondaryItems, setSecondaryItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_STRAPI_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '');
    const total = primaryCount + secondaryCount;

    async function load() {
      try {
        const params = new URLSearchParams({
          'filters[category][slug][$eq]': 'perspectives',
          'sort[0]': 'publishedAt:desc',
          'pagination[limit]': total.toString(),
          populate: '*',
        });
        const res = await fetch(`${base}/api/articles?${params}`);
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        const items = data.map((entry: any) => {
          const raw = entry.attributes ?? entry;
          // slug
          const slug = raw.slug ?? entry.slug ?? '';
          // title
          const title =
            raw.title ?? raw.Title ?? entry.Title ?? '';
          // categorySlug for detail page links
          const cat =
            raw.therapy_areas?.data?.attributes?.slug ??
            raw.therapy_areas?.slug ??
            '';
          // excerpt
          const excerpt =
            raw.excerpt ??
            raw.summary ??
            raw.Summary ??
            '';
          // image
          let imageUrl = '';
          const heroData = raw.heroImage?.data ?? raw.heroImage;
          const url =
            heroData?.attributes?.url ?? heroData?.url;
          if (url) {
            imageUrl = url.startsWith('http')
              ? url
              : `${base}${url}`;
          }
          return { slug, therapy_areas: cat, title, excerpt, imageUrl };
        });

        setPrimaryItems(items.slice(0, primaryCount));
        setSecondaryItems(items.slice(primaryCount, total));
      } catch (err) {
        console.error('Cardiology load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [primaryCount, secondaryCount]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading cardiology…
      </div>
    );
  }
  if (!primaryItems.length && !secondaryItems.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No cardiology articles available.
      </div>
    );
  }

  return (
    <section className="space-y-8 mb-12 border-t pt-4 border-gray-200">
      {/* header */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 items-center">
        <span className="text-2xl font-serif">Perspectives</span>
        <Link
          href="/category/perspectives"
          className="text-md font-serif justify-self-end"
        >
          View all
        </Link>
      </div>

      {/* primary grid */}
      {primaryItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {primaryItems.map(item => (
            <div key={item.slug} className="flex flex-col">
              <img
                src={item.imageUrl || '/images/placeholder-600x400.png'}
                alt={item.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-serif text-lg mt-2">
                <Link
                  href={`/${item.therapy_areas}/${item.slug}`}
                  className="hover:text-primary"
                >
                  {item.title}
                </Link>
              </h3>
              {item.excerpt && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* secondary row */}
      {secondaryItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {secondaryItems.map(item => (
            <div key={item.slug} className="flex flex-col">
              <img
                src={item.imageUrl || '/images/placeholder-600x400.png'}
                alt={item.title}
                className="w-full h-24 object-cover rounded"
              />
              <h4 className="text-sm font-medium mt-1">
                <Link
                  href={`/${item.therapy_areas}/${item.slug}`}
                  className="hover:text-primary"
                >
                  {item.title}
                </Link>
              </h4>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
