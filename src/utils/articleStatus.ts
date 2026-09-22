import type { ArticleStatus } from '../types/article'

export const articleStatusStyles: Record<ArticleStatus, string> = {
  published: 'bg-emerald-50 text-emerald-800',
  review: 'bg-amber-50 text-amber-800',
  draft: 'bg-slate-100 text-slate-700',
}
