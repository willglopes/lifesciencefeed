// src/components/SessionSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ArticleSummary {
  slug: string;
  categoryName?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
}

interface SessionSectionProps {
  primaryCount?: number;
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
    let base = process.env.NEXT_PUBLIC_STRAPI_URL ?? '';
    if (!base && typeof window !== 'undefined') {
      base = window.location.origin;
    }
    console.log('SessionSection base URL:', base);

    async function loadArticles() {
      try {
        const total = primaryCount + secondaryCount;
        const params = new URLSearchParams({
          'sort[0]': 'publishedAt:desc',
          'pagination[limit]': String(total),
          populate: '*',
        });
        const res = await fetch(`${base}/api/articles?${params}`);
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
        const json = await res.json();
        console.log('SessionSection raw JSON:', json);

        const entries = Array.isArray(json.data) ? json.data : [];

        const items = entries.map((entry: any) => {
          // entry may already be flattened, or have entry.attributes
          const raw = entry.attributes ?? entry;

          // slug
          const slug =
            raw.slug ??
            entry.slug ??
            raw.Slug ??
            '';

          // title (handle Title vs title)
          const title =
            raw.title ??
            raw.Title ??
            entry.Title ??
            '';

          // category slug
          let categoryName = '';
          const catData = raw.category?.data ?? raw.category;
          if (catData?.attributes?.name) {
            categoryName = catData.attributes.name;
          } else if (catData?.slug) {
            categoryName = catData.name;
          }

          // excerpt/summary
          const excerpt =
            raw.excerpt ??
            raw.summary ??
            raw.Summary ??
            '';

          // image URL: handle heroImage.data.attributes.url, heroImage.url, or image formats
          let imageUrl = '';
          const heroField = raw.heroImage?.data ?? raw.heroImage;
          const urlFromHero =
            heroField?.attributes?.url ??
            heroField?.url;
          if (urlFromHero) {
            imageUrl = urlFromHero.startsWith('http')
              ? urlFromHero
              : `${base}${urlFromHero}`;
          }

          return { slug, categoryName, title, excerpt, imageUrl };
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
    return <div className="py-8 text-center text-gray-500">Loading articles…</div>;
  }
  if (!primaryItems.length && !secondaryItems.length) {
    return <div className="py-8 text-center text-gray-500">No articles available.</div>;
  }

  return (

     // Full-bleed wrapper
    <div
      className="
        bg-gray-100             /* whatever bg you like */
        relative               /* needed for the left/right offsets */
        w-[99.5vw]              /* full viewport width */
        left-1/2               /* shift it right by 50% of its parent */
        right-1/2              /* (just to make sure) */
        ml-[-50vw]             /* pull it back left by 50vw */
        mr-[-50vw]             /* pull it back right by 50vw */
      "
    >
            {/* Inner “container” that matches the rest of your page */}
      <div className="container mx-auto px-4 py-8">
    <section className="space-y-8 mb-12 pt-4">
      <div className='w-full pb-4 mb-6 grid grid-cols-1 sm:grid-cols-2 items-center inline-flex '>
        <span className='text-2xl font-serif'>Congresses</span>
        <span className='text-md font-serif float-left'>&nbsp;around the World {new Date().getFullYear()}</span>
        <Link href="/articles" className='text-md font-serif ml-auto'>View all</Link>
      </div>
      {/* Primary */}
      {primaryItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {primaryItems.map((item) => (
            <div key={item.slug} className="flex flex-col">
              <img
                src={item.imageUrl || '/images/placeholder-600x400.png'}
                alt={item.title}
                className="w-full h-40 object-cover rounded"
              />
              <p className="mt-2 text-sm text-gray-600">{item.categoryName}</p>
              <h3 className="font-serif text-lg mt-1">
                <Link href={`/${item.categoryName}/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Secondary */}
{/*      {secondaryItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {secondaryItems.map((item) => (
            <div key={item.slug} className="flex flex-col">
              <img
                src={item.imageUrl || '/images/placeholder-600x400.png'}
                alt={item.title}
                className="w-full h-24 object-cover rounded"
              />
              <h4 className="text-sm font-medium mt-1">
                <Link href={`/${item.categoryName}/${item.slug}`}>
                  {item.title}
                </Link>
              </h4>
            </div>
          ))}
        </div> 
      )}*/}
    </section>
    </div>
    </div>
  );
}