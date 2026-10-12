import { useState, useRef, type DragEvent } from 'react'
import { FileUp, LayoutTemplate, Plus, Sparkles, UploadCloud } from 'lucide-react'
import { batchUploadPageImages } from '../../api/epaper.api'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  addBatchPages,
  addPage,
  movePage,
  removePage,
  selectEpaperEditor,
  setActivePageIndex,
  setPreview,
  setUploading,
  updatePage,
} from '../../redux/slices/epaperSlice'
import type { CustomPageDesign } from '../../types/epaper'
import { EpaperDesignModal } from './EpaperDesignModal'
import { EpaperPageCard } from './EpaperPageCard'

export function EpaperPageList() {
  const dispatch = useAppDispatch()
  const editor = useAppSelector(selectEpaperEditor)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [singleUrl, setSingleUrl] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [designingIndex, setDesigningIndex] = useState<number | 'new' | null>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (!validFiles.length) {
      setUploadError('Please select valid image files (JPG, PNG, WebP).')
      return
    }

    validFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
    )

    setUploadError('')
    dispatch(setUploading({ uploading: true, progress: { completed: 0, total: validFiles.length } }))

    try {
      const uploadedPages = await batchUploadPageImages(validFiles, (completed, total) => {
        dispatch(setUploading({ uploading: true, progress: { completed, total } }))
      })
      dispatch(addBatchPages(uploadedPages))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error uploading pages.')
    } finally {
      dispatch(setUploading({ uploading: false, progress: null }))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files)
    }
  }

  const handleAddFromUrl = () => {
    if (!singleUrl.trim()) return
    dispatch(addPage({ image: singleUrl.trim() }))
    setSingleUrl('')
  }

  const handleSaveCustomDesign = (customDesign: CustomPageDesign, generatedImageUrl?: string) => {
    if (designingIndex === 'new') {
      const pageNo = editor.pages.length + 1
      dispatch(
        addPage({
          title: `Page ${pageNo} - ${customDesign.leadStory.headline.slice(0, 30)}...`,
          image: generatedImageUrl || customDesign.leadStory.image || '',
          description: customDesign.leadStory.headline,
        }),
      )
      // also save customDesign on that newly created page
      const newIndex = editor.pages.length
      dispatch(
        updatePage({
          index: newIndex,
          updates: { customDesign },
        }),
      )
    } else if (typeof designingIndex === 'number' && editor.pages[designingIndex]) {
      const updates: Partial<(typeof editor.pages)[0]> = {
        customDesign,
        description: customDesign.leadStory.headline,
      }
      if (generatedImageUrl) {
        updates.image = generatedImageUrl
      }
      dispatch(updatePage({ index: designingIndex, updates }))
    }
    setDesigningIndex(null)
  }

  const activePageForDesign =
    typeof designingIndex === 'number' ? editor.pages[designingIndex] : null

  return (
    <div className="space-y-6">
      {/* Upload & Builder Action Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? 'border-gold bg-gold/5 scale-[1.01]'
            : 'border-line bg-paper hover:border-gold/50 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold-dark mb-3">
          <UploadCloud size={28} />
        </div>
        <h4 className="font-serif text-lg font-semibold text-navy">
          Upload scans or design pages from newspaper templates
        </h4>
        <p className="mt-1 max-w-md text-xs text-slate-500">
          Upload newspaper page scans, or use the interactive Broadsheet Page Designer to generate custom pages matching the sample e-paper.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {/* Custom Broadsheet Designer Trigger */}
          <button
            type="button"
            onClick={() => setDesigningIndex('new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-navy-deep shadow-xs transition hover:bg-gold-light"
          >
            <LayoutTemplate size={15} />
            <span>Design Custom Page (Template)</span>
          </button>

          {/* Multiple File Upload */}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-navy-deep">
            <FileUp size={15} />
            <span>Upload Page Scans</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={editor.uploading}
              onChange={(e) => {
                if (e.target.files) void handleFiles(e.target.files)
              }}
            />
          </label>
        </div>

        {editor.uploading && editor.uploadProgress && (
          <div className="mt-4 w-full max-w-sm rounded-lg border border-gold/30 bg-gold/10 p-3 text-xs">
            <div className="flex items-center justify-between font-medium text-gold-dark mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="animate-spin text-gold" />
                Processing &amp; Uploading...
              </span>
              <span>
                {editor.uploadProgress.completed} / {editor.uploadProgress.total} pages
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gold/20">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{
                  width: `${(editor.uploadProgress.completed / editor.uploadProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {uploadError && <p className="mt-3 text-xs text-red-600 font-medium">{uploadError}</p>}
      </div>

      {/* Or Paste URL */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-line bg-paper p-3 text-xs">
        <span className="text-slate-500 font-medium whitespace-nowrap pl-1">
          Or add single image URL:
        </span>
        <input
          type="url"
          value={singleUrl}
          placeholder="https://example.com/epaper-page-1.jpg"
          onChange={(e) => setSingleUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddFromUrl()
          }}
          className="h-8 flex-1 rounded border border-line bg-white px-2.5 outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={handleAddFromUrl}
          disabled={!singleUrl.trim()}
          className="flex items-center justify-center gap-1 rounded bg-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-gold hover:text-navy-deep disabled:opacity-50 transition"
        >
          <Plus size={14} />
          Add Page
        </button>
      </div>

      {/* Pages Section Header */}
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div>
          <h3 className="font-serif text-lg font-bold text-navy">
            Edition Pages ({editor.pages.length})
          </h3>
          <p className="text-xs text-slate-500">
            Organize order of pages. You can upload scans or design broadsheets with headlines &amp; columns.
          </p>
        </div>

        {editor.pages.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(setPreview(true))}
            className="text-xs font-semibold text-gold-dark hover:underline"
          >
            Preview reader →
          </button>
        )}
      </div>

      {/* Pages Cards List */}
      {editor.pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center">
          <p className="font-serif text-base font-semibold text-slate-700">
            No pages added yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click &quot;Design Custom Page&quot; or upload newspaper scans above to get started.
          </p>
          <button
            type="button"
            onClick={() => setDesigningIndex('new')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-xs font-bold text-navy-deep shadow-xs transition hover:bg-gold-light"
          >
            <LayoutTemplate size={14} /> Create First Page from Template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {editor.pages.map((page, index) => (
            <EpaperPageCard
              key={page.id || `page-${index}`}
              page={page}
              index={index}
              isFirst={index === 0}
              isLast={index === editor.pages.length - 1}
              onUpdate={(updates) => dispatch(updatePage({ index, updates }))}
              onRemove={() => dispatch(removePage(index))}
              onMoveUp={() => dispatch(movePage({ index, direction: -1 }))}
              onMoveDown={() => dispatch(movePage({ index, direction: 1 }))}
              onOpenDesign={() => setDesigningIndex(index)}
              onPreview={() => {
                dispatch(setActivePageIndex(index))
                dispatch(setPreview(true))
              }}
            />
          ))}
        </div>
      )}

      {/* Page Design Studio Modal */}
      {designingIndex !== null && (
        <EpaperDesignModal
          isOpen={true}
          onClose={() => setDesigningIndex(null)}
          onSave={handleSaveCustomDesign}
          initialDesign={activePageForDesign?.customDesign || null}
          pageNumber={
            typeof designingIndex === 'number'
              ? designingIndex + 1
              : editor.pages.length + 1
          }
          totalPages={Math.max(editor.pages.length, 8)}
          editionName={editor.name || editor.title}
          editionCity={editor.city}
          editionDate={editor.date}
        />
      )}
    </div>
  )
}
