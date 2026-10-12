import { useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  selectEpaperEditor,
  setActivePageIndex,
} from '../../redux/slices/epaperSlice'
import { EpaperBroadsheetCanvas } from './EpaperBroadsheetCanvas'

export function EpaperPreview() {
  const dispatch = useAppDispatch()
  const editor = useAppSelector(selectEpaperEditor)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeIndex = editor.activePageIndex
  const currentPage = editor.pages[activeIndex]
  const totalPages = editor.pages.length

  const handlePrev = () => {
    if (activeIndex > 0) {
      dispatch(setActivePageIndex(activeIndex - 1))
    }
  }

  const handleNext = () => {
    if (activeIndex < totalPages - 1) {
      dispatch(setActivePageIndex(activeIndex + 1))
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 250))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50))
  const handleZoomReset = () => setZoom(100)

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      void document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  if (totalPages === 0) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-12 text-center">
        <p className="font-serif text-lg font-bold text-navy">No pages to preview</p>
        <p className="mt-1 text-xs text-slate-500">
          Add at least one page scan in editor mode to preview the digital edition.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Newspaper edition header */}
      <div className="border-b-2 border-gold pb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gold-dark">
          Digital Edition Reader Preview
        </span>
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy sm:text-3xl">
          {editor.title || editor.name || 'संवाद फर्स्ट'}
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          {editor.name && editor.name !== editor.title && (
            <span className="font-semibold text-slate-800 mr-1.5">{editor.name} ·</span>
          )}
          {editor.city} · {editor.date} · Page {activeIndex + 1} of {totalPages}
        </p>
        {editor.paragraph && (
          <p className="mt-2 text-xs text-slate-700 leading-relaxed max-w-3xl">
            {editor.paragraph}
          </p>
        )}
      </div>

      {/* Reader Container */}
      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-900 shadow-xl"
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 px-4 py-2.5 text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={handlePrev}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {/* Page dropdown */}
            <select
              value={activeIndex + 1}
              onChange={(e) => dispatch(setActivePageIndex(Number(e.target.value) - 1))}
              className="h-8 appearance-none rounded-full border border-white/20 bg-slate-700 px-4 pr-7 text-xs font-medium text-white outline-none cursor-pointer"
            >
              {editor.pages.map((p, idx) => (
                <option key={p.id || idx} value={idx + 1} className="bg-slate-800 text-white">
                  Page {idx + 1} of {totalPages}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={activeIndex === totalPages - 1}
              onClick={handleNext}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom & Extras Controls */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-700 rounded-full px-2 py-1">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom out"
                className="flex size-6 items-center justify-center rounded-full hover:bg-white/20 transition"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                title="Reset zoom"
                className="px-1 text-[11px] font-semibold text-white/90 min-w-9 text-center hover:text-gold"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom in"
                className="flex size-6 items-center justify-center rounded-full hover:bg-white/20 transition"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {zoom !== 100 && (
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1 text-white/70 hover:text-white"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            )}

            {currentPage?.image && (
              <a
                href={currentPage.image}
                download={`${editor.slug}-page-${activeIndex + 1}.jpg`}
                target="_blank"
                rel="noreferrer"
                title="Download this page"
                className="flex items-center gap-1 hover:text-gold transition"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen reader"
              className="p-1 hover:text-gold transition"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="relative min-h-[60vh] max-h-[76vh] overflow-auto bg-slate-950 p-4 sm:p-6 flex items-start justify-center">
          {currentPage?.customDesign ? (
            <div
              className="origin-top transition-transform duration-150 shadow-2xl"
              style={{ width: 'fit-content' }}
            >
              <EpaperBroadsheetCanvas
                design={currentPage.customDesign}
                scale={zoom / 100}
              />
            </div>
          ) : currentPage?.image ? (
            <div
              className="origin-top transition-transform duration-150 shadow-2xl bg-white"
              style={{ transform: `scale(${zoom / 100})`, width: 'fit-content' }}
            >
              <img
                src={currentPage.image}
                alt={currentPage.title || `Page ${activeIndex + 1}`}
                className="max-w-[850px] w-full h-auto block"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              No image scan available for this page
            </div>
          )}
        </div>
      </div>

      {/* Filmstrip of Thumbnails */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy">
          Pages Navigation ({totalPages})
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1">
          {editor.pages.map((p, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => dispatch(setActivePageIndex(idx))}
                className={`group flex flex-col items-center shrink-0 w-20 rounded-lg p-1 transition cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-gold bg-gold/10'
                    : 'border border-line hover:border-slate-400 bg-white'
                }`}
              >
                <div className="relative h-24 w-full overflow-hidden rounded bg-slate-100">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                      Empty
                    </div>
                  )}
                </div>
                <span
                  className={`mt-1 text-[11px] font-bold ${
                    isActive ? 'text-gold-dark' : 'text-slate-600'
                  }`}
                >
                  Page {idx + 1}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
