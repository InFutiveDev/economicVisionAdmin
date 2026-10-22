import type { Block } from './block'

export type ArticleStatus = 'published' | 'draft' | 'review'

export type Article = {
  id: string
  title: string
  subtitle: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  category: string
  subCategory: string
  author: string
  status: ArticleStatus
  publishedAt: string | null
  updatedAt: string
  views: number
  kicker: string
  tags: string[]
  coverImage: string
  featured: boolean
  blocks: Block[]
}
