import { useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { deleteArticle } from '../../redux/slices/articlesSlice'
import { selectUser } from '../../redux/slices/authSlice'
import { stripHtml } from '../../utils/html'

type ArticleListActionsProps = {
  article: Article
}

export function ArticleListActions({ article }: ArticleListActionsProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAdmin = user?.role === 'admin'
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const label = stripHtml(article.title) || 'this article'
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return

    setDeleting(true)
    try {
      await dispatch(deleteArticle(article.id)).unwrap()
    } catch (error) {
      window.alert(typeof error === 'string' ? error : 'Could not delete article.')
    } finally {
      setDeleting(false)
    }
  }

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
      {isAdmin ? (
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      ) : null}
    </div>
  )
}
