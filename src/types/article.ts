export type ArticleStatus = 'published' | 'draft' | 'review'

export type Article = {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  status: ArticleStatus
  publishedAt: string | null
  updatedAt: string
  views: number
}
