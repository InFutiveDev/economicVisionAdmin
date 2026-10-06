import type { Article } from '../types/article'
import type { Block } from '../types/block'
import { api } from './client'

type ArticleRecord = Partial<Article> & {
  _id?: string
  paragraph?: string
  subHeading?: string
  authorName?: string
  articleImage?: string
  articleCategory?: string
  tags?: string[]
}

function toBlocks(item: ArticleRecord): Block[] {
  if (Array.isArray(item.blocks) && item.blocks.length > 0) {
    return item.blocks
  }

  const text = item.excerpt || item.paragraph || ''
  if (!text) return []
  return [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      data: { text },
    },
  ]
}

export function toArticle(item: ArticleRecord): Article {
  return {
    id: String(item.id ?? item._id ?? ''),
    title: item.title ?? '',
    excerpt: item.excerpt ?? item.paragraph ?? '',
    category: item.category ?? item.articleCategory ?? 'Economy',
    subCategory: item.subCategory ?? '',
    author: item.author ?? item.authorName ?? 'Editorial Desk',
    status: item.status ?? 'draft',
    publishedAt: item.publishedAt ?? null,
    updatedAt: item.updatedAt ?? new Date().toISOString(),
    views: item.views ?? 0,
    kicker: item.kicker ?? item.subHeading ?? '',
    tags: item.tags ?? [],
    coverImage: item.coverImage ?? item.articleImage ?? '',
    featured: Boolean(item.featured),
    blocks: toBlocks(item),
  }
}

export async function fetchArticlesApi(): Promise<Article[]> {
  const { data } = await api.get<Article[] | { articles?: ArticleRecord[] }>(
    '/articles',
  )
  const records = Array.isArray(data) ? data : data?.articles
  if (!Array.isArray(records)) {
    throw new Error('Could not load articles.')
  }
  return records.map(toArticle)
}

export async function fetchArticleByIdApi(id: string): Promise<Article> {
  try {
    const { data } = await api.get<ArticleRecord | { article?: ArticleRecord }>(
      `/pages/${id}`,
    )
    const record = (data as { article?: ArticleRecord }).article ?? data
    return toArticle(record as ArticleRecord)
  } catch {
    try {
      const { data } = await api.get<ArticleRecord | { article?: ArticleRecord }>(
        `/articles/${id}`,
      )
      const record = (data as { article?: ArticleRecord }).article ?? data
      return toArticle(record as ArticleRecord)
    } catch {
      const articles = await fetchArticlesApi()
      const found = articles.find((article) => article.id === id)
      if (!found) throw new Error('Article not found.')
      return found
    }
  }
}
