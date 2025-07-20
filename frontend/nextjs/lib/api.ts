// src/lib/api.ts
import MainNavbar from '../components/MainNavbar'

const BASE = process.env.NEXT_PUBLIC_STRAPI_URL || ''

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
  return res.json()
}

export interface SectionMeta {
  name: string
  slug: string
}

export interface ArticleSummary {
  slug: string
  title: string
  excerpt: string
  ImageUrl: string | null
  publishedAt: string
  categoryName: string | null
  categorySlug: string | null
  diseaseAreaName?: string | null
  diseaseAreaSlug?: string | null
  therapyAreaName?: string | null
  therapyAreaSlug?: string | null
}

/** Fetch all therapy areas (name+slug) */
export async function fetchTherapyAreas(): Promise<SectionMeta[]> {
  const json = await fetchJSON(
    `/api/therapy-areas?sort=name:ASC&pagination[pageSize]=100&locale=en`
  );
  return (json.data || []).map((item: any) => ({
    name: item.attributes?.name ?? item.name ?? '',
    slug: item.attributes?.slug ?? item.slug ?? '',
  }));
}

/** Fetch all categories (name+slug) */
export async function fetchCategories(): Promise<SectionMeta[]> {
  const json = await fetchJSON(
    `/api/categories?sort=name:ASC&pagination[pageSize]=100&locale=en`
  );
  return (json.data || []).map((item: any) => ({
    name: item.attributes?.name ?? item.name ?? '',
    slug: item.attributes?.slug ?? item.slug ?? '',
  }));
}

/** Fetch all disease areas (name+slug) */
export async function fetchDiseaseAreas(): Promise<SectionMeta[]> {
  try {
    const json = await fetchJSON(
      `/api/disease-areas?sort=name:ASC&pagination[pageSize]=100&locale=en`
    );
    return (json.data || []).map((item: any) => ({
      name: item.attributes?.name ?? item.name ?? '',
      slug: item.attributes?.slug ?? item.slug ?? '',
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetch disease areas for a specific therapy area by therapy area slug.
 * Uses proper server-side filtering based on your Strapi structure.
 */
export async function fetchDiseaseAreasByTherapyArea(therapyAreaSlug: string): Promise<SectionMeta[]> {
  try {
    const filteringApproaches = [
      `/api/disease-areas?filters[therapy_areas][slug][$eq]=${therapyAreaSlug}&sort=name:ASC&pagination[pageSize]=100&locale=en`,
      `/api/disease-areas?populate[therapy_areas][fields][0]=slug&filters[therapy_areas][slug][$eq]=${therapyAreaSlug}&sort=name:ASC&pagination[pageSize]=100&locale=en`,
      `/api/disease-areas?filters[therapy_areas.slug][$eq]=${therapyAreaSlug}&sort=name:ASC&pagination[pageSize]=100&locale=en`,
      `/api/disease-areas?populate=therapy_areas&filters[therapy_areas][slug]=${therapyAreaSlug}&sort=name:ASC&pagination[pageSize]=100&locale=en`,
    ];
    
    for (const approach of filteringApproaches) {
      try {
        const json = await fetchJSON(approach);
        
        if (json.data && json.data.length > 0) {
          return json.data.map((item: any) => ({
            name: item.attributes?.name ?? item.name ?? '',
            slug: item.attributes?.slug ?? item.slug ?? '',
          }));
        }
      } catch (error) {
        continue;
      }
    }
    
    // Fallback to basic fetch with manual filtering
    const json = await fetchJSON(
      `/api/disease-areas?populate=therapy_areas&sort=name:ASC&pagination[pageSize]=100&locale=en`
    );
    
    const filteredData = (json.data || []).filter((item: any) => {
      const therapyArea = item.therapy_areas || item.attributes?.therapy_areas?.data?.attributes;
      return therapyArea?.slug === therapyAreaSlug;
    });
    
    return filteredData.map((item: any) => ({
      name: item.attributes?.name ?? item.name ?? '',
      slug: item.attributes?.slug ?? item.slug ?? '',
    }));
    
  } catch (error) {
    return [];
  }
}

/**
 * Fetch articles for a given section (therapy-area, category, or disease-area) by its slug.
 * Uses proper server-side filtering.
 */
export async function fetchArticlesBySection(
  section: 'therapy-area' | 'category' | 'disease-area',
  slug: string
): Promise<ArticleSummary[]> {
  try {
    let filterKey: string;
    let populateFields = 'heroImage,category';
    
    switch (section) {
      case 'therapy-area':
        filterKey = 'therapy_areas';
        populateFields = 'heroImage,category,therapy_areas';
        break;
      case 'category':
        filterKey = 'category';
        populateFields = 'heroImage,category';
        break;
      case 'disease-area':
        filterKey = 'disease_areas';
        populateFields = 'heroImage,category,disease_areas';
        break;
      default:
        throw new Error(`Unknown section type: ${section}`);
    }

    const filteringApproaches = [
      `/api/articles?filters[${filterKey}][slug][$eq]=${slug}&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=${populateFields}`,
      `/api/articles?filters[${filterKey}.slug][$eq]=${slug}&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=${populateFields}`,
      `/api/articles?populate[${filterKey}][fields][0]=slug&filters[${filterKey}][slug][$eq]=${slug}&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=${populateFields}`,
    ];

    for (const approach of filteringApproaches) {
      try {
        const json = await fetchJSON(approach);
        
        if (json.data) {
          return processArticleData(json.data);
        }
      } catch (error) {
        continue;
      }
    }

    return [];
    
  } catch (error) {
    return [];
  }
}

/**
 * Process article data into ArticleSummary format
 */
function processArticleData(entries: any[]): ArticleSummary[] {
  return entries.map((entry) => {
    const attrs = entry.attributes || {};
    
    // Image URL or null
    const hero = attrs.heroImage?.data;
    let ImageUrl: string | null = null;
    if (hero?.attributes?.url) {
      const url = hero.attributes.url;
      ImageUrl = url.startsWith('http') ? url : `${BASE}${url}`;
    }
    
    // Category fields or null
    const cat = attrs.category?.data?.attributes;
    const categoryName = cat?.name ?? null;
    const categorySlug = cat?.slug ?? null;
    
    // Disease area fields or null
    let diseaseAreaName: string | null = null;
    let diseaseAreaSlug: string | null = null;
    
    const diseaseAreas = attrs.disease_areas?.data;
    if (diseaseAreas && diseaseAreas.length > 0) {
      const firstDiseaseArea = diseaseAreas[0]?.attributes;
      diseaseAreaName = firstDiseaseArea?.name ?? null;
      diseaseAreaSlug = firstDiseaseArea?.slug ?? null;
    }

    return {
      slug: attrs.slug ?? '',
      title: attrs.title ?? '',
      excerpt: attrs.excerpt ?? attrs.summary ?? '',
      ImageUrl,
      publishedAt: attrs.publishedAt ?? '',
      categoryName,
      categorySlug,
      diseaseAreaName,
      diseaseAreaSlug,
    };
  });
}

/**
 * Fetch articles that have any disease area assigned to them.
 * Uses server-side filtering to get only articles with disease areas.
 */
export async function fetchArticlesWithDiseaseAreas(): Promise<ArticleSummary[]> {
  try {
    const filteringApproaches = [
      `/api/articles?filters[disease_areas][id][$notNull]=true&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=heroImage,category,disease_areas`,
      `/api/articles?filters[disease_areas][$notNull]=true&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=heroImage,category,disease_areas`,
      `/api/articles?filters[disease_areas][$exists]=true&sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=heroImage,category,disease_areas`,
    ];

    for (const approach of filteringApproaches) {
      try {
        const json = await fetchJSON(approach);
        
        if (json.data) {
          return processArticleData(json.data);
        }
      } catch (error) {
        continue;
      }
    }

    // Fallback: fetch all articles and filter manually
    const json = await fetchJSON(
      `/api/articles?sort=publishedAt:desc&pagination[pageSize]=100&locale=en&populate=heroImage,category,disease_areas`
    );
    
    const articlesWithDiseaseAreas = (json.data || []).filter((entry: any) => {
      const diseaseAreas = entry.attributes?.disease_areas?.data;
      return diseaseAreas && diseaseAreas.length > 0;
    });

    return processArticleData(articlesWithDiseaseAreas);
    
  } catch (error) {
    return [];
  }
}

/**
 * Get article counts by disease area for a specific therapy area.
 * Uses server-side filtering for efficiency.
 */
export async function getArticleCountsByDiseaseArea(therapyAreaSlug: string): Promise<{ [diseaseAreaSlug: string]: number }> {
  try {
    const diseaseAreas = await fetchDiseaseAreasByTherapyArea(therapyAreaSlug);
    const counts: { [diseaseAreaSlug: string]: number } = {};
    
    for (const diseaseArea of diseaseAreas) {
      try {
        const articles = await fetchArticlesBySection('disease-area', diseaseArea.slug);
        counts[diseaseArea.slug] = articles.length;
      } catch (error) {
        counts[diseaseArea.slug] = 0;
      }
    }
    
    return counts;
  } catch (error) {
    return {};
  }
}

