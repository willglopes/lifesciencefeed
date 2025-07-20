import { ArticleSummary, SectionMeta } from "../lib/api";
// src/pages/index.tsx
import { GetStaticProps } from 'next';
import React from 'react';
import Seo from '../components/Seo';
import Header from '../components/Header';
import FeaturedCarousel from '../components/FeaturedCarousel';
import SidebarList from '../components/SidebarList';
import SessionSection from '../components/SessionSection';
import Trending from '../components/Trending';
import Cardiology from '../components/Cardiology';
import Oncology from '../components/Oncology';
import Perspectives from '../components/Perspectives';
import Congresses from '../components/Congresses';
import BannerAd from '../components/BannerAd';
import Footer from '../components/Footer';
import {
  fetchTherapyAreas,
  fetchCategories,
  fetchArticlesBySection,
} from '../lib/api';
import Link from 'next/link';

interface HomeProps {
  therapyAreas: SectionMeta[];
  categories: SectionMeta[];
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Your existing API calls with error handling
    let articles = [];
    let categories = [];
    let therapyAreas = [];

    try {
      articles = await fetchArticlesWithDiseaseAreas();
    } catch (error) {
      console.warn('Failed to fetch articles:', error);
    }

    try {
      categories = await fetchCategories();
    } catch (error) {
      console.warn('Failed to fetch categories:', error);
    }

    try {
      therapyAreas = await fetchTherapyAreas();
    } catch (error) {
      console.warn('Failed to fetch therapy areas:', error);
    }

    return {
      props: {
        articles: articles.slice(0, 20),
        categories: categories.slice(0, 10),
        therapyAreas: therapyAreas.slice(0, 10),
      },
      revalidate: 300,
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    // Return empty data instead of failing
    return {
      props: {
        articles: [],
        categories: [],
        therapyAreas: [],
      },
      revalidate: 60,
    };
  }
};

export default function Home({ therapyAreas, categories }: HomeProps) {
  return (
    <>
      
      <Header />

      <main className="container mx-auto py-8 space-y-12 border-t-2 px-4">
        {/* Sidebar + Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-15 gap-8">
          <aside className="lg:col-span-3">
            {/* SidebarList will fetch its own data later */}
            <SidebarList />
          </aside>

          <section className="lg:col-span-8">
            {/* FeaturedCarousel will fetch its own items client-side */}
            <FeaturedCarousel />
          </section>

          <aside className="lg:col-span-4">
            <SidebarList showThumbnail />
          </aside>
        </div>

        {/* SessionSection */}
        <SessionSection />

        {/* Trending */}
        <Trending />

      </main>

      <BannerAd adSlot="homepage-banner" />

      <main className="container mx-auto py-8 space-y-12 px-4">
        <Cardiology />
      </main>

      <BannerAd adSlot="homepage-banner" />

      <main className="container mx-auto py-8 space-y-12 px-4">
        <Oncology />
        <Congresses />
      </main>

      <BannerAd adSlot="homepage-banner" />

      <main className="container mx-auto py-8 space-y-12 px-4">
        <Perspectives />
      </main>

      <BannerAd adSlot="homepage-banner" />

      {/* little spacer */}
      <div className="py-8" />

      <Footer />
    </>
  );
}
