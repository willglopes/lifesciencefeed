// src/components/Footer.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavItem {
  id: number;
  name: string;
  slug: string;
}

export default function Footer() {
  const [therapyAreas, setTherapyAreas] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavItem[]>([]);
  const base = process.env.NEXT_PUBLIC_STRAPI_URL;

  useEffect(() => {
    const loadFooterLinks = async () => {
      try {
        // 1) Fetch Therapy Areas that have at least one article
        const taRes = await fetch(
          `${base}/api/therapy-areas?` +
          `populate=articles&filters[articles][id][$notNull]=true&sort=name:ASC&pagination[pageSize]=100`
        );
        const taJson = await taRes.json();
        console.log('🛎 raw therapy-areas response:', taJson);

        const taList: NavItem[] = (taJson.data || [])
          .map((item: any) => {
            // support both flat and nested
            const attr = item.attributes ?? item;
            const artArr = attr.articles?.data ?? attr.articles ?? [];
            return {
              id: item.id,
              name: attr.name,
              slug: attr.slug,
              _articleCount: Array.isArray(artArr) ? artArr.length : 0,
            };
          })
          .filter((it: any) => it._articleCount > 0)
          .map(({ id, name, slug }) => ({ id, name, slug }));

        setTherapyAreas(taList);

        // 2) Fetch Categories that have at least one article
        const catRes = await fetch(
          `${base}/api/categories?` +
          `populate=articles&filters[articles][id][$notNull]=true&sort=name:ASC&pagination[pageSize]=100`
        );
        const catJson = await catRes.json();
        console.log('🛎 raw categories response:', catJson);

        const catList: NavItem[] = (catJson.data || [])
          .map((item: any) => {
            const attr = item.attributes ?? item;
            const artArr = attr.articles?.data ?? attr.articles ?? [];
            return {
              id: item.id,
              name: attr.name,
              slug: attr.slug,
              _articleCount: Array.isArray(artArr) ? artArr.length : 0,
            };
          })
          .filter((it: any) => it._articleCount > 0)
          .map(({ id, name, slug }) => ({ id, name, slug }));

        setCategories(catList);
      } catch (err) {
        console.error('Footer load error:', err);
      }
    };

    loadFooterLinks();
  }, [base]);

  // Helpful links (sorted alphabetically)
  const helpful = [
    'About Us',
    'Accessibility',
    'Contact Us',
    'Privacy Notice',
    'Terms of Use',
    'For Advertisers',
    'Policies',
  ].sort();

  return (
    <footer className="mt-auto border-t bg-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-12 px-4">
        <div className="text-sm text-gray-700 md:flex-1 mb-6 md:mb-0">
          <span>Life Science Feed Company is a registered company in Ireland.</span>
          <br /><span>Registered office: Dublin, Ireland.</span>
        </div>

        <div className="flex flex-col md:flex-row gap-16">
          {/* Therapy Areas Column */}
          <div>
            <h3 className="mb-2 font-serif text-gray-700 text-lg">Therapy Areas</h3>
            <ul className="space-y-1 text-gray-500 text-sm">
              {therapyAreas.length === 0 && <li>No areas to show</li>}
              {therapyAreas.map((ta) => (
                <li key={ta.slug}>
                  <Link href={`/therapy-area/${ta.slug}`}>{ta.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="mb-2 font-serif text-gray-700 text-lg">Categories</h3>
            <ul className="space-y-1 text-gray-500 text-sm">
              {categories.length === 0 && <li>No categories to show</li>}
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Helpful Links Column */}
          <div>
            <h3 className="mb-2 font-serif text-gray-700 text-lg">Helpful Links</h3>
            <ul className="space-y-1 text-gray-500 text-sm">
              {helpful.map((label) => {
                const href =
                  label === 'Accessibility'
                    ? '/accessibility'
                    : '/' + label.toLowerCase().replace(/\s+/g, '-');
                return (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-12 px-4 mt-6 text-xs text-gray-600">
        <span> All material on this website is protected by copyright. Copyright © 2025-{new Date().getFullYear()} by Life Science Feed. All rights reserved. </span>
        
      </div>
      
    </footer>
  );
}
