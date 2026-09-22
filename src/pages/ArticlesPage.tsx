import { useEffect } from 'react'
import { format } from 'date-fns'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchArticles, selectArticles } from '../redux/slices/articlesSlice'
import { articleStatusStyles } from '../utils/articleStatus'

export function ArticlesPage() {
  const dispatch = useAppDispatch()
  const articles = useAppSelector(selectArticles)

  useEffect(() => {
    void dispatch(fetchArticles())
  }, [dispatch])

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-serif text-xl font-semibold">All articles</h2>
        <p className="text-sm text-muted">
          Manage published stories, drafts, and pieces in review.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Author</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Published</th>
              <th className="px-5 py-3 font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-line">
                <td className="px-5 py-4 font-mono text-xs">{article.id}</td>
                <td className="px-5 py-4 font-medium">{article.title}</td>
                <td className="px-5 py-4 text-muted">{article.category}</td>
                <td className="px-5 py-4 text-muted">{article.author}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${articleStatusStyles[article.status]}`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">
                  {article.publishedAt
                    ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                    : '—'}
                </td>
                <td className="px-5 py-4">{article.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
