// pages/[therapyAreaSlug]/[articleSlug].tsx - Fixed version with proper error handling
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

interface Article {
  id: number;
  Title: string;
  slug: string;
  Summary: string;
  Content: any[];
  heroImageUrl?: string | null;
  therapyAreas: { name: string; slug: string }[];
}

interface Props {
  article: Article;
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    
    if (!strapiUrl) {
      console.warn('NEXT_PUBLIC_STRAPI_URL not configured');
      return { paths: [], fallback: 'blocking' };
    }

    const res = await fetch(
      `${strapiUrl}/api/articles?populate=therapyAreas&pagination[pageSize]=50`
    );

    // Check if response is actually JSON
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType || !contentType.includes('application/json')) {
      console.warn('API returned non-JSON response:', res.status, res.statusText);
      return { paths: [], fallback: 'blocking' };
    }

    const json = await res.json();

    // Safely generate paths with validation
    const paths = (json.data || []).flatMap((item: any) => {
      if (!item?.attributes?.slug) return [];
      
      const therapyAreas = item.attributes.therapyAreas?.data || [];
      return therapyAreas
        .filter((ta: any) => ta?.attributes?.slug)
        .map((ta: any) => ({
          params: {
            therapyAreaSlug: ta.attributes.slug,
            articleSlug: item.attributes.slug,
          },
        }));
    });

    return { 
      paths: paths.slice(0, 100), // Limit paths to prevent timeout
      fallback: 'blocking' 
    };
  } catch (error) {
    console.error('getStaticPaths error:', error);
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  try {
    const { therapyAreaSlug, articleSlug } = params as {
      therapyAreaSlug: string;
      articleSlug: string;
    };

    if (!therapyAreaSlug || !articleSlug) {
      return { notFound: true };
    }

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    
    if (!strapiUrl) {
      console.error('NEXT_PUBLIC_STRAPI_URL not configured');
      return { notFound: true };
    }

    const res = await fetch(
      `${strapiUrl}/api/articles?` +
      `filters[slug][$eq]=${articleSlug}&populate=heroImage,therapyAreas`
    );

    // Check if response is actually JSON
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType || !contentType.includes('application/json')) {
      console.warn('Article API returned non-JSON response:', res.status, res.statusText);
      return { notFound: true };
    }

    const json = await res.json();
    const data = json.data?.[0];
    
    if (!data) {
      return { notFound: true };
    }

    const item = data.attributes;

    // Validate that this article belongs to the requested therapy area
    const hasTherapyArea = (item.therapyAreas?.data || []).some(
      (ta: any) => ta.attributes.slug === therapyAreaSlug
    );

    if (!hasTherapyArea) {
      return { notFound: true };
    }

    // Safely construct article object
    const article: Article = {
      id: data.id,
      Title: item.Title || 'Untitled Article',
      slug: item.slug || articleSlug,
      Summary: item.Summary || '',
      Content: Array.isArray(item.Content) ? item.Content : [],
      heroImageUrl: item.heroImage?.data?.attributes?.url || null,
      therapyAreas: (item.therapyAreas?.data || []).map((ta: any) => ({
  name: ta.attributes?.name || 'Unknown',
  slug: ta.attributes?.slug || '',
})).filter((ta: { name: string; slug: string }) => ta.slug), // Remove invalid therapy areas

    };

    return { 
      props: { article },
      revalidate: 300, // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    return { notFound: true };
  }
};

// Safe content renderer component
function ContentRenderer({ content }: { content: any[] }) {
  if (!Array.isArray(content) || content.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Article content is being loaded. Please check back later for the full content.
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      {content.map((block, idx) => (
        <div key={idx} className="mb-4">
          {/* Basic content rendering - replace with your rich-text renderer */}
          {typeof block === 'string' ? (
            <p>{block}</p>
          ) : block?.type === 'paragraph' ? (
            <p>{block.children?.map((child: any, i: number) => (
              <span key={i}>{child.text || ''}</span>
            ))}</p>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(block, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Breadcrumb component
function Breadcrumb({ article, therapyAreaSlug }: { article: Article; therapyAreaSlug: string }) {
  const currentTherapyArea = article.therapyAreas.find(ta => ta.slug === therapyAreaSlug);
  
  return (
    <nav className="text-sm mb-6 text-gray-600">
      <Link href="/" className="hover:text-blue-600">
        Home
      </Link>
      <span className="mx-2">/</span>
      <Link href="/therapy-areas" className="hover:text-blue-600">
        Therapy Areas
      </Link>
      {currentTherapyArea && (
        <>
          <span className="mx-2">/</span>
          <Link href={`/therapy-area/${currentTherapyArea.slug}`} className="hover:text-blue-600">
            {currentTherapyArea.name}
          </Link>
        </>
      )}
      <span className="mx-2">/</span>
      <span className="text-gray-900 font-medium">
        {article.Title}
      </span>
    </nav>
  );
}

// Related therapy areas component
function RelatedTherapyAreas({ therapyAreas, currentSlug }: { therapyAreas: { name: string; slug: string }[]; currentSlug: string }) {
  const otherAreas = therapyAreas.filter(ta => ta.slug !== currentSlug);
  
  if (otherAreas.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Also available in:</h3>
      <div className="flex flex-wrap gap-2">
        {otherAreas.map((ta) => (
          <Link 
            key={ta.slug}
            href={`/therapy-area/${ta.slug}`}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200 transition-colors"
          >
            {ta.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ArticlePage({ article }: Props) {
  const currentTherapyArea = article.therapyAreas[0]; // Use first therapy area for URL structure
  
  return (
    <>
      <Head>
        <title>{article.Title} | Life Science Feed</title>
        <meta name="description" content={article.Summary} />
        <meta property="og:title" content={article.Title} />
        <meta property="og:description" content={article.Summary} />
        <meta property="og:type" content="article" />
        {article.heroImageUrl && (
          <meta property="og:image" content={article.heroImageUrl} />
        )}
      </Head>
      
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb article={article} therapyAreaSlug={currentTherapyArea?.slug || ''} />

        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.Title}
            </h1>
            
            {article.Summary && (
              <p className="text-xl text-gray-700 leading-relaxed mb-6 border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                {article.Summary}
              </p>
            )}
            
            {/* Therapy Area Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.therapyAreas.map((ta) => (
                <Link
                  key={ta.slug}
                  href={`/therapy-area/${ta.slug}`}
                  className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded hover:bg-red-200 transition-colors"
                >
                  {ta.name}
                </Link>
              ))}
            </div>
          </header>

          {/* Hero Image */}
          {article.heroImageUrl && (
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={article.heroImageUrl}
                alt={article.Title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="mb-8">
            <ContentRenderer content={article.Content} />
          </div>

          {/* Related Therapy Areas */}
          <RelatedTherapyAreas 
            therapyAreas={article.therapyAreas} 
            currentSlug={currentTherapyArea?.slug || ''} 
          />
        </article>
      </main>

      <Footer />
    </>
  );
}

