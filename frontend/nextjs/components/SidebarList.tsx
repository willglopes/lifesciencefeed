'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Simple truncate function to replace lodash
const truncate = (str: string, options?: { length?: number }) => {
  const length = options?.length || 100;
  return str.length > length ? str.substring(0, length) + '...' : str;
};

interface SidebarItem {
  slug: string;
  categoryName: string;
  categorySlug?: string;
  therapyAreaSlug?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
}

export default function SidebarList({
  primaryCount = 4,
  secondaryCount = 4,
  showThumbnail = false,
}: {
  primaryCount?: number;
  secondaryCount?: number;
  showThumbnail?: boolean;
}) {
  const [primaryItems, setPrimary] = useState<SidebarItem[]>([]);
  const [secondaryItems, setSecondary] = useState<SidebarItem[]>([]);
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
  
            // category name
            let categoryName = '';
            const catData = raw.category?.data ?? raw.category;
            if (catData?.attributes?.name) {
              categoryName = catData.attributes.name;
            } else if (catData?.slug) {
              categoryName = catData.name;
            }

            // category slug
            let categorySlug = '';
            const catSlugData = raw.category?.data ?? raw.category;
            if (catSlugData?.attributes?.slug) {
              categorySlug = catSlugData.attributes.slug;
            } else if (catSlugData?.slug) {
              categorySlug = catSlugData.slug;
            }

            // therapy area slug
            let therapyAreaSlug = '';
            const therapySlugData = raw.therapyArea?.data ?? raw.therapyArea;
            if (therapySlugData?.attributes?.slug) {
              therapyAreaSlug = therapySlugData.attributes.slug;
            } else if (therapySlugData?.slug) {
              therapyAreaSlug = therapySlugData.slug;
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
  
            return { slug, categoryName, categorySlug, therapyAreaSlug, title, excerpt, imageUrl };
          });

          setPrimary(items.slice(0, primaryCount));
          setSecondary(items.slice(primaryCount, total));
        } catch (err) {
          console.error('SessionSection load error:', err);
        } finally {
          setLoading(false);
        }
      }
  
      loadArticles();
    }, [primaryCount, secondaryCount]);

  if (loading) return <p className="py-8 text-center">Loading…</p>;
  if (!primaryItems.length && !secondaryItems.length) {
    return <p className="py-8 text-center">No articles.</p>;
  }

  return (
   <div className="h-full flex flex-col">
      {primaryItems.map((item) => (
        <div key={item.slug} className="flex items-start space-x-3 flex-1 border-y-1 pb-4 pt-4">
          
          <div className="flex-1 flex flex-col justify-between">
            <Link
              href={`/therapy-area/${item.therapyAreaSlug}/${item.slug}`}
              className="block font-serif text-xl hover:text-primary"
            >
              {truncate(item.title, { length: 50 })}
            </Link>
            {item.excerpt && (
              <p className="mt-2 text-sm text-gray-600">
                {truncate(item.excerpt, { length: 60 })}…
                <Link
                  href={`/therapy-area/${item.therapyAreaSlug}/${item.slug}`}
                  className="text-primary text-sm"
                >
                  Read more
                </Link>
              </p>
            )}
          </div>
          {showThumbnail && item.imageUrl && (
            <div className="w-22 h-26 flex-shrink-0 overflow-hidden rounded">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
