// src/pages/[therapyAreaSlug]/[articleSlug].tsx
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?populate=therapyAreas`
  );
  const json = await res.json();

  // for each article, generate one path per therapyArea
  const paths = (json.data || []).flatMap((item: any) => {
    return (item.attributes.therapyAreas?.data || []).map((ta: any) => ({
      params: {
        therapyAreaSlug: ta.attributes.slug,
        articleSlug: item.attributes.slug,
      },
    }));
  });

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { therapyAreaSlug, articleSlug } = params as {
    therapyAreaSlug: string;
    articleSlug: string;
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?` +
    `filters[slug][$eq]=${articleSlug}&populate=heroImage,therapyAreas`
  );
  const json = await res.json();
  const data = json.data?.[0];
  if (!data) {
    return { notFound: true };
  }
  const item = data.attributes;

  const article: Article = {
    id: data.id,
    Title: item.Title,
    slug: item.slug,
    Summary: item.Summary,
    Content: item.Content,
    heroImageUrl: item.heroImage?.data?.attributes?.url || null,
    therapyAreas: (item.therapyAreas?.data || []).map((ta: any) => ({
      name: ta.attributes.name,
      slug: ta.attributes.slug,
    })),
  };

  return { props: { article } };
};

export default function ArticlePage({ article }: Props) {
  return (
    <>
      <Head>
        <title>{article.Title} | Life Science Feed</title>
      </Head>
      <Header />

      <main className="container mx-auto p-4">
        <nav className="text-sm mb-4">
          <Link href="/">
            <a className="text-gray-600 hover:underline">Home</a>
          </Link>
          {' / '}
          {article.therapyAreas.map((ta, i) => (
            <span key={ta.slug}>
              <Link href={`/therapy-area/${ta.slug}/${article.slug}`}>
                <a className="text-gray-600 hover:underline">{ta.name}</a>
              </Link>
              {i < article.therapyAreas.length - 1 && ' / '}
            </span>
          ))}
        </nav>

        <article>
          <h1 className="text-3xl font-bold mb-2">{article.Title}</h1>
          {article.heroImageUrl && (
            <Image
              src={article.heroImageUrl}
              alt={article.Title}
              width={800}
              height={400}
              className="mb-4 object-cover w-full rounded"
            />
          )}
          <p className="italic mb-6">{article.Summary}</p>
          {article.Content.map((block, idx) => (
            <div key={idx} className="prose prose-lg mb-4">
              {/* replace this with your rich-text renderer */}
              {JSON.stringify(block)}
            </div>
          ))}
        </article>
      </main>

      <Footer />
    </>
  );
}
