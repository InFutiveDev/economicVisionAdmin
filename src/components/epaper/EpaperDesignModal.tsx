import { useState, useRef } from 'react'
import {
  LoaderCircle,
  Newspaper,
  Plus,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { uploadImageApi } from '../../api/upload.api'
import type { CustomPageDesign, EpaperPageLayoutTemplate } from '../../types/epaper'
import { renderDomToImageFile } from '../../utils/domToCanvas'
import { ImageUploadField } from '../blocks/ImageUploadField'
import { EpaperBroadsheetCanvas } from './EpaperBroadsheetCanvas'

type EpaperDesignModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (customDesign: CustomPageDesign, generatedImageUrl?: string) => void
  initialDesign?: CustomPageDesign | null
  pageNumber: number
  totalPages: number
  editionName: string
  editionCity: string
  editionDate: string
}

const TEMPLATES: Array<{ id: EpaperPageLayoutTemplate; label: string; icon: string }> = [
  { id: 'front-page', label: 'Front Page / Broadsheet', icon: '📰' },
  { id: 'business-market', label: 'Business & Markets', icon: '📈' },
  { id: 'editorial', label: 'Editorial & Opinion', icon: '✍️' },
  { id: 'regional', label: 'Regional & State', icon: '🗺️' },
]

export function EpaperDesignModal({
  isOpen,
  onClose,
  onSave,
  initialDesign,
  pageNumber,
  totalPages,
  editionName,
  editionCity,
  editionDate,
}: EpaperDesignModalProps) {
  const [activeTab, setActiveTab] = useState<'masthead' | 'lead' | 'digest' | 'markets'>('lead')
  const [previewScale, setPreviewScale] = useState(0.65)
  const [rendering, setRendering] = useState(false)
  const [renderError, setRenderError] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const defaultDesign: CustomPageDesign = {
    template: 'front-page',
    masthead: {
      paperName: editionName || 'संवाद फर्स्ट',
      englishTitle: 'THE ECONOMIC VISION',
      tagline: 'मध्यप्रदेश व छत्तीसगढ़ का निष्पक्ष एवं अग्रणी डिजिटल दैनिक समाचार पत्र',
      city: editionCity || 'इंदौर',
      dateString: editionDate || 'गुरुवार, 10 सितंबर 2026',
      price: '₹5.00',
      issueNo: 'वर्ष: 14 | अंक: 248',
      pageNo: pageNumber,
      totalPages: totalPages || 8,
    },
    topTicker: {
      items: [
        { label: 'सेंसेक्स', value: '81,450', change: '+240' },
        { label: 'निफ्टी', value: '24,980', change: '+72' },
        { label: 'सोना (10g)', value: '₹74,200', change: '+150' },
        { label: 'चांदी (1kg)', value: '₹87,500', change: '+300' },
        { label: 'USD/INR', value: '₹83.85', change: '-0.05' },
      ],
    },
    leadStory: {
      id: 'lead-1',
      kicker: 'विशेष संपादकीय · लीड स्टोरी',
      headline: 'आरबीआई ने ब्याज दरों को यथावत रखा, आर्थिक वृद्धि दर 7.2% रहने का अनुमान',
      byline: 'विशेष आर्थिक संवाददाता / Economic Desk',
      image: 'https://beta.theeconomicvision.com/epaper/page-0.jpg',
      caption: 'आरबीआई मौद्रिक नीति समिति की समीक्षा बैठक के बाद मीडिया को संबोधित करते अधिकारी।',
      paragraphs: [
        'भारतीय रिज़र्व बैंक की मौद्रिक नीति समिति ने नीतिगत रेपो दर को अपरिवर्तित रखने का निर्णय लिया है। मुद्रास्फीति के नियंत्रण में रहने के संकेतों के बीच केंद्रीय बैंक ने वित्तीय स्थिरता बनाए रखने की प्राथमिकता दोहराई है।',
        'चालू वित्त वर्ष के दौरान सकल घरेलू उत्पाद (जीडीपी) की वृद्धि दर 7.2 प्रतिशत रहने का पूर्वानुमान व्यक्त किया गया है। विनिर्माण और सेवा क्षेत्र में निरंतर मज़बूती से समग्र आर्थिक विकास को गति मिलेगी।',
      ],
    },
    sideStories: [
      {
        id: 'side-1',
        headline: 'जीएसटी राजस्व संग्रह में 10% की वार्षिक बढ़ोतरी दर्ज',
        paragraphs: ['चालू माह में सकल वस्तु एवं सेवा कर संग्रह रिकॉर्ड स्तर पर पहुँचा।'],
      },
      {
        id: 'side-2',
        headline: 'डिजिटल बैंकिंग लेन-देन में रिकॉर्ड उछाल',
        image: 'https://beta.theeconomicvision.com/epaper/page-1.jpg',
        paragraphs: ['छोटे शहरों और कस्बों में यूपीआई और ऑनलाइन भुगतानों में 35% की तेज़ वृद्धि।'],
      },
      {
        id: 'side-3',
        headline: 'मध्य भारत में नई औद्योगिक कॉरिडोर परियोजना को मंज़ूरी',
        paragraphs: ['हज़ारों नए रोज़गार के अवसर सृजित होने की उम्मीद।'],
      },
    ],
    bottomStories: [
      {
        id: 'bottom-1',
        kicker: 'उद्योग जगत',
        headline: 'ऑटोमोबाइल सेक्टर में नई इलेक्ट्रिक गाड़ियों की मांग बढ़ी',
        paragraphs: ['ग्राहकों का रुझान हाइब्रिड और ईवी वाहनों की ओर तेज़ी से बढ़ रहा है।'],
      },
      {
        id: 'bottom-2',
        kicker: 'नवीकरणीय ऊर्जा',
        headline: 'सौर ऊर्जा संयंत्रों के विस्तार के लिए विशेष वित्तीय सहायता',
        paragraphs: ['स्वच्छ ऊर्जा क्षमता में आत्मनिर्भरता का लक्ष्य निर्धारित।'],
      },
      {
        id: 'bottom-3',
        kicker: 'विचार विमर्श',
        headline: 'कृषि तकनीक और डिजिटल मंडियों से किसानों को सीधा लाभ',
        paragraphs: ['पारदर्शी मूल्य निर्धारण और त्वरित भुगतान से सशक्तिकरण।'],
      },
    ],
  }

  const [design, setDesign] = useState<CustomPageDesign>(initialDesign || defaultDesign)
  const [newLeadPara, setNewLeadPara] = useState('')

  if (!isOpen) return null

  const handleApplyDesign = async () => {
    setRendering(true)
    setRenderError('')

    try {
      let imageUrl: string | undefined

      if (canvasRef.current) {
        try {
          const file = await renderDomToImageFile(canvasRef.current, `page-${pageNumber}-design.jpg`)
          imageUrl = await uploadImageApi(file)
        } catch (canvasErr) {
          console.warn('Canvas rasterization fallback:', canvasErr)
          // Fallback to sample or first story image if client rasterization has cross-origin restrictions
          imageUrl = design.leadStory.image || 'https://beta.theeconomicvision.com/epaper/page-0.jpg'
        }
      }

      onSave(design, imageUrl)
      onClose()
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Failed to apply page design.')
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex h-[94vh] w-full max-w-7xl flex-col rounded-2xl bg-paper shadow-2xl border border-line overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-line bg-navy px-6 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gold text-navy-deep">
              <Newspaper size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold">Newspaper Page Design Studio</h3>
                <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold">
                  Page #{pageNumber}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Customize page layout, headlines, masthead, and broadsheet columns matching sample e-paper.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/10 text-white/80 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Studio Body: Left Controls, Right Broadsheet Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Design Controls */}
          <div className="w-full lg:w-[480px] shrink-0 border-r border-line flex flex-col bg-white">
            {/* Template Selector Bar */}
            <div className="border-b border-line p-3 bg-slate-50">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Newspaper Template
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setDesign({ ...design, template: tmpl.id })}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition cursor-pointer ${
                      design.template === tmpl.id
                        ? 'border-gold bg-gold/10 text-gold-dark font-bold'
                        : 'border-line hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{tmpl.icon}</span>
                    <span className="truncate">{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-line bg-paper text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('lead')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  activeTab === 'lead'
                    ? 'border-gold text-gold-dark bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lead Story
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('masthead')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  activeTab === 'masthead'
                    ? 'border-gold text-gold-dark bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Masthead &amp; Meta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('digest')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  activeTab === 'digest'
                    ? 'border-gold text-gold-dark bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Columns &amp; Digest
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('markets')}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  activeTab === 'markets'
                    ? 'border-gold text-gold-dark bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Markets Ticker
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* TAB 1: LEAD STORY */}
              {activeTab === 'lead' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Kicker / Category Tag
                    </label>
                    <input
                      type="text"
                      value={design.leadStory.kicker || ''}
                      placeholder="e.g. विशेष रिपोर्ट / मुख्य समाचार"
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          leadStory: { ...design.leadStory, kicker: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lead Headline (Broadsheet Title)
                    </label>
                    <textarea
                      rows={2}
                      value={design.leadStory.headline}
                      placeholder="Enter prominent lead headline..."
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          leadStory: { ...design.leadStory, headline: e.target.value },
                        })
                      }
                      className="w-full rounded border border-line bg-paper p-2.5 font-bold outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Byline</label>
                    <input
                      type="text"
                      value={design.leadStory.byline || ''}
                      placeholder="e.g. विशेष आर्थिक संवाददाता / Editorial Desk"
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          leadStory: { ...design.leadStory, byline: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Lead Photo URL</label>
                    <div className="space-y-1.5">
                      <ImageUploadField
                        id="lead-photo-upload"
                        value={design.leadStory.image || ''}
                        onChange={(url) =>
                          setDesign({
                            ...design,
                            leadStory: { ...design.leadStory, image: url },
                          })
                        }
                      />
                      <input
                        type="url"
                        value={design.leadStory.image || ''}
                        placeholder="Or paste image URL"
                        onChange={(e) =>
                          setDesign({
                            ...design,
                            leadStory: { ...design.leadStory, image: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Photo Caption</label>
                    <input
                      type="text"
                      value={design.leadStory.caption || ''}
                      placeholder="Caption for the photograph..."
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          leadStory: { ...design.leadStory, caption: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lead Story Paragraphs ({design.leadStory.paragraphs.length})
                    </label>
                    <div className="space-y-2">
                      {design.leadStory.paragraphs.map((para, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 font-bold text-slate-400">P{idx + 1}</span>
                          <textarea
                            rows={2}
                            value={para}
                            onChange={(e) => {
                              const updated = [...design.leadStory.paragraphs]
                              updated[idx] = e.target.value
                              setDesign({
                                ...design,
                                leadStory: { ...design.leadStory, paragraphs: updated },
                              })
                            }}
                            className="flex-1 rounded border border-line bg-paper p-2 outline-none focus:border-gold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = design.leadStory.paragraphs.filter((_, i) => i !== idx)
                              setDesign({
                                ...design,
                                leadStory: { ...design.leadStory, paragraphs: updated },
                              })
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newLeadPara}
                          placeholder="Add new paragraph..."
                          onChange={(e) => setNewLeadPara(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newLeadPara.trim()) {
                              setDesign({
                                ...design,
                                leadStory: {
                                  ...design.leadStory,
                                  paragraphs: [...design.leadStory.paragraphs, newLeadPara.trim()],
                                },
                              })
                              setNewLeadPara('')
                            }
                          }}
                          className="h-8 flex-1 rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newLeadPara.trim()) return
                            setDesign({
                              ...design,
                              leadStory: {
                                ...design.leadStory,
                                paragraphs: [...design.leadStory.paragraphs, newLeadPara.trim()],
                              },
                            })
                            setNewLeadPara('')
                          }}
                          className="rounded bg-slate-200 px-2.5 py-1 font-bold text-slate-700 hover:bg-gold hover:text-navy-deep"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MASTHEAD & META */}
              {activeTab === 'masthead' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Newspaper Brand Name
                    </label>
                    <input
                      type="text"
                      value={design.masthead.paperName}
                      placeholder="e.g. संवाद फर्स्ट"
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          masthead: { ...design.masthead, paperName: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 font-bold outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      English Header Subtitle
                    </label>
                    <input
                      type="text"
                      value={design.masthead.englishTitle || ''}
                      placeholder="e.g. THE ECONOMIC VISION"
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          masthead: { ...design.masthead, englishTitle: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Newspaper Tagline
                    </label>
                    <input
                      type="text"
                      value={design.masthead.tagline || ''}
                      placeholder="e.g. मध्यप्रदेश व छत्तीसगढ़ का निष्पक्ष दैनिक समाचार पत्र"
                      onChange={(e) =>
                        setDesign({
                          ...design,
                          masthead: { ...design.masthead, tagline: e.target.value },
                        })
                      }
                      className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        value={design.masthead.city}
                        onChange={(e) =>
                          setDesign({
                            ...design,
                            masthead: { ...design.masthead, city: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Price</label>
                      <input
                        type="text"
                        value={design.masthead.price || ''}
                        placeholder="₹5.00"
                        onChange={(e) =>
                          setDesign({
                            ...design,
                            masthead: { ...design.masthead, price: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Issue / Vol No.
                      </label>
                      <input
                        type="text"
                        value={design.masthead.issueNo || ''}
                        placeholder="वर्ष: 14 | अंक: 248"
                        onChange={(e) =>
                          setDesign({
                            ...design,
                            masthead: { ...design.masthead, issueNo: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date String</label>
                      <input
                        type="text"
                        value={design.masthead.dateString}
                        onChange={(e) =>
                          setDesign({
                            ...design,
                            masthead: { ...design.masthead, dateString: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded border border-line bg-paper px-2.5 outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIGEST & BOTTOM STORIES */}
              {activeTab === 'digest' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-line pb-1 mb-2">
                      Sidebar Digest Headlines
                    </h4>
                    {design.sideStories.map((story, sIdx) => (
                      <div key={sIdx} className="mb-2 p-2 border border-line rounded bg-slate-50 space-y-1">
                        <input
                          type="text"
                          value={story.headline}
                          placeholder="Digest headline..."
                          onChange={(e) => {
                            const updated = [...design.sideStories]
                            updated[sIdx].headline = e.target.value
                            setDesign({ ...design, sideStories: updated })
                          }}
                          className="h-7 w-full rounded border border-line bg-white px-2 font-semibold outline-none text-xs"
                        />
                        <input
                          type="text"
                          value={story.paragraphs?.[0] || ''}
                          placeholder="Brief summary..."
                          onChange={(e) => {
                            const updated = [...design.sideStories]
                            updated[sIdx].paragraphs = [e.target.value]
                            setDesign({ ...design, sideStories: updated })
                          }}
                          className="h-7 w-full rounded border border-line bg-white px-2 text-[11px] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-line pb-1 mb-2">
                      Bottom 3 Column Stories
                    </h4>
                    {design.bottomStories.map((bStory, bIdx) => (
                      <div key={bIdx} className="mb-2 p-2 border border-line rounded bg-slate-50 space-y-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={bStory.kicker || ''}
                            placeholder="Tag / Kicker"
                            onChange={(e) => {
                              const updated = [...design.bottomStories]
                              updated[bIdx].kicker = e.target.value
                              setDesign({ ...design, bottomStories: updated })
                            }}
                            className="h-7 w-1/3 rounded border border-line bg-white px-2 text-[11px] font-bold text-red-700 outline-none"
                          />
                          <input
                            type="text"
                            value={bStory.headline}
                            placeholder="Story Headline"
                            onChange={(e) => {
                              const updated = [...design.bottomStories]
                              updated[bIdx].headline = e.target.value
                              setDesign({ ...design, bottomStories: updated })
                            }}
                            className="h-7 flex-1 rounded border border-line bg-white px-2 font-semibold outline-none text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          value={bStory.paragraphs?.[0] || ''}
                          placeholder="Summary paragraph..."
                          onChange={(e) => {
                            const updated = [...design.bottomStories]
                            updated[bIdx].paragraphs = [e.target.value]
                            setDesign({ ...design, bottomStories: updated })
                          }}
                          className="h-7 w-full rounded border border-line bg-white px-2 text-[11px] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MARKETS TICKER */}
              {activeTab === 'markets' && (
                <div className="space-y-3">
                  <p className="text-slate-500">
                    Customize live market rates displayed in the broadsheet ticker bar:
                  </p>
                  {design.topTicker?.items?.map((ticker, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 p-1.5 border border-line rounded bg-slate-50">
                      <input
                        type="text"
                        value={ticker.label}
                        onChange={(e) => {
                          const items = [...(design.topTicker?.items || [])]
                          items[tIdx].label = e.target.value
                          setDesign({ ...design, topTicker: { items } })
                        }}
                        className="h-7 w-28 rounded border border-line bg-white px-2 font-semibold text-xs"
                      />
                      <input
                        type="text"
                        value={ticker.value}
                        onChange={(e) => {
                          const items = [...(design.topTicker?.items || [])]
                          items[tIdx].value = e.target.value
                          setDesign({ ...design, topTicker: { items } })
                        }}
                        className="h-7 flex-1 rounded border border-line bg-white px-2 font-bold text-xs"
                      />
                      <input
                        type="text"
                        value={ticker.change || ''}
                        onChange={(e) => {
                          const items = [...(design.topTicker?.items || [])]
                          items[tIdx].change = e.target.value
                          setDesign({ ...design, topTicker: { items } })
                        }}
                        className="h-7 w-20 rounded border border-line bg-white px-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Action Strip */}
            <div className="border-t border-line p-4 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyDesign}
                disabled={rendering}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-navy-deep shadow-xs transition hover:bg-gold-light disabled:opacity-50 cursor-pointer"
              >
                {rendering ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Generating Page Scan...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Apply Design &amp; Generate Scan
                  </>
                )}
              </button>
            </div>
            {renderError && <p className="text-xs text-red-600 px-4 pb-2">{renderError}</p>}
          </div>

          {/* Right Panel: Live Scaled Broadsheet Preview */}
          <div className="flex-1 bg-slate-800 flex flex-col items-center overflow-auto p-4 relative">
            {/* Zoom tool overlay */}
            <div className="sticky top-2 z-20 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-white shadow-lg backdrop-blur-xs mb-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-400">Preview Scale:</span>
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.max(0.4, s - 0.1))}
                className="hover:text-gold"
              >
                <ZoomOut size={14} />
              </button>
              <span className="w-10 text-center font-mono">{Math.round(previewScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                className="hover:text-gold"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <div className="origin-top transition-transform pb-12">
              <EpaperBroadsheetCanvas
                ref={canvasRef}
                design={design}
                scale={previewScale}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
