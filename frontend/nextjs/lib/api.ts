// Fixed API functions based on working Cardiology.tsx approach

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
 * Fetch disease areas for a specific therapy area - using working approach
 */
export async function fetchDiseaseAreasByTherapyArea(therapyAreaSlug: string): Promise<SectionMeta[]> {
  try {
    const params = new URLSearchParams({
      'filters[therapy_areas][slug][$eq]': therapyAreaSlug,
      'sort[0]': 'name:ASC',
      'pagination[limit]': '100',
      populate: '*',
    });
    
    const json = await fetchJSON(`/api/disease-areas?${params}`);
    const data = Array.isArray(json.data) ? json.data : [];
    
    return data.map((entry: any) => {
      const raw = entry.attributes ?? entry;
      return {
        name: raw.name ?? entry.name ?? '',
        slug: raw.slug ?? entry.slug ?? '',
      };
    });
  } catch (error) {
    return [];
  }
}

/**
 * Fetch articles for a given section - using the WORKING approach from Cardiology.tsx
 */
export async function fetchArticlesBySection(
  section: 'therapy-area' | 'category' | 'disease-area',
  slug: string
): Promise<ArticleSummary[]> {
  try {
    let filterKey: string;
    
    switch (section) {
      case 'therapy-area':
        filterKey = 'therapy_areas';
        break;
      case 'category':
        filterKey = 'category';
        break;
      case 'disease-area':
        filterKey = 'disease_areas';
        break;
      default:
        throw new Error(`Unknown section type: ${section}`);
    }

    // Use the EXACT same approach as working Cardiology.tsx
    const params = new URLSearchParams({
      [`filters[${filterKey}][slug][$eq]`]: slug,
      'sort[0]': 'publishedAt:desc',
      'pagination[limit]': '100',
      populate: '*', // Simple populate like the working version
    });

    const json = await fetchJSON(`/api/articles?${params}`);
    const data = Array.isArray(json.data) ? json.data : [];

    // Use the EXACT same data processing as working Cardiology.tsx
    return data.map((entry: any) => {
      const raw = entry.attributes ?? entry;
      
      // Slug
      const articleSlug = raw.slug ?? entry.slug ?? '';
      
      // Title
      const title = raw.title ?? raw.Title ?? entry.Title ?? '';
      
      // Excerpt
      const excerpt = raw.excerpt ?? raw.summary ?? raw.Summary ?? '';
      
      // Published date
      const publishedAt = raw.publishedAt ?? entry.publishedAt ?? '';
      
      // Image URL
      let ImageUrl: string | null = null;
      const heroData = raw.heroImage?.data ?? raw.heroImage;
      const url = heroData?.attributes?.url ?? heroData?.url;
      if (url) {
        ImageUrl = url.startsWith('http') ? url : `${BASE}${url}`;
      }
      
      // Category
      const categoryData = raw.category?.data ?? raw.category;
      const categoryName = categoryData?.attributes?.name ?? categoryData?.name ?? null;
      const categorySlug = categoryData?.attributes?.slug ?? categoryData?.slug ?? null;
      
      // Disease area
      const diseaseAreaData = raw.disease_areas?.data?.[0] ?? raw.disease_areas?.[0];
      const diseaseAreaName = diseaseAreaData?.attributes?.name ?? diseaseAreaData?.name ?? null;
      const diseaseAreaSlug = diseaseAreaData?.attributes?.slug ?? diseaseAreaData?.slug ?? null;

      return {
        slug: articleSlug,
        title,
        excerpt,
        ImageUrl,
        publishedAt,
        categoryName,
        categorySlug,
        diseaseAreaName,
        diseaseAreaSlug,
      };
    });
    
  } catch (error) {
    return [];
  }
}

/**
 * Fetch articles that have any disease area - using working approach
 */
export async function fetchArticlesWithDiseaseAreas(): Promise<ArticleSummary[]> {
  try {
    const params = new URLSearchParams({
      'filters[disease_areas][id][$notNull]': 'true',
      'sort[0]': 'publishedAt:desc',
      'pagination[limit]': '100',
      populate: '*',
    });

    const json = await fetchJSON(`/api/articles?${params}`);
    const data = Array.isArray(json.data) ? json.data : [];

    return data.map((entry: any) => {
      const raw = entry.attributes ?? entry;
      
      const articleSlug = raw.slug ?? entry.slug ?? '';
      const title = raw.title ?? raw.Title ?? entry.Title ?? '';
      const excerpt = raw.excerpt ?? raw.summary ?? raw.Summary ?? '';
      const publishedAt = raw.publishedAt ?? entry.publishedAt ?? '';
      
      let ImageUrl: string | null = null;
      const heroData = raw.heroImage?.data ?? raw.heroImage;
      const url = heroData?.attributes?.url ?? heroData?.url;
      if (url) {
        ImageUrl = url.startsWith('http') ? url : `${BASE}${url}`;
      }
      
      const categoryData = raw.category?.data ?? raw.category;
      const categoryName = categoryData?.attributes?.name ?? categoryData?.name ?? null;
      const categorySlug = categoryData?.attributes?.slug ?? categoryData?.slug ?? null;
      
      const diseaseAreaData = raw.disease_areas?.data?.[0] ?? raw.disease_areas?.[0];
      const diseaseAreaName = diseaseAreaData?.attributes?.name ?? diseaseAreaData?.name ?? null;
      const diseaseAreaSlug = diseaseAreaData?.attributes?.slug ?? diseaseAreaData?.slug ?? null;

      return {
        slug: articleSlug,
        title,
        excerpt,
        ImageUrl,
        publishedAt,
        categoryName,
        categorySlug,
        diseaseAreaName,
        diseaseAreaSlug,
      };
    });
    
  } catch (error) {
    return [];
  }
}

/**
 * Get article counts by disease area for a specific therapy area
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

/**
 * Fetch articles by disease area slug
 */