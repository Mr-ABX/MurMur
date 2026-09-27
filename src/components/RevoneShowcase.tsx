import React from 'react';
import { AppleLogo } from './AppleLogo';
import { Mic, Image as ImageIcon } from 'lucide-react';

export const RevoneShowcase: React.FC = () => {
  return (
    <section className="bg-black text-white py-24 sm:py-32 px-4 flex flex-col items-center text-center relative overflow-hidden select-none">
      
      {/* ─── FLOATING TOP PILL NAV / BADGE ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-obsidian-900 border border-white/10 mb-8 shadow-xl relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-500 text-black flex items-center justify-center text-[10px] font-bold">
            <Mic className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-white tracking-tight">DopeNotch</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-400 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Features</span>
          <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
          <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
        </div>
        <a
          href="#pricing"
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all shadow-md"
        >
          <AppleLogo className="w-3 h-3 text-black" />
          <span>Download now</span>
        </a>
      </div>

      {/* ─── SECTION TITLE & SUBTITLE (1:1 REVONE LAYOUT IN OUR DESIGN SYSTEM) ─── */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.08]">
          Everything you need to<br className="hidden sm:inline" /> understand your workflow
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
          Track voice dictations, clipboard history, and performance across all your apps — in one fast, unified Mac app.
        </p>
      </div>

      {/* ─── 2-COLUMN GRID (1:1 REVONE LAYOUT WITH EMPTY MEDIA PLACEHOLDERS) ──── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left relative z-10">
        
        {/* COLUMN 1: Real-time notifications / dictations */}
        <div className="rounded-[32px] sm:rounded-[40px] bg-obsidian-900 border border-white/10 p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Real-time notifications
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
              Get notified the moment a new voice dictation or clipboard clip is processed. DopeNotch uses native macOS notifications, so you never have to check dashboards to know what's going on.
            </p>
          </div>

          {/* Empty Space Placeholder for Image / Video (Per User Request) */}
          <div className="w-full aspect-[16/11] rounded-2xl bg-obsidian-950 border border-white/10 flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:border-white/30 transition-all">
              <ImageIcon className="w-5 h-5 text-zinc-500" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Media / Screenshot Space
            </span>
          </div>
        </div>

        {/* COLUMN 2: See every clip in one place */}
        <div className="rounded-[32px] sm:rounded-[40px] bg-obsidian-900 border border-white/10 p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              See every clip in one place
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
              View all your voice dictations, code snippets, and clippings in a single, clean timeline. Everything is organized chronologically, so you can quickly understand what's happening across your Mac.
            </p>
          </div>

          {/* Empty Space Placeholder for Image / Video (Per User Request) */}
          <div className="w-full aspect-[16/11] rounded-2xl bg-obsidian-950 border border-white/10 flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:border-white/30 transition-all">
              <ImageIcon className="w-5 h-5 text-zinc-500" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Media / Screenshot Space
            </span>
          </div>
        </div>

      </div>

    </section>
  );
};
