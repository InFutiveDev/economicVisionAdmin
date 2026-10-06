import axios from 'axios'
import type { PagePayload, PageResponse } from '../types/block'
import { api } from './client'

type ArticleBody = PagePayload & {
  paragraph: string
  subHeading: string
  authorName: string
  authorImage: string
  articleImage: string
  articleCategory: string
}

type StoredPage = PageResponse & {
  _id?: string
  paragraph?: string
  subHeading?: string
  authorName?: string
  articleImage?: string
  articleCategory?: string
}

function firstParagraph(payload: PagePayload) {
  const block = payload.blocks.find(
    (item) => item.type === 'paragraph' && item.data.text,
  )
  return block && block.type === 'paragraph' ? block.data.text : ''
}

function toArticleBody(payload: PagePayload): ArticleBody {
  const paragraph = payload.excerpt || firstParagraph(payload) || payload.title
  const image = payload.coverImage || 'https://adminapi.theeconomicvision.com/'

  return {
    ...payload,
    paragraph,
    subHeading: payload.kicker || payload.excerpt || payload.title,
    authorName: payload.author,
    authorImage: image,
    articleImage: image,
    articleCategory: payload.category,
  }
}

function asPage(data: unknown, fallback: PagePayload): PageResponse {
  const raw = (data ?? {}) as { article?: StoredPage } & StoredPage
  const article = raw.article ?? raw

  return {
    ...fallback,
    id: String(article.id ?? article._id ?? ''),
    title: article.title ?? fallback.title,
    slug: article.slug ?? fallback.slug,
    kicker: article.kicker ?? article.subHeading ?? fallback.kicker,
    excerpt: article.excerpt ?? article.paragraph ?? fallback.excerpt,
    category: article.category ?? article.articleCategory ?? fallback.category,
    subCategory: article.subCategory ?? fallback.subCategory,
    tags: article.tags ?? fallback.tags,
    coverImage:
      article.coverImage ?? article.articleImage ?? fallback.coverImage,
    featured: article.featured ?? fallback.featured,
    author: article.author ?? article.authorName ?? fallback.author,
    status: article.status ?? fallback.status,
    blocks: article.blocks ?? fallback.blocks,
  }
}

async function firstOk<T>(requests: Array<() => Promise<T>>) {
  let lastError: unknown
  for (const request of requests) {
    try {
      return await request()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('Request failed.')
}

export async function savePageApi(payload: PagePayload, id?: string) {
  const body = toArticleBody(payload)

  if (id) {
    try {
      const { data } = await firstOk([
        () => api.put<StoredPage>(`/pages/${id}`, payload),
        () => api.put<StoredPage>(`/articles/${id}`, body),
      ])
      return asPage(data, payload)
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      if (status !== 404 && status !== 405) throw error
    }
  }

  const { data } = await firstOk([
    () => api.post<StoredPage>('/pages', payload),
    () => api.post<{ article?: StoredPage } | StoredPage>('/articles', body),
  ])
  return asPage(data, payload)
}

export async function publishPageApi(id: string, payload: PagePayload) {
  const published: PagePayload = { ...payload, status: 'published' }
  const body = toArticleBody(published)

  try {
    const { data } = await firstOk([
      () => api.post<StoredPage>(`/pages/${id}/publish`),
      () => api.post<StoredPage>(`/articles/${id}/publish`),
      () => api.put<StoredPage>(`/pages/${id}`, published),
      () => api.put<StoredPage>(`/articles/${id}`, body),
    ])
    return asPage(data, published)
  } catch {
    return { ...published, id }
  }
}
