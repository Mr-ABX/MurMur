import React from 'react';
import { Sparkles, Mic, Bell, Clock, Search, Check, Layers, Code2, ArrowUpRight, Zap } from 'lucide-react';
import { AppleLogo } from './AppleLogo';

export const RevoneShowcase: React.FC = () => {
  return (
    <section className="bg-[#09090b] text-white py-24 sm:py-32 px-4 flex flex-col items-center text-center relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      {/* ─── FLOATING TOP PILL NAV / BADGE ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-8 shadow-xl relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            <Mic className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-white tracking-tight">DopeNotch</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-300 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Features</span>
          <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
          <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
        </div>
        <a
          href="#pricing"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
        >
          <AppleLogo className="w-3 h-3 text-white" />
          <span>Download now</span>
        </a>
      </div>

      {/* ─── SECTION TITLE & SUBTITLE (1:1 REVONE STYLE) ─────────────────── */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-5 leading-[1.08]">
          Everything you need to<br className="hidden sm:inline" /> understand your workflow
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
          Track voice dictations, clipboard clips, and AI rewrites across all your platforms — in one fast, unified Mac app.
        </p>
      </div>

      {/* ─── 2-COLUMN GRID (1:1 REVONE STYLE) ─────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left relative z-10">
        
        {/* COLUMN 1: Real-time notifications & dictation */}
        <div className="rounded-[32px] bg-[#141417] border border-white/10 p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
              Real-time notifications
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Get notified the moment a new voice dictation is completed. DopeNotch uses native macOS notifications and notch dynamic shelf, so you never have to break focus.
            </p>
          </div>

          {/* Glowing Notification Mockup Cards Inside */}
          <div className="w-full rounded-2xl p-5 bg-gradient-to-br from-[#1b2234] via-[#151928] to-[#0f111a] border border-blue-500/20 shadow-inner flex flex-col gap-2.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl pointer-events-none" />

            {/* Notification 1 */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Voice Dictation · Xcode</span>
                  </div>
                  <div className="text-[10px] text-zinc-300">
                    "Refactor async audio stream for local Whisper"
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono">1:05</span>
            </div>

            {/* Notification 2 */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>AI Cleaned · Safari</span>
                  </div>
                  <div className="text-[10px] text-zinc-300">
                    "Formatted 4 pull request bullet items"
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono">1:05</span>
            </div>

            {/* Notification 3 */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Quick Paste · Slack</span>
                  </div>
                  <div className="text-[10px] text-zinc-300">
                    "Option + Space executed in 58ms"
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono">20:25</span>
            </div>

            {/* Notification 4 */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Synced to iCloud · Library</span>
                  </div>
                  <div className="text-[10px] text-zinc-300">
                    "24 items updated across MacBook & iPad"
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono">20:25</span>
            </div>

          </div>
        </div>

        {/* COLUMN 2: See every sale / clip in one place */}
        <div className="rounded-[32px] bg-[#141417] border border-white/10 p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
              See every clip in one place
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              View all your recordings, snippets, and clipboard clips in a single, clean timeline. Everything is organized chronologically, so you can quickly search and reuse anything.
            </p>
          </div>

          {/* Dark macOS Window Timeline Mockup */}
          <div className="w-full rounded-2xl p-4 bg-[#18181c] border border-white/10 shadow-inner flex flex-col gap-3">
            
            {/* Window Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Clips Library</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[11px]">
                <Search className="w-3 h-3 text-zinc-500" />
                <span>Search clips...</span>
              </div>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-2">
              
              {/* Item 1 */}
              <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Sprint Retro & Milestones
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Voice Dictation · Whisper Large-v3
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">98 wpm</span>
                  <div className="text-[9px] text-zinc-500 font-mono">2m ago</div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Regex Email Matcher Function
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Code Snippet · TypeScript
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-zinc-300">2.4 KB</span>
                  <div className="text-[9px] text-zinc-500 font-mono">14m ago</div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Customer Release Email Copy
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      AI Cleaned · Markdown
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-zinc-300">140 words</span>
                  <div className="text-[9px] text-zinc-500 font-mono">29m ago</div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs font-bold">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Figma Brand Color Palette
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Design Asset · #F59E0B
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">#F59E0B</span>
                  <div className="text-[9px] text-zinc-500 font-mono">1h ago</div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
