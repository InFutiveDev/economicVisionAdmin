import { forwardRef } from 'react'
import type { CustomPageDesign } from '../../types/epaper'

type EpaperBroadsheetCanvasProps = {
  design: CustomPageDesign
  scale?: number
}

export const EpaperBroadsheetCanvas = forwardRef<HTMLDivElement, EpaperBroadsheetCanvasProps>(
  ({ design, scale = 1 }, ref) => {
    const { masthead, topTicker, leadStory, sideStories, bottomStories } = design

    return (
      <div
        ref={ref}
        id="epaper-broadsheet-render-target"
        style={{
          width: '900px',
          minHeight: '1270px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className="relative bg-[#fcfbf7] text-[#111827] font-serif p-6 shadow-2xl border border-slate-300 select-none"
      >
        {/* Newspaper Top Header / Vol, Price, Date strip */}
        <div className="flex items-center justify-between border-b border-black text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-800 pb-1">
          <div>
            <span>{masthead.issueNo || 'वर्ष: 14 | अंक: 248'}</span>
            <span className="mx-2 text-slate-400">|</span>
            <span>मूल्य: {masthead.price || '₹5.00'}</span>
          </div>
          <div>
            <span>{masthead.city || 'इंदौर'}</span>
            <span className="mx-2 text-slate-400">|</span>
            <span>{masthead.dateString || 'गुरुवार, 10 सितंबर 2026'}</span>
          </div>
          <div>
            <span>पृष्ठ: {masthead.pageNo || 1} of {masthead.totalPages || 8}</span>
          </div>
        </div>

        {/* Masthead */}
        <div className="py-4 text-center border-b-2 border-black border-t-2 border-black mt-1">
          {masthead.englishTitle && (
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-red-700 mb-0.5">
              {masthead.englishTitle}
            </p>
          )}
          <h1 className="text-6xl font-extrabold tracking-tight text-black leading-none py-1">
            {masthead.paperName || 'संवाद फर्स्ट'}
          </h1>
          <p className="text-xs font-sans text-slate-600 tracking-wide mt-1 italic">
            {masthead.tagline || 'मध्यप्रदेश व छत्तीसगढ़ का निष्पक्ष एवं अग्रणी डिजिटल दैनिक समाचार पत्र'}
          </p>
        </div>

        {/* Markets Ticker Bar */}
        {topTicker && topTicker.items && topTicker.items.length > 0 && (
          <div className="my-2 border-y border-black/80 bg-slate-50 py-1 px-3 flex items-center justify-between text-[11px] font-sans font-semibold">
            <span className="text-red-700 uppercase tracking-wider font-bold">बाज़ार आज:</span>
            {topTicker.items.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-bold text-black">{item.value}</span>
                {item.change && (
                  <span
                    className={`text-[10px] ${
                      item.change.startsWith('+') ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    ({item.change})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Main Content Layout based on template */}
        <div className="grid grid-cols-12 gap-5 mt-3">
          {/* Main Lead Story (Left & Center - 8 cols) */}
          <div className="col-span-8 flex flex-col border-r border-slate-300 pr-5">
            {leadStory.kicker && (
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-red-700 block mb-1">
                {leadStory.kicker}
              </span>
            )}

            <h2 className="text-3xl font-extrabold leading-tight text-black tracking-tight mb-2">
              {leadStory.headline || 'मुख्य शीर्षक यहाँ दर्ज करें'}
            </h2>

            {leadStory.byline && (
              <p className="text-xs font-sans text-slate-500 font-semibold mb-2">
                — {leadStory.byline}
              </p>
            )}

            {leadStory.image && (
              <div className="mb-3 overflow-hidden border border-slate-300 bg-slate-100">
                <img
                  src={leadStory.image}
                  alt={leadStory.headline}
                  className="w-full h-64 object-cover object-top block"
                />
                {leadStory.caption && (
                  <p className="text-[11px] font-sans text-slate-600 p-1.5 bg-slate-50 border-t border-slate-200 italic">
                    {leadStory.caption}
                  </p>
                )}
              </div>
            )}

            {/* Lead Story Paragraphs in 2 columns */}
            <div className="grid grid-cols-2 gap-4 text-[13px] leading-relaxed text-slate-900 text-justify">
              {leadStory.paragraphs && leadStory.paragraphs.length > 0 ? (
                leadStory.paragraphs.map((p, idx) => (
                  <p key={idx} className="mb-2">
                    {idx === 0 && (
                      <span className="font-sans font-bold text-slate-700 mr-1">
                        [{masthead.city}]
                      </span>
                    )}
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p>
                    प्रमुख आर्थिक एवं राष्ट्रीय समाचारों की विस्तृत समीक्षा। भारतीय रिज़र्व बैंक एवं वित्त मंत्रालय द्वारा जारी नवीनतम नीतियों का बाज़ार पर सकारात्मक प्रभाव देखा जा रहा है।
                  </p>
                  <p>
                    विशेषज्ञों के अनुसार चालू वित्त वर्ष की दूसरी छमाही में विनिर्माण तथा सेवा क्षेत्र में तेजी की संभावना है, जिससे रोज़गार के नए अवसर सृजित होंगे।
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar Columns (4 cols) */}
          <div className="col-span-4 flex flex-col space-y-4">
            {/* Boxed News Digest */}
            <div className="border-2 border-red-800 bg-red-50/40 p-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-red-800 border-b border-red-800/40 pb-1 mb-2 text-center">
                संवाद बुलेटिन · Quick Digest
              </h3>
              <div className="space-y-2 text-xs">
                {sideStories && sideStories.length > 0 ? (
                  sideStories.map((story, idx) => (
                    <div key={story.id || idx} className="border-b border-red-200/60 pb-2 last:border-b-0">
                      <h4 className="font-bold text-slate-900 leading-snug mb-1">
                        • {story.headline}
                      </h4>
                      {story.paragraphs?.[0] && (
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          {story.paragraphs[0]}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="border-b border-red-200 pb-2">
                      <h4 className="font-bold text-slate-900 leading-snug">
                        • जीएसटी संग्रह ₹1.82 लाख करोड़ पार
                      </h4>
                      <p className="text-[11px] text-slate-700">
                        त्योहारी मांग से राजस्व में 10% की वार्षिक वृद्धि दर्ज।
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">
                        • डिजिटल इंडिया पहल में रिकॉर्ड निवेश
                      </h4>
                      <p className="text-[11px] text-slate-700">
                        टेक्नोलॉजी और स्टार्टअप्स को मिला प्रोत्साहन।
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Side Story 2 with thumbnail */}
            {sideStories && sideStories[1] && (
              <div className="border border-slate-300 p-2.5 bg-white">
                {sideStories[1].image && (
                  <img
                    src={sideStories[1].image}
                    alt=""
                    className="w-full h-28 object-cover mb-2 border border-slate-200"
                  />
                )}
                <h4 className="font-bold text-sm leading-snug text-black mb-1">
                  {sideStories[1].headline}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {sideStories[1].paragraphs?.[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stories Divider & Section */}
        <div className="mt-5 pt-3 border-t-2 border-black">
          <div className="grid grid-cols-3 gap-4">
            {bottomStories && bottomStories.length > 0 ? (
              bottomStories.map((story, idx) => (
                <div key={story.id || idx} className="border-r border-slate-300 pr-3 last:border-r-0">
                  {story.kicker && (
                    <span className="text-[10px] font-sans font-bold uppercase text-red-700 block mb-0.5">
                      {story.kicker}
                    </span>
                  )}
                  <h4 className="font-bold text-sm leading-snug text-black mb-1">
                    {story.headline}
                  </h4>
                  {story.image && (
                    <img
                      src={story.image}
                      alt=""
                      className="w-full h-24 object-cover my-1 border border-slate-200"
                    />
                  )}
                  <p className="text-[11px] text-slate-800 leading-relaxed text-justify">
                    {story.paragraphs?.[0]}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="border-r border-slate-300 pr-3">
                  <span className="text-[10px] font-sans font-bold uppercase text-red-700 block mb-0.5">
                    बाज़ार विश्लेषण
                  </span>
                  <h4 className="font-bold text-sm leading-snug text-black mb-1">
                    ऑटोमोबाइल सेक्टर में 15% की रिकॉर्ड बिक्री
                  </h4>
                  <p className="text-[11px] text-slate-800 leading-relaxed">
                    नए वाहनों की मांग में भारी उछाल, इलेक्ट्रिक वाहनों का हिस्सा बढ़ा।
                  </p>
                </div>
                <div className="border-r border-slate-300 pr-3">
                  <span className="text-[10px] font-sans font-bold uppercase text-red-700 block mb-0.5">
                    उद्योग एवं व्यापार
                  </span>
                  <h4 className="font-bold text-sm leading-snug text-black mb-1">
                    सौर ऊर्जा परियोजनाओं के लिए नई सब्सिडी योजना
                  </h4>
                  <p className="text-[11px] text-slate-800 leading-relaxed">
                    मध्य भारत में नवीकरणीय ऊर्जा को मिलेगा बढ़ावा।
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase text-red-700 block mb-0.5">
                    विचार मंच
                  </span>
                  <h4 className="font-bold text-sm leading-snug text-black mb-1">
                    कृषि सुधारों से किसानों की आय में निरंतर वृद्धि
                  </h4>
                  <p className="text-[11px] text-slate-800 leading-relaxed">
                    कृषि उत्पादन और डिजिटल मंडियों का सफल समन्वय।
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Footer Rule */}
        <div className="mt-6 pt-2 border-t border-black flex items-center justify-between text-[10px] font-sans font-semibold text-slate-600 uppercase tracking-widest">
          <span>{masthead.paperName || 'संवाद फर्स्ट'} Digital Broadsheet</span>
          <span>वेबसाइट: www.theeconomicvision.com</span>
          <span>अंक संख्या {masthead.issueNo || '248'} · {masthead.city}</span>
        </div>
      </div>
    )
  },
)

EpaperBroadsheetCanvas.displayName = 'EpaperBroadsheetCanvas'
