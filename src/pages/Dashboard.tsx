import { useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Clock3,
  FilePenLine,
  FileText,
  Newspaper,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArticleListActions } from '../components/articles/ArticleListActions'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchArticles, selectArticles } from '../redux/slices/articlesSlice'
import { selectUser } from '../redux/slices/authSlice'
import { articleStatusStyles } from '../utils/articleStatus'

export function Dashboard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const articles = useAppSelector(selectArticles)

  useEffect(() => {
    void dispatch(fetchArticles())
  }, [dispatch])

  const recent = [...articles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  const queue = articles.filter((article) => article.status !== 'published')
  const stats = [
    {
      label: 'Total articles',
      value: String(articles.length),
      hint: 'In the newsroom',
      icon: Newspaper,
    },
    {
      label: 'Published',
      value: String(articles.filter((article) => article.status === 'published').length),
      hint: 'Live on the site',
      icon: FileText,
    },
    {
      label: 'In review / draft',
      value: String(queue.length),
      hint: 'Waiting on desk',
      icon: FilePenLine,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-line bg-navy p-6 text-white sm:p-8">
        <p className="text-xs tracking-[0.2em] text-gold uppercase">
          Editorial overview
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight font-semibold sm:text-4xl">
          Welcome back, {user?.name ?? 'editor'}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Track stories in progress, publish from draft, and keep the homepage
          filled with markets, policy, and economy coverage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/articles"
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-navy-deep"
          >
            Open article list
          </Link>
          <Link
            to="/articles/new"
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Write a story
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <article
            key={label}
            className="rounded-xl border border-line bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted">{label}</p>
              <span className="rounded-md bg-gold-soft p-2 text-navy">
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted">{hint}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h3 className="font-serif text-xl font-semibold">Recent articles</h3>
              <p className="text-sm text-muted">Latest updates from the newsroom</p>
            </div>
            <Link to="/articles" className="text-sm font-medium text-navy hover:text-gold">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((article) => (
                  <tr key={article.id} className="border-t border-line">
                    <td className="px-5 py-4">
                      <p className="font-medium">{article.title}</p>
                      <p className="mt-1 text-xs text-muted">{article.author}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">{article.category}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${articleStatusStyles[article.status]}`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDistanceToNow(new Date(article.updatedAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <ArticleListActions article={article} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={18} className="text-gold" />
            <h3 className="font-serif text-xl font-semibold">Editorial queue</h3>
          </div>
          <ul className="space-y-4">
            {queue.map((article) => (
              <li key={article.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{article.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {article.category} · {article.author} ·{' '}
                  {format(new Date(article.updatedAt), 'MMM d, h:mm a')}
                </p>
                <div className="mt-2">
                  <ArticleListActions article={article} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-md bg-gold-soft px-3 py-3 text-sm text-navy">
            <TrendingUp size={16} />
            Keep at least two drafts ready for the homepage rotation.
          </div>
        </section>
      </div>
    </div>
  )
}
