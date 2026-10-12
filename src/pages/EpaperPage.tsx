import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  ExternalLink,
  Eye,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { selectUser } from '../redux/slices/authSlice'
import {
  deleteEpaper,
  fetchEpapers,
  selectEpapers,
  selectEpapersError,
  selectEpapersStatus,
} from '../redux/slices/epaperSlice'

export function EpaperPage() {
  const dispatch = useAppDispatch()
  const epapers = useAppSelector(selectEpapers)
  const status = useAppSelector(selectEpapersStatus)
  const error = useAppSelector(selectEpapersError)
  const user = useAppSelector(selectUser)
  const isAdmin = user?.role === 'admin'

  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const cityFilter = params.get('city') ?? ''
  const statusFilter = params.get('status') ?? ''

  useEffect(() => {
    void dispatch(fetchEpapers())
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

  const cities = useMemo(() => {
    return [...new Set(epapers.map((item) => item.city).filter(Boolean))].sort()
  }, [epapers])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return epapers.filter((item) => {
      if (cityFilter && item.city !== cityFilter) return false
      if (statusFilter && item.status !== statusFilter) return false
      if (!needle) return true
      return (
        item.name.toLowerCase().includes(needle) ||
        item.city.toLowerCase().includes(needle) ||
        item.slug.toLowerCase().includes(needle) ||
        item.date.toLowerCase().includes(needle)
      )
    })
  }, [epapers, query, cityFilter, statusFilter])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this e-paper edition?')) {
      await dispatch(deleteEpaper(id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
            Digital E-Paper Editions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish and manage daily newspaper editions displayed on{' '}
            <a
              href="https://beta.theeconomicvision.com/epaper"
              target="_blank"
              rel="noreferrer"
              className="text-gold-dark hover:underline font-medium inline-flex items-center gap-1"
            >
              beta.theeconomicvision.com/epaper <ExternalLink size={12} />
            </a>
          </p>
        </div>

        <Link
          to="/epaper/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-navy-deep self-start sm:self-auto"
        >
          <Plus size={16} />
          New E-Paper Edition
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            placeholder="Search edition, city, slug..."
            onChange={(e) => updateParams({ q: e.target.value })}
            className="h-10 w-full rounded-md border border-line bg-paper pl-9 pr-3 text-sm outline-none focus:border-gold transition"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => updateParams({ city: e.target.value })}
          className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">All Cities ({cities.length})</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {(query || cityFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => updateParams({ q: '', city: '', status: '' })}
            className="flex items-center gap-1 rounded-md border border-line px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table / Grid list */}
      {status === 'loading' && epapers.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading e-paper editions...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper p-12 text-center">
          <Newspaper size={36} className="mx-auto text-slate-400 mb-2" />
          <p className="font-serif text-lg font-semibold text-navy">No editions found</p>
          <p className="mt-1 text-xs text-slate-500">
            {query || cityFilter || statusFilter
              ? 'Try modifying your search or filter criteria.'
              : 'Create your first digital newspaper edition to get started.'}
          </p>
          <Link
            to="/epaper/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-xs font-bold text-navy-deep shadow-xs transition hover:bg-gold-light"
          >
            <Plus size={14} /> Create Edition
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Edition</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Pages</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  {/* Cover + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded border border-line bg-slate-100">
                        {item.cover || item.pages?.[0]?.image ? (
                          <img
                            src={item.cover || item.pages[0]?.image}
                            alt=""
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                            No cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/epaper/${item.id}/edit`}
                          className="font-serif font-bold text-navy hover:text-gold-dark hover:underline truncate block"
                        >
                          {item.title || item.name}
                        </Link>
                        {item.paragraph && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">
                            {item.paragraph}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 font-mono truncate">
                          /{item.slug}
                        </p>
                        {item.today && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded bg-brand-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            <Sparkles size={10} /> Today
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* City */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin size={13} className="text-gold" />
                      {item.city}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Calendar size={13} className="text-slate-400" />
                      {item.dateShort || item.date}
                    </span>
                  </td>

                  {/* Pages */}
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {item.pages?.length || 0} pages
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        item.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/epaper/${item.id}/preview`}
                        title="Preview digital edition"
                        className="flex size-8 items-center justify-center rounded border border-line text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Eye size={15} />
                      </Link>

                      <Link
                        to={`/epaper/${item.id}/edit`}
                        title="Edit edition"
                        className="flex size-8 items-center justify-center rounded border border-line text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Pencil size={15} />
                      </Link>

                      <a
                        href={`https://beta.theeconomicvision.com/epaper/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on public site"
                        className="flex size-8 items-center justify-center rounded border border-line text-slate-600 hover:bg-slate-100 transition"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Delete edition"
                          className="flex size-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
