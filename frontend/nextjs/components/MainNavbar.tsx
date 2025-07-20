// src/components/MainNavbar.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
  id: number;
  name: string;
  slug: string;
}

interface DiseaseAreaData {
  id: number;
  name: string;
  slug: string;
  articles: any[];
  therapy_areas: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function MainNavbar() {
  const [therapyAreas, setTherapyAreas] = useState<NavItem[]>([]);
  const [diseaseAreas, setDiseaseAreas] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_STRAPI_URL;

  // Detect if we're on a therapy area page
  const isTherapyAreaPage = router.asPath?.startsWith('/therapy-area/');
  const currentSlug = isTherapyAreaPage ? router.asPath.split('/')[2] : null;

  // Load therapy areas (always needed)
  useEffect(() => {
    async function loadTherapyAreas() {
      try {
        const res = await fetch(
          `${base}/api/therapy-areas?` +
          `populate=articles&filters[articles][id][$notNull]=true&sort=name:ASC&pagination[pageSize]=100`
        );
        const json = await res.json();
        const list: NavItem[] = (json.data || [])
          .map((item: any) => ({
            id: item.id,
            name: item.attributes?.name ?? item.name ?? '',
            slug: item.attributes?.slug ?? item.slug ?? '',
          }))
          .filter((a: any) => !!a.slug);
        setTherapyAreas(list);
      } catch (e) {
        // Handle error silently in production
      }
    }
    loadTherapyAreas();
  }, [base]);

  // Load disease areas when on therapy area page
  useEffect(() => {
    if (!isTherapyAreaPage || !currentSlug) {
      setDiseaseAreas([]);
      return;
    }

    async function loadDiseaseAreas() {
      setIsLoading(true);
      try {
        // Fetch all disease areas with full population
        const res = await fetch(
          `${base}/api/disease-areas?populate=*&pagination[pageSize]=100`
        );
        
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        
        const json = await res.json();
        const allDiseaseAreas: DiseaseAreaData[] = json.data || [];
        
        // Filter for current therapy area and process the data
        const filteredDiseaseAreas = allDiseaseAreas
          .filter((item: DiseaseAreaData) => {
            // Check therapy area relationship - handle the actual data structure
            const therapyAreaSlug = item.therapy_areas?.slug;
            const isRelatedToCurrentTherapy = therapyAreaSlug === currentSlug;
            
            // Return disease areas that belong to current therapy area
            return isRelatedToCurrentTherapy;
          })
          .map((item: DiseaseAreaData) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
          }));

        setDiseaseAreas(filteredDiseaseAreas);
        
      } catch (error) {
        setDiseaseAreas([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadDiseaseAreas();
  }, [base, isTherapyAreaPage, currentSlug]);

  // Build navigation items based on current page
  const buildNavigationItems = () => {
    if (isTherapyAreaPage && diseaseAreas.length > 0) {
      // Show disease areas for this therapy area
      const diseaseAreaItems = diseaseAreas.map(da => ({
        label: da.name,
        href: `/disease-area/${da.slug}`,
        key: `da-${da.slug}`,
        type: 'disease-area' as const
      }));
      
      // Add "All Therapy Areas" link to go back
      const backToTherapyAreas = {
        label: 'All Therapy Areas',
        href: '/',
        key: 'all-therapy-areas',
        type: 'navigation' as const
      };
      
      return [
        ...diseaseAreaItems,
        backToTherapyAreas,
        { label: 'Congresses', href: '/congresses', key: 'congresses', type: 'navigation' as const },
        { label: 'Medical Education', href: '/medical-education', key: 'education', type: 'navigation' as const },
      ];
    } else {
      // Show therapy areas (default behavior)
      const therapyAreaItems = therapyAreas.map(ta => ({
        label: ta.name,
        href: `/therapy-area/${ta.slug}`,
        key: `ta-${ta.slug}`,
        type: 'therapy-area' as const
      }));
      
      return [
        ...therapyAreaItems,
        { label: 'Congresses', href: '/congresses', key: 'congresses', type: 'navigation' as const },
        { label: 'Medical Education', href: '/medical-education', key: 'education', type: 'navigation' as const },
      ];
    }
  };

  const items = buildNavigationItems();
  
  // Get current therapy area name for title
  const currentTherapyArea = therapyAreas.find(ta => ta.slug === currentSlug);
  const pageTitle = isTherapyAreaPage && currentTherapyArea 
    ? `${currentTherapyArea.name} Disease Areas`
    : 'Today on Life Science Feed';

  return (
    <nav className="bg-white border-t py-5">
      <div className="container mx-auto px-4">
        {/* Dynamic Title */}
        <div className="text-3xl font-serif text-gray-800 mb-4">
          {pageTitle}
        </div>

        {/* Breadcrumb for therapy area pages */}
        {isTherapyAreaPage && currentTherapyArea && (
          <div className="text-sm text-gray-600 mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="font-medium">{currentTherapyArea.name}</span>
            <span className="mx-2">/</span>
            <span>Disease Areas</span>
          </div>
        )}

        {/* Status indicator 
        {isTherapyAreaPage && (
          <div className="mb-4">
            {isLoading ? (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                Loading {currentTherapyArea?.name || currentSlug} disease areas...
              </div>
            ) : diseaseAreas.length > 0 ? (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                ✅ Success: Found {diseaseAreas.length} disease areas for {currentTherapyArea?.name || currentSlug}
              </div>
            ) : (
              <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded">
                ⚠️ No disease areas with articles found for {currentTherapyArea?.name || currentSlug}. Showing therapy areas instead.
              </div>
            )}
          </div>
        )} */}

        {/* Navigation Links */}
        <ul className="flex flex-wrap items-center space-x-2 text-gray-800 text-sm">
          {items.map((item, idx) => (
            <li key={item.key} className="flex items-center">
              <Link
                href={item.href}
                className={`hover:underline py-1 rounded ${
                  item.type === 'disease-area' 
                    ? '' 
                    : item.type === 'therapy-area'
                    ? ''
                    : ''
                }`}
              >
                {item.label}
              </Link>
              {/* render bullet except after the last item */}
              {idx < items.length - 1 && (
                <span className="mx-2 text-gray-400">&bull;</span>
              )}
            </li>
          ))}
        </ul>

        {/* Item count 
        {isTherapyAreaPage && (
          <div className="text-xs text-gray-500 mt-2">
            {diseaseAreas.length > 0 
              ? `Showing ${diseaseAreas.length} disease areas in ${currentTherapyArea?.name || currentSlug}`
              : `No disease areas available for ${currentTherapyArea?.name || currentSlug}`
            }
          </div>
        )} */}
      </div>
    </nav>
  );
}

