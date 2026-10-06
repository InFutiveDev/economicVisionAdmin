import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createMediaApi,
  deleteMediaApi,
  fetchCategoriesApi,
  fetchMediaApi,
  reorderMediaApi,
  updateMediaApi,
  type MediaInput,
} from '../api/homepage.api'
import { ImageUploadField } from '../components/blocks/ImageUploadField'
import {
  MEDIA_TABS,
  groupCategories,
  type Category,
  type MediaItem,
  type MediaType,
} from '../types/homepage'
import { getErrorMessage } from '../utils/error'
import { moveItem } from '../utils/list'
import { getYouTubeId, isYouTubeThumbnail, youTubeEmbed, youTubeThumbnail } from '../utils/youtube'
import '../styles/article-editor.css'

const emptyForm = (type: MediaType): MediaInput => ({
  type,
  title: '',
  summary: '',
  image: '',
  url: '',
  duration: '',
  category: '',
  subCategory: '',
  published: true,
})

const inputClass =
  'h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold'

export function MediaPage() {
  const [type, setType] = useState<MediaType>('video')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState<MediaInput>(emptyForm('video'))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const categoryGroups = useMemo(() => groupCategories(categories), [categories])
  const activeCategory = categoryGroups.find((group) => group.name === form.category)

  useEffect(() => {
    fetchCategoriesApi()
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  const tab = MEDIA_TABS.find((item) => item.type === type)!
  const supportsYouTube = type !== 'story'
  const youTubeId = supportsYouTube ? getYouTubeId(form.url) : null

  const handleUrlChange = (url: string) => {
    const id = supportsYouTube ? getYouTubeId(url) : null
    const keepImage = form.image && !isYouTubeThumbnail(form.image)
    setForm({
      ...form,
      url,
      image: id && !keepImage ? youTubeThumbnail(id) : keepImage ? form.image : '',
    })
  }

  useEffect(() => {
    setLoading(true)
    setLoadError('')
    fetchMediaApi(type)
      .then(setItems)
      .catch((caught) => setLoadError(getErrorMessage(caught, 'Could not load media.')))
      .finally(() => setLoading(false))
  }, [type])

  const resetForm = (nextType = type) => {
    setForm(emptyForm(nextType))
    setEditingId(null)
  }

  const switchTab = (nextType: MediaType) => {
    setType(nextType)
    resetForm(nextType)
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    if (type === 'video' && !youTubeId) {
      setError('Paste a valid YouTube link, e.g. https://www.youtube.com/watch?v=…')
      return
    }
    if (!form.image) {
      setError('Add a cover image so the card has a thumbnail.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateMediaApi(editingId, form)
        setItems((list) => list.map((item) => (item.id === updated.id ? updated : item)))
        setNotice(`${updated.title} updated.`)
      } else {
        const created = await createMediaApi(form)
        setItems((list) => [...list, created])
        setNotice(`${created.title} added to ${tab.title}.`)
      }
      resetForm()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save this item.'))
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async (index: number, direction: -1 | 1) => {
    const next = moveItem(items, index, direction)
    if (next === items) return
    setItems(next)
    try {
      await reorderMediaApi(next.map((item) => item.id))
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not reorder items.'))
    }
  }

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return
    setError('')
    setNotice('')
    try {
      await deleteMediaApi(item.id)
      setItems((list) => list.filter((entry) => entry.id !== item.id))
      if (editingId === item.id) resetForm()
      setNotice(`${item.title} deleted.`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete this item.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MEDIA_TABS.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => switchTab(item.type)}
            className={`h-10 rounded-md px-4 text-sm font-medium ${
              item.type === type
                ? 'bg-ink text-white'
                : 'border border-line bg-card text-ink hover:bg-paper'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-serif text-xl font-semibold">{tab.title}</h2>
            <p className="text-sm text-muted">
              Shown on the homepage in this order. Position 1 is the featured card.
            </p>
          </div>
          <ol className="divide-y divide-line">
            {loading ? <li className="px-5 py-8 text-sm text-muted">Loading…</li> : null}
            {!loading && loadError ? (
              <li className="px-5 py-8 text-sm text-red-700">{loadError}</li>
            ) : null}
            {!loading && !loadError && items.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted">
                No {tab.title.toLowerCase()} yet. Add one with the form.
              </li>
            ) : null}
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                  {index + 1}
                </span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-14 w-20 shrink-0 rounded bg-paper" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">
                    {[
                      [item.category, item.subCategory].filter(Boolean).join(' › '),
                      getYouTubeId(item.url) ? 'YouTube' : '',
                      item.duration,
                      item.published ? 'Visible' : 'Hidden',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => void handleMove(index, -1)}
                    className="text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => void handleMove(index, 1)}
                    className="text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id)
                      setForm({
                        type: item.type,
                        title: item.title,
                        summary: item.summary,
                        image: item.image,
                        url: item.url,
                        duration: item.duration,
                        category: item.category,
                        subCategory: item.subCategory,
                        published: item.published,
                      })
                      setError('')
                      setNotice('')
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="article-page h-fit rounded-xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-semibold">
              {editingId ? 'Edit item' : `Add to ${tab.title}`}
            </h3>
            {editingId ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
              >
                <X size={14} />
                Cancel
              </button>
            ) : null}
          </div>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="media-title">
                Title
              </label>
              <input
                id="media-title"
                className={inputClass}
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            {type === 'story' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold text-muted"
                    htmlFor="media-category"
                  >
                    Category
                  </label>
                  <select
                    id="media-category"
                    className={inputClass}
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value, subCategory: '' })
                    }
                  >
                    <option value="">None</option>
                    {form.category && !activeCategory ? (
                      <option value={form.category}>{form.category}</option>
                    ) : null}
                    {categoryGroups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold text-muted"
                    htmlFor="media-sub-category"
                  >
                    Sub-category
                  </label>
                  <select
                    id="media-sub-category"
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                    value={form.subCategory}
                    disabled={!activeCategory?.children.length && !form.subCategory}
                    onChange={(event) => setForm({ ...form, subCategory: event.target.value })}
                  >
                    <option value="">
                      {activeCategory?.children.length ? 'None' : 'No sub-categories'}
                    </option>
                    {form.subCategory &&
                    !activeCategory?.children.some((child) => child.name === form.subCategory) ? (
                      <option value={form.subCategory}>{form.subCategory}</option>
                    ) : null}
                    {activeCategory?.children.map((child) => (
                      <option key={child.id} value={child.name}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="media-url">
                {tab.urlLabel}
              </label>
              <input
                id="media-url"
                className={inputClass}
                value={form.url}
                placeholder={supportsYouTube ? 'https://www.youtube.com/watch?v=…' : 'https://'}
                onChange={(event) => handleUrlChange(event.target.value)}
              />
              {supportsYouTube && form.url.trim() ? (
                <p className={`mt-1.5 text-xs ${youTubeId ? 'text-green-700' : 'text-muted'}`}>
                  {youTubeId
                    ? 'YouTube video detected. The thumbnail is used as the cover unless you upload one.'
                    : type === 'video'
                      ? 'Not a recognised YouTube link (watch, youtu.be, shorts, live or embed).'
                      : 'Not a YouTube link; it will open as a regular link.'}
                </p>
              ) : null}
              {youTubeId ? (
                <div className="mt-3 aspect-video overflow-hidden rounded-md border border-line bg-black">
                  <iframe
                    src={youTubeEmbed(youTubeId)}
                    title="YouTube preview"
                    className="size-full"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="media-image">
                Cover image{youTubeId ? ' (optional)' : ''}
              </label>
              <ImageUploadField
                id="media-image"
                value={form.image}
                onChange={(url) =>
                  setForm({ ...form, image: url || (youTubeId ? youTubeThumbnail(youTubeId) : '') })
                }
              />
            </div>
            {type !== 'story' ? (
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted"
                  htmlFor="media-duration"
                >
                  Duration
                </label>
                <input
                  id="media-duration"
                  className={inputClass}
                  value={form.duration}
                  placeholder="e.g. 12:48"
                  onChange={(event) => setForm({ ...form, duration: event.target.value })}
                />
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="media-summary">
                Summary
              </label>
              <textarea
                id="media-summary"
                className="min-h-20 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
                value={form.summary}
                placeholder="Optional, shown under the featured card"
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm({ ...form, published: event.target.checked })}
              />
              Show on homepage
            </label>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-navy disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Saving…' : editingId ? 'Save changes' : `Add to ${tab.title}`}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
