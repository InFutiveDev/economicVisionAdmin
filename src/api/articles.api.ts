import type { Article } from '../types/article'
import { api } from './client'

export const mockArticles: Article[] = [
  {
    id: 'ev-2041',
    title: 'Fed holds rates as core inflation cools for a third month',
    excerpt: 'Policymakers signal patience while labor markets remain tight.',
    category: 'Markets',
    author: 'Priya Menon',
    status: 'published',
    publishedAt: '2026-09-21T08:30:00.000Z',
    updatedAt: '2026-09-21T08:30:00.000Z',
    views: 18420,
  },
  {
    id: 'ev-2040',
    title: 'India GDP growth beats forecasts on manufacturing rebound',
    excerpt: 'Factory output and services both surprised to the upside in Q1.',
    category: 'Economy',
    author: 'Arjun Kapoor',
    status: 'published',
    publishedAt: '2026-09-20T11:15:00.000Z',
    updatedAt: '2026-09-20T14:02:00.000Z',
    views: 22104,
  },
  {
    id: 'ev-2039',
    title: 'Oil slips as demand fears outweigh supply cuts',
    excerpt: 'Brent trades below $78 after inventory data missed estimates.',
    category: 'Commodities',
    author: 'Elena Voss',
    status: 'review',
    publishedAt: null,
    updatedAt: '2026-09-22T04:10:00.000Z',
    views: 0,
  },
  {
    id: 'ev-2038',
    title: 'Rupee steadies after RBI dollar sales, traders say',
    excerpt: 'The currency found a floor near 83.4 amid month-end flows.',
    category: 'Currency',
    author: 'Meera Shah',
    status: 'draft',
    publishedAt: null,
    updatedAt: '2026-09-22T02:44:00.000Z',
    views: 0,
  },
  {
    id: 'ev-2037',
    title: 'Green hydrogen investments cross $12bn in Asia this year',
    excerpt: 'Policy credits and offtake deals are pulling capital into the sector.',
    category: 'Energy',
    author: 'Daniel Cho',
    status: 'published',
    publishedAt: '2026-09-18T09:00:00.000Z',
    updatedAt: '2026-09-18T09:00:00.000Z',
    views: 9632,
  },
  {
    id: 'ev-2036',
    title: 'Housing starts slow as mortgage rates stay sticky',
    excerpt: 'Builders report weaker buyer traffic in the largest metros.',
    category: 'Real Estate',
    author: 'Priya Menon',
    status: 'draft',
    publishedAt: null,
    updatedAt: '2026-09-21T16:20:00.000Z',
    views: 0,
  },
]

export async function fetchArticlesApi(): Promise<Article[]> {
  try {
    const { data } = await api.get<Article[]>('/articles')
    return Array.isArray(data) ? data : mockArticles
  } catch {
    return mockArticles
  }
}
