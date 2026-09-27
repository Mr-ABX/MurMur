import React from 'react';
import { AppleLogo } from './AppleLogo';
import { Layers, Music, CloudSun, CheckSquare, Activity, ExternalLink, Sparkles } from 'lucide-react';

export const OtherProducts: React.FC = () => {
  return (
    <section className="bg-white text-black pt-4 pb-20 px-4 flex flex-col items-center select-none">
      
      {/* ─── 1:1 COOLDOCK / OTHER PRODUCTS SHOWCASE CARD (SUPASTE STYLE) ─── */}
      <div className="w-full max-w-5xl rounded-[32px] bg-[#f5f5f7] border border-black/5 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm mb-16 relative overflow-hidden">
        
        {/* LEFT COLUMN: Product Copy & CTA */}
        <div className="flex-1 text-left">
          
          {/* App Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black shadow-sm">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-black tracking-tight">
              CoolDock app for macOS
            </span>
          </div>

          {/* Heading */}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black mb-3 leading-[1.1]">
            A useful Dock for<br />live widgets.
          </h3>

          {/* Sub-label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-4">
            <AppleLogo className="w-3.5 h-3.5 text-black" />
            <span>Your smart second Dock</span>
          </div>

          {/* Description */}
          <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-8 max-w-md">
            CoolDock brings music, todos, events, weather, search, stats, quick actions, and more useful widgets into one beautiful live dock beside your original Mac Dock.
          </p>

          {/* CTA Button */}
          <a
            href="https://dock.cool"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <AppleLogo className="w-4 h-4 text-white" />
            <span>Download for macOS</span>
          </a>

        </div>

        {/* RIGHT COLUMN: Dark Mockup Frame with Live Widgets */}
        <div className="w-full md:w-[460px] aspect-[16/10] rounded-[24px] bg-[#0c0c0e] border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white group">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* Top Mockup Header */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="font-mono text-[10px] text-zinc-400">CoolDock OS</span>
          </div>

          {/* Center Watermark & Dock Preview */}
          <div className="flex flex-col items-center justify-center my-auto relative z-10">
            <div className="text-center mb-4">
              <span className="font-mono text-sm sm:text-base font-bold text-zinc-300 tracking-wider">
                www.dock.cool
              </span>
            </div>

            {/* Floating Live Widget Mini-Dock */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
              
              {/* Music Widget */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px]">
                <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-bounce" />
                  <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-0.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>

              {/* Weather Widget */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono text-amber-300">
                <CloudSun className="w-3 h-3 text-amber-400" />
                <span>72°</span>
              </div>

              {/* Todo Widget */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] text-emerald-400 font-mono">
                <CheckSquare className="w-3 h-3 text-emerald-400" />
                <span>3/3</span>
              </div>

              {/* Stats Widget */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] text-sky-400 font-mono">
                <Activity className="w-3 h-3 text-sky-400" />
                <span>12%</span>
              </div>

            </div>
          </div>

          {/* Bottom Link Button */}
          <div className="flex justify-between items-center text-[10px] text-zinc-400 relative z-10 pt-2">
            <span className="font-semibold text-zinc-300">Companion Suite</span>
            <span className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors">
              Explore CoolDock <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>

        </div>

      </div>

      {/* ─── FEATURED ON / COMMUNITY BADGES FOOTER LEAD-IN ────────────────── */}
      <div className="w-full max-w-4xl text-center">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
          Featured on
        </div>
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-zinc-600 opacity-80 flex-wrap">
          <span className="hover:text-black transition-colors cursor-default">Product Hunt</span>
          <span className="hover:text-black transition-colors cursor-default">Awwwards</span>
          <span className="hover:text-black transition-colors cursor-default">CSS Design Awards</span>
          <span className="hover:text-black transition-colors cursor-default">Hacker News</span>
          <span className="hover:text-black transition-colors cursor-default">X / Twitter</span>
        </div>
      </div>

    </section>
  );
};
