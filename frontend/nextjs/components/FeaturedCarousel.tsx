'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay' // Import Swiper styles
import 'swiper/css/pagination';
import Link from 'next/link';
import truncate from 'lodash/truncate';

export interface ArticleSummary {
  slug: string;
  categoryName?: string;
  therapyAreaSlug?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
}

interface SessionSectionProps {
  primaryCount?: number;
  secondaryCount?: number;
}

export default function FeaturedCarousel({
  primaryCount = 10,
  secondaryCount = 8,
}: SessionSectionProps) {
  // const [items, setItems] = useState<FeaturedItem[]>([]);
  
    const [primaryItems, setPrimaryItems] = useState<ArticleSummary[]>([]);
    const [secondaryItems, setSecondaryItems] = useState<ArticleSummary[]>([]);
    const [loading, setLoading] = useState(true);

  // Install autoplay
   SwiperCore.use([Autoplay]);

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

            // therapy area slug
            let therapyAreaSlug = '';
            const therapyData = raw.therapyArea?.data ?? raw.therapyArea;
            if (therapyData?.attributes?.slug) {
              therapyAreaSlug = therapyData.attributes.slug;
            } else if (therapyData?.slug) {
              therapyAreaSlug = therapyData.slug;
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
  
            return { slug, categoryName, therapyAreaSlug, title, excerpt, imageUrl };
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
    return <p className="text-center py-8">Loading featured…</p>;
  }
  if (!primaryItems.length && !secondaryItems.length) {
    return <p className="text-center py-8">No featured articles.</p>;
  }

  return (
    <div className="flex justify-center">
      <Swiper
      modules={[Autoplay, Pagination]}
        slidesPerView={1}
        autoplay={{ 
          delay: 10000,
          disableOnInteraction: false,
         }}
pagination={{ clickable: true }}
        spaceBetween={0}
        loop={true}
                speed={500}
        className="w-[820px] h-[550px]"
      >
        {primaryItems.map(a => (
          <SwiperSlide key={a.slug}>
            <Link
              href={`/${a.therapyAreaSlug}/${a.slug}`}
              className="block h-full rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative h-[550px]">
                {a.imageUrl ? (
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                {/* Title & excerpt fly in with image */}
                <div className="absolute bottom-[35px] left-[20px] right-[20px] px-4 py-2 bg-white bg-opacity-50">
                  <h3 className="text-gray-800 text-3xl font-serif p-2 rounded-lg">
                    {a.title}
                  </h3>
 {/*                 {a.excerpt && (
                    <p className="text-sm text-gray-600">
                      {truncate(a.excerpt, { length: 80 })}…{' '}
                      <span className="underline">Read more</span>
                    </p>
                  )}*/}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
