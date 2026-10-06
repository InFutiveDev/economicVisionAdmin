import { useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ArticleListActions } from '../components/articles/ArticleListActions'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  fetchArticles,
  selectArticles,
  selectArticlesError,
  selectArticlesStatus,
} from '../redux/slices/articlesSlice'
import type { Article, ArticleStatus } from '../types/article'
import { articleStatusStyles } from '../utils/articleStatus'

type SortKey = 'title' | 'category' | 'author' | 'status' | 'published'
type SortDir = 'asc' | 'desc'

const SORT_KEYS: SortKey[] = ['title', 'category', 'author', 'status', 'published']
const STATUSES: ArticleStatus[] = ['published', 'draft', 'review']
const FILTER_KEYS = ['q', 'status', 'category', 'sub', 'author'] as const

const selectClass =
  'h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold'

const uniqueSorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))

const publishedTime = (article: Article) =>
  new Date(article.publishedAt ?? article.updatedAt).getTime() || 0

function compareArticles(a: Article, b: Article, key: SortKey) {
  switch (key) {
    case 'published':
      return publishedTime(a) - publishedTime(b)
    case 'category':
      return `${a.category} ${a.subCategory}`.localeCompare(`${b.category} ${b.subCategory}`)
    default:
      return a[key].localeCompare(b[key])
  }
}

export function ArticlesPage() {
  const dispatch = useAppDispatch()
  const articles = useAppSelector(selectArticles)
  const status = useAppSelector(selectArticlesStatus)
  const error = useAppSelector(selectArticlesError)
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const statusFilter = params.get('status') ?? ''
  const categoryFilter = params.get('category') ?? ''
  const subFilter = params.get('sub') ?? ''
  const authorFilter = params.get('author') ?? ''
  const sortParam = params.get('sort') as SortKey | null
  const sortKey: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'published'
  const sortDir: SortDir = params.get('dir') === 'asc' ? 'asc' : 'desc'

  useEffect(() => {
    void dispatch(fetchArticles())
  }, [dispatch])

  const updateParams = (changes: Record<string, string>) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(changes).forEach(([key, value]) => {
          if (value) next.set(key, value)
          else next.delete(key)
        })
        return next
      },
      { replace: true },
    )
  }

  const categories = useMemo(() => uniqueSorted(articles.map((a) => a.category)), [articles])
  const subCategories = useMemo(
    () =>
      uniqueSorted(
        articles
          .filter((article) => !categoryFilter || article.category === categoryFilter)
          .map((article) => article.subCategory),
      ),
    [articles, categoryFilter],
  )
  const authors = useMemo(() => uniqueSorted(articles.map((a) => a.author)), [articles])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = articles.filter((article) => {
      if (statusFilter && article.status !== statusFilter) return false
      if (categoryFilter && article.category !== categoryFilter) return false
      if (subFilter && article.subCategory !== subFilter) return false
      if (authorFilter && article.author !== authorFilter) return false
      if (!needle) return true
      return [
        article.title,
        article.excerpt,
        article.kicker,
        article.author,
        article.category,
        article.subCategory,
        ...article.tags,
      ].some((value) => value?.toLowerCase().includes(needle))
    })
    const direction = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => compareArticles(a, b, sortKey) * direction)
  }, [articles, query, statusFilter, categoryFilter, subFilter, authorFilter, sortKey, sortDir])

  const activeFilters = FILTER_KEYS.filter((key) => params.get(key)).length

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      updateParams({ sort: key, dir: sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      const textual = key === 'title' || key === 'category' || key === 'author' || key === 'status'
      updateParams({ sort: key, dir: textual ? 'asc' : 'desc' })
    }
  }

  const clearFilters = () =>
    updateParams(Object.fromEntries(FILTER_KEYS.map((key) => [key, ''])))

  const SortHeader = ({ label, column }: { label: string; column: SortKey }) => {
    const active = sortKey === column
    const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown
    return (
      <th
        className="px-5 py-3 font-medium"
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button
          type="button"
          onClick={() => toggleSort(column)}
          className={`inline-flex items-center gap-1 uppercase hover:text-ink ${
            active ? 'text-ink' : ''
          }`}
        >
          {label}
          <Icon size={12} className={active ? '' : 'opacity-40'} />
        </button>
      </th>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-serif text-xl font-semibold">All articles</h2>
        <p className="text-sm text-muted">
          Manage published stories, drafts, and pieces in review.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <label className="relative min-w-56 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            placeholder="Search title, excerpt, author, tags…"
            onChange={(event) => updateParams({ q: event.target.value })}
            className="h-10 w-full rounded-md border border-line bg-paper pr-3 pl-9 text-sm outline-none focus:border-gold"
          />
        </label>
        <select
          aria-label="Filter by status"
          className={selectClass}
          value={statusFilter}
          onChange={(event) => updateParams({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value} className="capitalize">
              {value[0].toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by category"
          className={selectClass}
          value={categoryFilter}
          onChange={(event) => updateParams({ category: event.target.value, sub: '' })}
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by sub-category"
          className={`${selectClass} disabled:opacity-50`}
          value={subFilter}
          disabled={!subCategories.length && !subFilter}
          onChange={(event) => updateParams({ sub: event.target.value })}
        >
          <option value="">All sub-categories</option>
          {subCategories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by author"
          className={selectClass}
          value={authorFilter}
          onChange={(event) => updateParams({ author: event.target.value })}
        >
          <option value="">All authors</option>
          {authors.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        {activeFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:bg-paper hover:text-ink"
          >
            <X size={14} />
            Clear
          </button>
        ) : null}
        <p className="w-full text-xs text-muted">
          {status === 'loading' && articles.length === 0
            ? 'Loading…'
            : `Showing ${visible.length} of ${articles.length} article${articles.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Serial No.</th>
              <SortHeader label="Title" column="title" />
              <SortHeader label="Category" column="category" />
              <SortHeader label="Author" column="author" />
              <SortHeader label="Status" column="status" />
              <SortHeader label="Published" column="published" />
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && articles.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-muted" colSpan={7}>
                  Loading articles from the database…
                </td>
              </tr>
            ) : null}
            {status === 'failed' ? (
              <tr>
                <td className="px-5 py-8 text-red-700" colSpan={7}>
                  {error || 'Could not load articles.'}
                </td>
              </tr>
            ) : null}
            {status !== 'loading' && status !== 'failed' && articles.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-muted" colSpan={7}>
                  No articles in the database yet.
                </td>
              </tr>
            ) : null}
            {articles.length > 0 && visible.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-muted" colSpan={7}>
                  No articles match these filters.{' '}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-medium text-navy hover:text-gold"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : null}
            {visible.map((article, index) => (
              <tr key={article.id} className="border-t border-line">
                <td className="px-5 py-4 text-muted">{index + 1}</td>
                <td className="px-5 py-4 font-medium">{article.title}</td>
                <td className="px-5 py-4 text-muted">
                  {article.category}
                  {article.subCategory ? (
                    <span className="block text-xs text-muted/80">› {article.subCategory}</span>
                  ) : null}
                </td>
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
                <td className="px-5 py-4">
                  <ArticleListActions article={article} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
