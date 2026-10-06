import { Eye, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'

type ArticleListActionsProps = {
  article: Article
}

export function ArticleListActions({ article }: ArticleListActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        to={`/articles/${article.id}/preview`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
      >
        <Eye size={14} />
        Preview
      </Link>
      <Link
        to={`/articles/${article.id}/edit`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
      >
        <Pencil size={14} />
        Edit
      </Link>
    </div>
  )
}
