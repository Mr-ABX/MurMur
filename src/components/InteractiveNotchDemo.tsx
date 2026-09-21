import React, { useState } from 'react';
import { Apple, Search, Star, LayoutGrid, Maximize2, Check, Plus, Wifi } from 'lucide-react';

export const InteractiveNotchDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Voice Dictations');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCardClick = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div id="notch-demo" className="w-full relative brand-hero-sky pt-4 pb-0 overflow-hidden flex flex-col items-center select-none">
      
      {/* Background Sonoma Rolling Hills Wallpaper spanning full width (1:1 Screenshot 3 & 4) */}
      <div 
        className="w-full relative bg-bottom bg-no-repeat bg-cover flex flex-col items-center px-4 pt-4 pb-28"
        style={{
          backgroundImage: `url('/sonoma_wallpaper.webp')`,
          minHeight: '620px'
        }}
      >
        
        {/* FROSTED GLASS SCREEN COMPONENT (1:1 Screenshot 2, 4, 5) */}
        <div className="w-full max-w-5xl rounded-[32px] sm:rounded-[40px] frosted-glass-mac relative shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] flex flex-col justify-between">
          
          {/* Mac Top Bar inside the Frosted Glass Window */}
          <div className="h-10 px-5 flex items-center justify-between text-white/90 text-xs font-semibold select-none z-30 relative">
            
            {/* Left:  DopeNotch */}
            <div className="flex items-center gap-2 drop-shadow">
              <Apple className="w-3.5 h-3.5 fill-white" />
              <span className="font-bold">DopeNotch</span>
            </div>

            {/* Right: Search, Wifi, 09:41 */}
            <div className="flex items-center gap-3 drop-shadow text-[11px] font-medium">
              <Search className="w-3 h-3 text-white cursor-pointer" />
              <Wifi className="w-3.5 h-3.5 text-white" />
              <span className="font-mono font-semibold">09:41</span>
            </div>

          </div>

          {/* HARDWARE NOTCH CUTTING DOWN FROM TOP OF GLASS WINDOW (1:1 Screenshots 2, 4, 5) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-start w-full justify-center pointer-events-none">
            
            {/* Left Notch Ear SVG */}
            <svg className="w-5 h-5 text-black -mr-[0.5px] fill-current flex-none" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M0,0 C10,0 20,10 20,20 L20,0 Z" />
            </svg>

            {/* Center Notch Shelf Body */}
            <div className="w-[94%] sm:w-[86%] md:w-[78%] bg-black text-white rounded-b-[28px] p-3.5 sm:p-5 shadow-2xl border-b border-x border-white/10 flex flex-col gap-3 pointer-events-auto">
              
              {/* Shelf Top Row: Search Input + Action Icons */}
              <div className="flex items-center justify-between gap-3 text-xs">
                
                {/* Search Bar */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161c] border border-white/10 text-zinc-400 text-[11px] w-36 sm:w-48">
                  <Search className="w-3 h-3 text-zinc-500" />
                  <span>Search speech & clips...</span>
                </div>

                {/* Right Shelf Icons */}
                <div className="flex items-center gap-2 text-zinc-400">
                  <button className="p-1 rounded-full hover:text-amber-400 transition-colors" title="Favorites">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded-full hover:text-amber-400 transition-colors" title="Grid View">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded-full hover:text-amber-400 transition-colors" title="Expand">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs with Count Badges (1:1 Screenshot 4) */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5">
                {[
                  { name: 'Voice Dictations', count: 18 },
                  { name: 'Prompts', count: 24 },
                  { name: 'Brand Colors', count: 8 },
                  { name: 'Code Snippets', count: 32 },
                  { name: 'Inspirations', count: 14 },
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all flex-none ${
                      activeTab === tab.name 
                        ? 'bg-white text-black font-semibold shadow-sm' 
                        : 'text-zinc-400 hover:text-white bg-[#16161c] hover:bg-zinc-800'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className={`text-[9px] ${activeTab === tab.name ? 'text-zinc-500' : 'text-zinc-500'}`}>{tab.count}</span>
                  </button>
                ))}
                <button className="p-1 rounded-full bg-[#16161c] text-zinc-400 hover:text-white flex-none">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Clip Cards Row (1:1 Screenshot 4 & 5) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                
                {/* CARD 1: Live Voice Equalizer Clip */}
                <div 
                  onClick={() => handleCardClick('c1', 'Summarize key engineering milestones for Q4 launch')}
                  className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1a1a20] border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between group h-32 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-300 leading-tight line-clamp-2">Voice: "Summarize key Q4 milestones"</span>
                    {copiedId === 'c1' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  
                  <div className="p-1.5 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      {[8, 16, 12, 22, 14, 18].map((h, i) => (
                        <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${h}px` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1">
                    <span className="font-mono text-amber-400/80">Whisper Local</span>
                    <span>Just now</span>
                  </div>
                </div>

                {/* CARD 2: Smiling Woman Portrait Photo */}
                <div 
                  onClick={() => handleCardClick('c2', 'Portrait asset screenshot')}
                  className="rounded-2xl bg-cover bg-center border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between p-2.5 h-32 relative group overflow-hidden"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="relative z-10 flex justify-end">
                    {copiedId === 'c2' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="relative z-10 flex items-center justify-between text-[9px] text-zinc-300 font-mono">
                    <span>5 min ago</span>
                    <span>3.5 MB</span>
                  </div>
                </div>

                {/* CARD 3: App Supply Reference */}
                <div 
                  onClick={() => handleCardClick('c3', 'A curated shelf of beautifully designed macOS apps.')}
                  className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1a1a20] border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between h-32 group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-zinc-300 leading-snug line-clamp-2">
                      A curated shelf of beautifully designed macOS apps.
                    </p>
                    {copiedId === 'c3' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-amber-400 text-xs font-black">
                    dope
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-zinc-500">
                    <span>dopenotch.com</span>
                    <span>12 min ago</span>
                  </div>
                </div>

                {/* CARD 4: Shortcut Snippet */}
                <div 
                  onClick={() => handleCardClick('c4', '⌥ + Space (Hold to dictate on-device)')}
                  className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1a1a20] border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between h-32 group"
                >
                  <div>
                    <span className="text-[10px] text-zinc-300 font-medium block leading-snug">
                      Option + Space: Global On-Device Whisper Dictation
                    </span>
                  </div>
                  {copiedId === 'c4' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  <div className="flex items-center justify-between text-[9px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono text-zinc-400">
                      Shortcut
                    </span>
                    <span>18 min ago</span>
                  </div>
                </div>

                {/* CARD 5: Signature Amber Gold Color Swatch Card (#F59E0B) */}
                <div 
                  onClick={() => handleCardClick('c5', '#F59E0B')}
                  className="p-3 rounded-2xl bg-[#f59e0b] hover:brightness-110 cursor-pointer transition-all flex flex-col justify-between h-32 text-black font-bold shadow-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-extrabold tracking-tight">#F59E0B</span>
                    {copiedId === 'c5' && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <div className="text-[10px] font-bold opacity-90">
                    DopeNotch Gold
                  </div>
                  <div className="text-[9px] opacity-80 font-mono">
                    Brand Accent
                  </div>
                </div>

              </div>
            </div>

            {/* Right Notch Ear SVG */}
            <svg className="w-5 h-5 text-black -ml-[0.5px] fill-current flex-none" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M20,0 C10,0 0,10 0,20 L0,0 Z" />
            </svg>

          </div>

          {/* Bottom Dock Simulation inside the Mac frosted glass window */}
          <div className="relative z-10 flex justify-center pb-4 select-none">
            <div className="px-4 py-2 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-xl flex items-center gap-3">
              {['finder', 'launchpad', 'safari', 'messages', 'mail', 'calendar', 'music', 'appstore', 'settings'].map((item, idx) => (
                <div key={idx} className="w-8 h-8 rounded-xl bg-white/50 border border-white/40 shadow-sm hover:scale-125 transition-transform cursor-pointer"></div>
              ))}
            </div>
          </div>

        </div>

        {/* Soft Bottom Fade into White Section */}
        <div className="w-full absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white pointer-events-none"></div>

      </div>

      {/* CIRCULAR AWARDS BADGES ROW AT BOTTOM OF WALLPAPER (1:1 Screenshot 3) */}
      <div className="w-full bg-white flex justify-center py-6 border-b border-black/5">
        <div className="flex items-center justify-center gap-6 sm:gap-10 overflow-hidden px-4 opacity-70 grayscale hover:grayscale-0 transition-all">
          <div className="w-16 h-16 rounded-full border border-zinc-300 flex flex-col items-center justify-center text-[8px] font-bold text-zinc-800 text-center p-1 uppercase">
            <span>Product Hunt</span>
            <span className="font-extrabold text-black">#1 Product</span>
          </div>
          <div className="w-16 h-16 rounded-full border border-zinc-300 flex flex-col items-center justify-center text-[8px] font-bold text-zinc-800 text-center p-1 uppercase">
            <span>Awwwards</span>
            <span className="font-extrabold text-black">Honorable</span>
          </div>
          <div className="w-16 h-16 rounded-full border border-zinc-300 flex flex-col items-center justify-center text-[8px] font-bold text-zinc-800 text-center p-1 uppercase">
            <span>Best UI</span>
            <span className="font-extrabold text-black">Design</span>
          </div>
          <div className="w-16 h-16 rounded-full border border-zinc-300 flex flex-col items-center justify-center text-[8px] font-bold text-zinc-800 text-center p-1 uppercase">
            <span>Best UX</span>
            <span className="font-extrabold text-black">Design</span>
          </div>
          <div className="w-16 h-16 rounded-full border border-zinc-300 flex flex-col items-center justify-center text-[8px] font-bold text-zinc-800 text-center p-1 uppercase">
            <span>Special</span>
            <span className="font-extrabold text-black">Kudos</span>
          </div>
        </div>
      </div>

    </div>
  );
};
