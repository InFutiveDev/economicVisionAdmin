import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { ImageUploadField } from '../components/blocks/ImageUploadField'
import { EpaperPageList } from '../components/epaper/EpaperPageList'
import { EpaperPreview } from '../components/epaper/EpaperPreview'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { selectUser } from '../redux/slices/authSlice'
import {
  addParagraph,
  loadEpaper,
  publishEpaper,
  removeParagraph,
  resetEpaperEditor,
  saveEpaperDraft,
  selectEpaperEditor,
  setCity,
  setCover,
  setDateFromPicker,
  setError,
  setName,
  setParagraph,
  setPdfUrl,
  setSlug,
  setTitle,
  setToday,
  togglePreview,
  updateParagraph,
} from '../redux/slices/epaperSlice'
import { CITIES_LIST } from '../types/epaper'
import '../styles/article-editor.css'

export function AddEpaperPage({ previewOnly = false }: { previewOnly?: boolean }) {
  const { epaperId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const editor = useAppSelector(selectEpaperEditor)
  const isAdmin = user?.role === 'admin'

  const [isCustomCity, setIsCustomCity] = useState(false)
  const [newParagraphText, setNewParagraphText] = useState('')

  useEffect(() => {
    if (epaperId) {
      void dispatch(loadEpaper(epaperId))
    } else {
      dispatch(resetEpaperEditor())
    }
    return () => {
      dispatch(resetEpaperEditor())
    }
  }, [epaperId, dispatch])

  // If editor city is not in standard list, activate custom mode
  useEffect(() => {
    if (editor.city && !CITIES_LIST.includes(editor.city as (typeof CITIES_LIST)[number])) {
      setIsCustomCity(true)
    }
  }, [editor.city])

  const validate = () => {
    if (!editor.title.trim() && !editor.name.trim()) {
      return 'Please enter a title or newspaper name.'
    }
    if (!editor.city.trim()) {
      return 'Please select or enter an edition city.'
    }
    if (editor.pages.length === 0) {
      return 'Please add at least one page scan before publishing.'
    }
    return ''
  }

  const handleSaveDraft = async () => {
    if (!editor.title.trim() && !editor.name.trim()) {
      dispatch(setError('Please enter a title or newspaper name.'))
      return
    }
    const action = await dispatch(saveEpaperDraft())
    if (saveEpaperDraft.fulfilled.match(action)) {
      if (!epaperId) {
        navigate(`/epaper/${action.payload.id}/edit`, { replace: true })
      }
    }
  }

  const handlePublish = async () => {
    const errorMsg = validate()
    if (errorMsg) {
      dispatch(setError(errorMsg))
      return
    }
    const action = await dispatch(publishEpaper())
    if (publishEpaper.fulfilled.match(action)) {
      if (!epaperId) {
        navigate(`/epaper/${action.payload.id}/edit`, { replace: true })
      }
    }
  }

  const handleAddExtraParagraph = () => {
    if (!newParagraphText.trim()) return
    dispatch(addParagraph(newParagraphText.trim()))
    setNewParagraphText('')
  }

  return (
    <div className="article-page">
      <div className="article-page-inner">
        {/* Topbar */}
        <div className="article-topbar">
          <Link className="article-back" to="/epaper">
            <ArrowLeft size={14} />
            All E-Papers
          </Link>

          <div className="article-actions">
            <span className={`status-pill ${editor.status}`}>{editor.status}</span>

            {previewOnly && epaperId ? (
              <Link className="btn" to={`/epaper/${epaperId}/edit`}>
                <Pencil size={14} />
                Edit
              </Link>
            ) : null}

            {previewOnly ? null : (
              <button
                type="button"
                className="btn"
                onClick={() => dispatch(togglePreview())}
              >
                <Eye size={14} />
                {editor.preview ? 'Back to Editor' : 'Reader Preview'}
              </button>
            )}

            {previewOnly ? null : (
              <button
                type="button"
                className="btn gold"
                onClick={handleSaveDraft}
                disabled={editor.saving}
              >
                <Save size={14} />
                {editor.status === 'published' ? 'Save changes' : 'Save draft'}
              </button>
            )}

            {previewOnly || !isAdmin ? null : (
              <button
                type="button"
                className="btn primary"
                onClick={handlePublish}
                disabled={editor.saving}
              >
                <Globe size={14} />
                Publish edition
              </button>
            )}
          </div>
        </div>

        {/* Notices and Errors */}
        {editor.error && (
          <div className="error-banner mb-4" role="alert">
            {editor.error}
          </div>
        )}
        {editor.notice && (
          <div className="notice-banner mb-4" role="status">
            {editor.notice}
          </div>
        )}

        {/* Edition Metadata Header Card */}
        <header className="article-header">
          {/* Main Title / Headline Field */}
          <div className="article-field article-title-field">
            <label className="field-label" htmlFor="epaper-title">
              Edition Headline / Title
            </label>
            <input
              id="epaper-title"
              className="article-title-input"
              value={editor.title}
              placeholder="e.g. संवाद फर्स्ट — Today's Digital Edition"
              onChange={(e) => dispatch(setTitle(e.target.value))}
            />
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="font-mono text-gold-dark font-medium">
                Slug: /epaper/{editor.slug || 'slug-placeholder'}
              </span>
              <span className="text-slate-300">|</span>
              <span>{editor.date}</span>
            </div>
          </div>

          {/* Newspaper Name, City & Date Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-line/60">
            {/* Newspaper Publication Name */}
            <div className="article-field">
              <label className="field-label" htmlFor="epaper-name">
                Newspaper Publication
              </label>
              <input
                id="epaper-name"
                type="text"
                value={editor.name}
                placeholder="e.g. संवाद फर्स्ट"
                onChange={(e) => dispatch(setName(e.target.value))}
                className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            {/* City */}
            <div className="article-field">
              <label className="field-label flex items-center gap-1.5" htmlFor="epaper-city">
                <MapPin size={13} className="text-gold" />
                Edition City
              </label>

              {isCustomCity ? (
                <div className="flex gap-1.5">
                  <input
                    id="epaper-city"
                    type="text"
                    value={editor.city}
                    placeholder="Enter city name"
                    onChange={(e) => dispatch(setCity(e.target.value))}
                    className="h-10 flex-1 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCity(false)
                      dispatch(setCity('Indore'))
                    }}
                    className="px-2.5 text-xs text-slate-600 hover:text-navy underline"
                  >
                    List
                  </button>
                </div>
              ) : (
                <select
                  id="epaper-city"
                  value={editor.city}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCity(true)
                      dispatch(setCity(''))
                    } else {
                      dispatch(setCity(e.target.value))
                    }
                  }}
                  className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
                >
                  {CITIES_LIST.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="__custom__">+ Other City...</option>
                </select>
              )}
            </div>

            {/* Date picker */}
            <div className="article-field">
              <label className="field-label flex items-center gap-1.5" htmlFor="epaper-date">
                <Calendar size={13} className="text-gold" />
                Publication Date
              </label>
              <input
                id="epaper-date"
                type="date"
                value={editor.rawDate}
                onChange={(e) => dispatch(setDateFromPicker(e.target.value))}
                className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            {/* Slug Editor */}
            <div className="article-field">
              <label className="field-label" htmlFor="epaper-custom-slug">
                Custom URL Slug
              </label>
              <input
                id="epaper-custom-slug"
                type="text"
                value={editor.slug}
                placeholder="edition-slug"
                onChange={(e) => dispatch(setSlug(e.target.value))}
                className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Lead Summary Paragraph / Excerpt */}
          <div className="article-field pt-2 border-t border-line/60">
            <label className="field-label" htmlFor="epaper-lead-paragraph">
              Edition Lead Paragraph / Overview
            </label>
            <textarea
              id="epaper-lead-paragraph"
              rows={3}
              className="article-excerpt"
              value={editor.paragraph}
              placeholder="Summary of today's newspaper edition, key headlines and lead stories..."
              onChange={(e) => dispatch(setParagraph(e.target.value))}
            />
          </div>

          {/* Additional Paragraphs / Story Highlights */}
          <div className="space-y-3 pt-2 border-t border-line/60">
            <div className="flex items-center justify-between">
              <label className="field-label mb-0">
                Key Story Highlights &amp; Paragraphs ({editor.paragraphs.length})
              </label>
            </div>

            {editor.paragraphs.map((pText, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2">
                <span className="mt-2 text-xs font-semibold text-gold-dark shrink-0">
                  P{pIdx + 1}:
                </span>
                <textarea
                  rows={2}
                  value={pText}
                  onChange={(e) =>
                    dispatch(updateParagraph({ index: pIdx, text: e.target.value }))
                  }
                  className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-gold"
                  placeholder={`Paragraph ${pIdx + 1} content...`}
                />
                <button
                  type="button"
                  onClick={() => dispatch(removeParagraph(pIdx))}
                  title="Remove paragraph"
                  className="mt-1 flex size-7 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {/* Add Paragraph input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                value={newParagraphText}
                placeholder="Type additional story paragraph or highlight and click Add..."
                onChange={(e) => setNewParagraphText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddExtraParagraph()
                }}
                className="h-9 flex-1 rounded-md border border-line bg-paper px-3 text-xs outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={handleAddExtraParagraph}
                disabled={!newParagraphText.trim()}
                className="inline-flex items-center justify-center gap-1 rounded bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-gold hover:text-navy-deep disabled:opacity-50 transition"
              >
                <Plus size={14} /> Add Paragraph
              </button>
            </div>
          </div>

          {/* Additional details: Cover image and flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-line/60">
            {/* Cover image uploader */}
            <div className="article-field">
              <label className="field-label" htmlFor="epaper-cover">
                Front Cover Thumbnail
              </label>
              <div className="flex items-start gap-4">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-slate-100 shadow-xs">
                  {editor.cover || editor.pages[0]?.image ? (
                    <img
                      src={editor.cover || editor.pages[0]?.image}
                      alt="Cover preview"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                      Auto (Page 1)
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <ImageUploadField
                    id="epaper-cover"
                    value={editor.cover}
                    onChange={(url) => dispatch(setCover(url))}
                  />
                  <input
                    value={editor.cover}
                    placeholder="Or paste cover image URL (defaults to Page 1)"
                    onChange={(e) => dispatch(setCover(e.target.value))}
                    className="h-9 w-full rounded border border-line bg-white px-2.5 text-xs outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* PDF attachment & flags */}
            <div className="space-y-3">
              <div className="article-field">
                <label className="field-label" htmlFor="epaper-pdf">
                  Complete Edition PDF File / URL (Optional)
                </label>
                <input
                  id="epaper-pdf"
                  type="url"
                  value={editor.pdfUrl}
                  placeholder="https://.../edition.pdf"
                  onChange={(e) => dispatch(setPdfUrl(e.target.value))}
                  className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="pt-1">
                <label className="featured-toggle inline-flex items-center gap-2 text-sm font-medium text-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editor.today}
                    onChange={(e) => dispatch(setToday(e.target.checked))}
                    className="size-4 rounded accent-gold"
                  />
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-gold" />
                    Mark as "Today's Edition" (Feature badge on frontend)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas: Editor or Preview */}
        {previewOnly || editor.preview ? <EpaperPreview /> : <EpaperPageList />}
      </div>
    </div>
  )
}
