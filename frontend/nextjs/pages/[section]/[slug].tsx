// pages/[section]/[slug].tsx - Complete version with conditional CTA
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import HeroCTA, { LoggedInWelcome } from '../../components/HeroCTA';
import {
  fetchTherapyAreas,
  fetchCategories,
  fetchDiseaseAreas,
  fetchDiseaseAreasByTherapyArea,
  fetchArticlesBySection,
  fetchArticlesWithDiseaseAreas,
  ArticleSummary,
  SectionMeta,
} from '../../lib/api';

type Section = 'therapy-area' | 'category' | 'disease-area';

interface LandingProps {
  sectionType: Section;
  sectionMeta: SectionMeta;
  articles: ArticleSummary[];
  latestNews: ArticleSummary[];
  diseaseAreas: SectionMeta[] | null;
  parentTherapyArea: SectionMeta | null;
}

// Icon Components
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7"></path>
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15,3 21,3 21,9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

// Custom hook for authentication status (replace with your auth logic)
function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => {
    // Replace this with your actual authentication check
    // Example: check localStorage, cookies, or call an API
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('userName');
      
      setIsLoggedIn(!!token);
      setUserName(user || undefined);
    };

    checkAuth();
  }, []);

  return { isLoggedIn, userName };
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const areas = await fetchTherapyAreas();
    const cats = await fetchCategories();
    const diseaseAreas = await fetchDiseaseAreas();

    const validAreas = areas.filter(t => t.slug && typeof t.slug === 'string' && t.slug.trim());
    const validCats = cats.filter(c => c.slug && typeof c.slug === 'string' && c.slug.trim());
    const validDiseaseAreas = diseaseAreas.filter(d => d.slug && typeof d.slug === 'string' && d.slug.trim());

    const paths = [
      ...validAreas.map(t => ({ params: { section: 'therapy-area', slug: t.slug } })),
      ...validCats.map(c => ({ params: { section: 'category', slug: c.slug } })),
      ...validDiseaseAreas.map(d => ({ params: { section: 'disease-area', slug: d.slug } })),
    ];

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<LandingProps> = async ({ params }) => {
  try {
    const section = params?.section as Section;
    const slug = params?.slug as string;

    if (!section || !slug) {
      return { notFound: true };
    }

    let allSections: SectionMeta[] = [];
    let sectionMeta: SectionMeta = { name: slug, slug };
    let diseaseAreas: SectionMeta[] = [];
    let parentTherapyArea: SectionMeta | null = null;

    switch (section) {
      case 'therapy-area':
        allSections = await fetchTherapyAreas();
        sectionMeta = allSections.find(s => s.slug === slug) ?? { name: slug, slug };
        diseaseAreas = await fetchDiseaseAreasByTherapyArea(slug);
        break;
      
      case 'category':
        allSections = await fetchCategories();
        sectionMeta = allSections.find(s => s.slug === slug) ?? { name: slug, slug };
        break;
      
      case 'disease-area':
        allSections = await fetchDiseaseAreas();
        sectionMeta = allSections.find(s => s.slug === slug) ?? { name: slug, slug };
        
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/disease-areas?populate=therapy_areas&pagination[pageSize]=100`
          );
          if (response.ok) {
            const json = await response.json();
            const diseaseAreaWithTherapy = json.data?.find((item: any) => item.slug === slug);
            if (diseaseAreaWithTherapy?.therapy_areas) {
              parentTherapyArea = {
                name: diseaseAreaWithTherapy.therapy_areas.name,
                slug: diseaseAreaWithTherapy.therapy_areas.slug,
              };
            }
          }
        } catch (error) {
          // Handle error silently
        }
        break;
    }

    const articles = await fetchArticlesBySection(section, slug);
    const latestNews = await fetchArticlesWithDiseaseAreas();

    return {
      props: {
        sectionType: section,
        sectionMeta,
        articles: articles.slice(0, 10),
        latestNews: latestNews.slice(0, 20),
        diseaseAreas: diseaseAreas.length > 0 ? diseaseAreas : null,
        parentTherapyArea,
      },
      revalidate: 300,
    };
  } catch (error) {
    return { notFound: true };
  }
};

// Updated Hero Section with better background control and conditional CTA
function FullWidthHeroSection({ 
  sectionName, 
  diseaseAreas,
  isLoggedIn = false,
  userName 
}: { 
  sectionName: string;
  diseaseAreas: SectionMeta[] | null;
  isLoggedIn?: boolean;
  userName?: string;
}) {
  // Image Configuration Constants
  const backgroundImage = "/images/f64b4b61-2eba-400a-9a3e-26a1863b3fd5.png";
  const heroHeight = isLoggedIn ? "180px" : "320px"; // Shorter for logged-in users
  const backgroundTransform = "scaleX(-1)";
  const overlayOpacity = isLoggedIn ? 0.3 : 0.4; // Lighter overlay for logged-in
 // const overlayColor = isLoggedIn ? "bg-black bg-opacity-30" : "mask-type-luminance fill-red-700/70";

  // Better background positioning - change these values for different crops
  const backgroundStyles = {
    backgroundImage: `url("${backgroundImage}")`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center 75%', // Try: 'center top', 'left center', '25% 75%', etc.
    transform: backgroundTransform,
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: heroHeight }}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0"
        style={backgroundStyles}
      ></div>
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      ></div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        {/* Main Title 
        <h1 className={`font-light text-white mb-4 ${isLoggedIn ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>
          {sectionName}
        </h1> */}
        
        {/* Disease Area Navigation Tabs 
        {diseaseAreas && diseaseAreas.length > 0 && (
          <div className={isLoggedIn ? "mb-0" : "mb-6"}>
            <div className="flex flex-wrap gap-1 text-sm">
              {diseaseAreas.slice(0, 8).map((disease, index) => (
                <Link
                  key={disease.slug}
                  href={`/disease-area/${disease.slug}`}
                  className="px-3 py-1 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-all duration-200 whitespace-nowrap border border-white border-opacity-30"
                >
                  {disease.name}
                  {index === 0 && <span className="ml-1 text-yellow-300">⭐</span>}
                </Link>
              ))}
              {diseaseAreas.length > 8 && (
                <Link
                  href="#"
                  className="px-3 py-1 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-all duration-200 flex items-center gap-1"
                >
                  View All
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
          </div>
        )}*/}

        {/* Conditional CTA Section */}
        {!isLoggedIn && <HeroCTA />}
        {isLoggedIn && <LoggedInWelcome userName={userName} />}
      </div>
    </div>
  );
}

// Rest of your components (ArticleThumbnail, CongressInfo, etc.) remain the same...
function ArticleThumbnail({ 
  article, 
  showSummary = false 
}: { 
  article: ArticleSummary; 
  showSummary?: boolean;
}) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {article.ImageUrl && (
        <div className="relative aspect-video bg-gray-200">
          <Image
            src={article.ImageUrl}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 hover:text-blue-600 transition-colors">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        
        {article.categoryName && (
          <div className="mb-2">
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
              {article.categoryName}
            </span>
          </div>
        )}
        
        {showSummary && article.excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <CalendarIcon />
          <span>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </article>
  );
}

function CongressInfo({ sectionName }: { sectionName: string }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 mb-4">
      <div className="flex items-center mb-3">
        <div className="bg-green-600 rounded-full p-2 mr-3">
          <MapPinIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Upcoming {sectionName} Congress</h3>
      </div>
      
      <div className="mb-3">
        <h4 className="font-medium text-gray-800 text-sm mb-2">
          European {sectionName} Congress 2025
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center">
            <CalendarIcon />
            <span className="ml-1">Aug 30 - Sep 2, 2025</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon />
            <span className="ml-1">Amsterdam, Netherlands</span>
          </div>
        </div>
      </div>
      
      <button className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center">
        <ExternalLinkIcon className="w-3 h-3 mr-1" />
        Register Now
      </button>
    </div>
  );
}

function SmallAdBanner() {
  return (
    <div className="bg-gray-100 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
      <div className="text-gray-500 mb-2">
        <div className="text-2xl mb-1">📢</div>
        <h3 className="font-medium text-xs">Advertisement</h3>
      </div>
      <div className="bg-white rounded p-3">
        <div className="h-20 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">Small Ad Banner</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        300x100 • Banner Ad
      </p>
    </div>
  );
}

function GoogleAdSpace() {
  return (
    <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-dashed border-gray-300 h-full flex flex-col justify-center">
      <div className="text-gray-500 mb-4">
        <div className="text-4xl mb-2">📢</div>
        <h3 className="font-medium">Google Ads</h3>
      </div>
      <div className="bg-white rounded p-4 mb-4">
        <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">Google Ads Placeholder</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        300x250 • Responsive Ad Unit
      </p>
    </div>
  );
}

function MainFeaturedSection({ 
  articles, 
  sectionName 
}: { 
  articles: ArticleSummary[];
  sectionName: string;
}) {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            {articles.length > 0 ? (
              <ArticleThumbnail article={articles[0]} showSummary={true} />
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="text-gray-500">
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="font-medium text-sm">No Articles Yet</h3>
                  <p className="text-xs mt-1">Articles will appear here when published.</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            {articles.length > 1 ? (
              <ArticleThumbnail article={articles[1]} showSummary={true} />
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="text-gray-500">
                  <div className="text-3xl mb-2">📰</div>
                  <h3 className="font-medium text-sm">More Content Coming</h3>
                  <p className="text-xs mt-1">Additional articles will appear here.</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <CongressInfo sectionName={sectionName} />
            <SmallAdBanner />
          </div>
        </div>
      </div>
    </section>
  );
}

function SecondaryArticlesSection({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            {articles.length > 2 ? (
              <ArticleThumbnail article={articles[2]} />
            ) : (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-xs">Article 3</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            {articles.length > 3 ? (
              <ArticleThumbnail article={articles[3]} />
            ) : (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-xs">Article 4</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <GoogleAdSpace />
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestNewsSection({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-gray-900 uppercase tracking-wide">
            Latest News
          </h2>
          <Link 
            href="/news" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowRightIcon />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.slice(0, 8).map((article) => (
            <div key={article.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2 hover:text-blue-600">
                <Link href={`/article/${article.slug}`}>
                  {article.title}
                </Link>
              </h3>
              <div className="text-xs text-gray-500">
                <span className="italic">LifeScience News</span>
                <span className="mx-1">|</span>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Component
export default function EnhancedMedscapePage({
  sectionType,
  sectionMeta,
  articles,
  latestNews,
  diseaseAreas,
  parentTherapyArea,
}: LandingProps) {
  const { isLoggedIn, userName } = useAuth();
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeLatestNews = Array.isArray(latestNews) ? latestNews : [];

  const getPageTitle = () => {
    switch (sectionType) {
      case 'disease-area':
        return `${sectionMeta.name} - Disease Area | LifeScience`;
      case 'therapy-area':
        return `${sectionMeta.name} - Therapy Area | LifeScience`;
      case 'category':
        return `${sectionMeta.name} - Category | LifeScience`;
      default:
        return `${sectionMeta.name} | LifeScience`;
    }
  };

  const getPageDescription = () => {
    switch (sectionType) {
      case 'disease-area':
        return `Latest ${sectionMeta.name.toLowerCase()} research, clinical insights, and medical news from leading journals and experts.`;
      case 'therapy-area':
        return `Comprehensive ${sectionMeta.name.toLowerCase()} coverage including disease areas, research updates, and clinical insights.`;
      case 'category':
        return `Latest ${sectionMeta.name.toLowerCase()} articles, research, and medical insights from LifeScience.`;
      default:
        return `Latest ${sectionMeta.name.toLowerCase()} news, research, and clinical insights from leading medical journals and experts.`;
    }
  };

  return (
    <>
      <Seo 
        title={getPageTitle()}
        description={getPageDescription()}
      />

      <Header />

      {/* Hero Section with Conditional CTA */}
      <FullWidthHeroSection 
        sectionName={sectionMeta.name} 
        diseaseAreas={diseaseAreas}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />

      <main className="min-h-screen">
        <MainFeaturedSection 
          articles={safeArticles} 
          sectionName={sectionMeta.name}
        />
        <SecondaryArticlesSection articles={safeArticles} />
        <LatestNewsSection articles={safeLatestNews} />
      </main>

      <Footer />
    </>
  );
}

