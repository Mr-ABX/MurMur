import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const RevoneShowcase: React.FC = () => {
  const cards = [
    {
      title: 'Real-time notifications',
      description: "Get notified the moment a new voice dictation or clipboard clip is processed. DopeNotch uses native macOS notifications, so you never have to check dashboards to know what's going on.",
      tag: '01 / NOTIFICATIONS'
    },
    {
      title: 'See every clip in one place',
      description: "View all your voice dictations, code snippets, and clippings in a single, clean timeline. Everything is organized chronologically, so you can quickly understand what's happening across your Mac.",
      tag: '02 / TIMELINE'
    },
    {
      title: 'Smart AI auto-formatting',
      description: 'Transform raw speech transcripts into clean bullet points, executive summaries, or formatted code blocks on the fly using on-device Apple Silicon intelligence.',
      tag: '03 / AI FORMATTING'
    },
    {
      title: 'Stay on top of your workflow',
      description: 'Search through thousands of copied words in sub-milliseconds, filter by application or tag, and access everything instantly through global keyboard shortcuts.',
      tag: '04 / WORKFLOW'
    },
  ];

  return (
    <section className="bg-white text-black py-24 sm:py-32 px-4 flex flex-col items-center text-center relative select-none">
      
      {/* ─── SECTION TITLE & SUBTITLE (DESIGN SYSTEM ALIGNED) ─────────────── */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111113] mb-5 leading-[1.08]">
          Everything you need to<br className="hidden sm:inline" /> understand your workflow
        </h2>
        <p className="text-[#6e6e73] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
          Track voice dictations, clipboard history, and performance across all your apps — in one fast, unified Mac app.
        </p>
      </div>

      {/* ─── 2-COLUMN GRID WITH 2 ROWS (4 CARDS TOTAL IN LIGHT DESIGN SYSTEM) ─── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            className="rounded-[32px] sm:rounded-[40px] bg-[#f5f5f7] border border-black/[0.04] p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
          >
            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2">
                {card.tag}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111113] mb-3">
                {card.title}
              </h3>
              <p className="text-[#6e6e73] text-sm sm:text-base leading-relaxed font-normal">
                {card.description}
              </p>
            </div>

            {/* Empty Space Placeholder for Image / Video (Per User Request) */}
            <div className="w-full aspect-[16/11] rounded-2xl bg-white border border-zinc-200/80 flex flex-col items-center justify-center text-zinc-400 relative overflow-hidden group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] border border-dashed border-zinc-300 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:border-zinc-400 transition-all">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Media / Screenshot Space
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
