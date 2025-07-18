// src/components/Navbar.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavItem {
  id: number;
  name: string;
  slug: string;
}

export default function NavBar() {
  const [therapyAreas, setTherapyAreas] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<NavItem[]>([]);
  const base = process.env.NEXT_PUBLIC_STRAPI_URL;

  useEffect(() => {
    async function loadMenus() {
      try {
        // 1) THERAPY AREAS
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

        // 2) CATEGORIES
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
        console.error('❌ Navbar load error:', err);
      }
    }

    loadMenus();
  }, [base]);

  return (
    <nav className="px-4">
      <ul className="flex space-x-8">
        {/* Therapy Areas */}
        <li className="relative group">
          <button className="font-semibold text-gray-800">
            Therapy Areas
          </button>
          <ul className="
            absolute left-0 mt-2 w-48 bg-white shadow-lg rounded
            opacity-0 invisible transform translate-y-1
            transition duration-200
            group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
            z-20
          ">
            {therapyAreas.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">No areas</li>
            )}
            {therapyAreas.map((area) => (
              <li
                key={area.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 hover:rounded"
              >
                 <Image
                  src={`/icons/${area.slug}.svg`}
                  alt={area.name}
                  width={20}
                  height={20}
                  className="myIcon"
                /> 
                <Link href={`/therapy-areas/${area.slug}`}>
                  <span className="fill-current text-gray-700">{area.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* Categories */}
        <li className="relative group">
          <button className="font-semibold text-gray-800">
            Categories
          </button>
          <ul className="
            absolute left-0 mt-2 w-48 bg-white shadow-lg rounded
            opacity-0 invisible transform translate-y-1
            transition duration-200
            group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
            z-20
          ">
            {categories.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">No categories</li>
            )}
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 hover:rounded"
              >
                <Image
                  src={`/icons/${cat.slug}.svg`}
                  alt={cat.name}
                  width={20}
                  height={20}
                  color='aquamarine'
                />
                <Link href={`/category/${cat.slug}`}>
                  <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}
