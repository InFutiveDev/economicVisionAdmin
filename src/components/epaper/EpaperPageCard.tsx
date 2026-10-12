import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  LayoutTemplate,
  Sparkles,
  Trash2,
  Upload,
  ZoomIn,
} from 'lucide-react'
import { uploadImageApi } from '../../api/upload.api'
import type { EpaperPageItem } from '../../types/epaper'

type EpaperPageCardProps = {
  page: EpaperPageItem
  index: number
  isFirst: boolean
  isLast: boolean
  onUpdate: (updates: Partial<EpaperPageItem>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onPreview: () => void
  onOpenDesign: () => void
}

export function EpaperPageCard({
  page,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onPreview,
  onOpenDesign,
}: EpaperPageCardProps) {
  const [replacing, setReplacing] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setReplacing(true)
    try {
      const url = await uploadImageApi(file)
      onUpdate({ image: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setReplacing(false)
      e.target.value = ''
    }
  }

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-line bg-paper p-3.5 transition hover:border-gold/60 hover:shadow-sm">
      {/* Thumbnail + Zoom trigger */}
      <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg border border-line/80 bg-slate-100 shadow-xs">
        {page.image ? (
          <>
            <img
              src={page.image}
              alt={page.title}
              className="h-full w-full object-cover object-top transition duration-200 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={onPreview}
              title="Click to view full page"
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100 text-white cursor-pointer"
            >
              <ZoomIn size={20} />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
            <ImageIcon size={24} />
            <span className="text-[10px]">No image</span>
          </div>
        )}

        <span className="absolute left-1.5 top-1.5 rounded bg-navy-deep/85 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
          #{index + 1}
        </span>
        {isFirst ? (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy-deep shadow-xs">
            Cover
          </span>
        ) : null}
      </div>

      {/* Page Info & Edit Details */}
      <div className="flex-1 min-w-0 space-y-2 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-dark">
              Page {index + 1}
            </span>
            {page.customDesign && (
              <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} /> Broadsheet Design
              </span>
            )}
            {isFirst && (
              <span className="text-xs text-slate-500 font-medium">
                (Default front cover)
              </span>
            )}
          </div>

          {/* Up / Down / Delete actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              title="Move page up"
              className="flex size-7 items-center justify-center rounded border border-line text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              title="Move page down"
              className="flex size-7 items-center justify-center rounded border border-line text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              title="Remove page"
              className="flex size-7 items-center justify-center rounded border border-red-200 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Page Title / Section
          </label>
          <input
            type="text"
            value={page.title}
            placeholder={`Page ${index + 1}`}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-gold transition"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Page Summary / Highlights
          </label>
          <input
            type="text"
            value={page.description || page.paragraph || ''}
            placeholder="Key stories on this page (e.g. Front page lead, Markets overview)..."
            onChange={(e) =>
              onUpdate({ description: e.target.value, paragraph: e.target.value })
            }
            className="h-8 w-full rounded-md border border-line bg-white px-3 text-xs outline-none focus:border-gold transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Design / Customize Broadsheet Page */}
          <button
            type="button"
            onClick={onOpenDesign}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-dark rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 hover:bg-gold/20 transition cursor-pointer"
          >
            <LayoutTemplate size={13} className="text-gold-dark" />
            <span>{page.customDesign ? 'Edit Broadsheet Design' : 'Customize Page Design'}</span>
          </button>

          {/* Upload Scan */}
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-navy cursor-pointer rounded-md border border-line bg-white px-2.5 py-1.5 hover:bg-slate-50 transition">
            <Upload size={13} className="text-gold" />
            <span>{replacing ? 'Uploading...' : 'Upload/Replace scan image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={replacing}
              onChange={handleFileChange}
            />
          </label>

          {page.image && (
            <a
              href={page.image}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gold-dark hover:underline truncate max-w-[200px]"
            >
              Open source image ↗
            </a>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
