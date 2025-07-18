// src/pages/api/testFetch.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchTopHeadlines, fetchFeaturedArticles } from '../../lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Test fetching the 5 most recent headlines
  const headlines = await fetchTopHeadlines(5);
  // Test fetching the 5 featured articles
  const featured = await fetchFeaturedArticles(5);

  res.status(200).json({
    success: true,
    headlines,
    featured,
  });
}
