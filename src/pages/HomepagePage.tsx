import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import { fetchHomeSectionsApi, saveHomeSectionApi } from '../api/homepage.api'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchArticles, selectArticles } from '../redux/slices/articlesSlice'
import {
  HOME_SECTIONS,
  type HomeSectionItem,
  type HomeSectionKey,
  type HomeSections,
} from '../types/homepage'
import { getErrorMessage } from '../utils/error'
import { moveItem } from '../utils/list'

const inputClass =
  'h-9 w-full rounded-md border border-line bg-paper px-2.5 text-sm outline-none focus:border-gold'

export function HomepagePage() {
  const dispatch = useAppDispatch()
  const articles = useAppSelector(selectArticles)
  const [sections, setSections] = useState<HomeSections | null>(null)
  const [activeKey, setActiveKey] = useState<HomeSectionKey>('hero')
  const [draft, setDraft] = useState<HomeSectionItem[]>([])
  const [dirty, setDirty] = useState(false)
  const [pickId, setPickId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const config = HOME_SECTIONS.find((section) => section.key === activeKey)!

  useEffect(() => {
    void dispatch(fetchArticles())
    fetchHomeSectionsApi()
      .then((data) => {
        setSections(data)
        setDraft(data.hero ?? [])
      })
      .catch((caught) => setLoadError(getErrorMessage(caught, 'Could not load homepage sections.')))
  }, [dispatch])

  const available = useMemo(() => {
    const placed = new Set(draft.map((item) => item.articleId))
    return articles.filter((article) => article.status === 'published' && !placed.has(article.id))
  }, [articles, draft])

  const selectSection = (key: HomeSectionKey) => {
    if (dirty && !window.confirm('Discard unsaved changes to this section?')) return
    setActiveKey(key)
    setDraft(sections?.[key] ?? [])
    setDirty(false)
    setPickId('')
    setError('')
    setNotice('')
  }

  const updateDraft = (next: HomeSectionItem[]) => {
    setDraft(next)
    setDirty(true)
    setNotice('')
  }

  const addArticle = () => {
    const article = articles.find((item) => item.id === pickId)
    if (!article) return
    if (draft.length >= config.limit) {
      setError(`${config.title} shows ${config.limit} stories. Remove one first.`)
      return
    }
    setError('')
    updateDraft([
      ...draft,
      {
        articleId: article.id,
        title: article.title,
        category: article.category,
        author: article.author,
        status: article.status,
        coverImage: article.coverImage,
        label: config.labelField?.options?.[0] ?? '',
        note: '',
      },
    ])
    setPickId('')
  }

  const patchItem = (index: number, patch: Partial<HomeSectionItem>) =>
    updateDraft(draft.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const save = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const items = await saveHomeSectionApi(activeKey, draft)
      setSections((current) => (current ? { ...current, [activeKey]: items } : current))
      setDraft(items)
      setDirty(false)
      setNotice(`${config.title} saved.`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save this section.'))
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <section className="rounded-xl border border-line bg-card px-5 py-8 text-sm text-red-700">
        {loadError}
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav className="h-fit overflow-hidden rounded-xl border border-line bg-card">
        <p className="border-b border-line px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Homepage sections
        </p>
        {HOME_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => selectSection(section.key)}
            className={`flex w-full items-center justify-between gap-2 border-b border-line px-4 py-3 text-left text-sm last:border-0 ${
              section.key === activeKey ? 'bg-gold-soft font-medium text-navy' : 'hover:bg-paper'
            }`}
          >
            <span>{section.title}</span>
            <span className="text-xs text-muted">
              {sections?.[section.key]?.length ?? 0}/{section.limit}
            </span>
          </button>
        ))}
      </nav>

      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-serif text-xl font-semibold">{config.title}</h2>
            <p className="text-sm text-muted">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-navy disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save section'}
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${inputClass} h-10 min-w-0 flex-1`}
              value={pickId}
              onChange={(event) => setPickId(event.target.value)}
              aria-label="Choose a published article"
            >
              <option value="">
                {available.length ? 'Choose a published article…' : 'No more published articles'}
              </option>
              {available.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title} · {article.category}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addArticle}
              disabled={!pickId}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium hover:bg-paper disabled:opacity-50"
            >
              <Plus size={16} />
              Add to section
            </button>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
          ) : null}

          {!sections ? <p className="text-sm text-muted">Loading sections…</p> : null}
          {sections && draft.length === 0 ? (
            <p className="rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              No stories placed yet. Pick a published article above.
            </p>
          ) : null}

          <ol className="space-y-3">
            {draft.map((item, index) => (
              <li
                key={item.articleId}
                className="flex flex-wrap items-start gap-4 rounded-lg border border-line bg-paper/50 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm font-semibold text-white">
                  {index + 1}
                </span>
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt=""
                    className="h-14 w-20 shrink-0 rounded object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.category} · {item.author}
                      {item.status !== 'published' ? (
                        <span className="ml-2 text-red-700">Not published, hidden on site</span>
                      ) : null}
                    </p>
                  </div>
                  {config.labelField || config.noteField ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {config.labelField ? (
                        <label className="text-xs text-muted">
                          {config.labelField.label}
                          {config.labelField.options ? (
                            <select
                              className={`${inputClass} mt-1`}
                              value={item.label}
                              onChange={(event) => patchItem(index, { label: event.target.value })}
                            >
                              {config.labelField.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className={`${inputClass} mt-1`}
                              value={item.label}
                              placeholder={config.labelField.placeholder}
                              onChange={(event) => patchItem(index, { label: event.target.value })}
                            />
                          )}
                        </label>
                      ) : null}
                      {config.noteField ? (
                        <label className="text-xs text-muted">
                          {config.noteField.label}
                          <input
                            className={`${inputClass} mt-1`}
                            value={item.note}
                            placeholder={config.noteField.placeholder}
                            onChange={(event) => patchItem(index, { note: event.target.value })}
                          />
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => updateDraft(moveItem(draft, index, -1))}
                    className="rounded border border-line p-1.5 text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === draft.length - 1}
                    onClick={() => updateDraft(moveItem(draft, index, 1))}
                    className="rounded border border-line p-1.5 text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove from section"
                    onClick={() => updateDraft(draft.filter((_, i) => i !== index))}
                    className="rounded border border-line p-1.5 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
