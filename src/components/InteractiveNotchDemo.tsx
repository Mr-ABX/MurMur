import React, { useState, useEffect } from 'react';
import { Apple, Search, Star, LayoutGrid, Maximize2, Check, Plus, Wifi, Minimize2, Sparkles } from 'lucide-react';

export const InteractiveNotchDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Voice Dictations');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNotchExpanded, setIsNotchExpanded] = useState<boolean>(true);
  const [morphing, setMorphing] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  // Scroll depth parallax effect matching Supaste
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCardClick = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleNotch = () => {
    setMorphing(true);
    setIsNotchExpanded((prev) => !prev);
    setTimeout(() => setMorphing(false), 450);
  };

  // Parallax transform calculation for 3D spatial depth floating effect
  const depthTranslateY = Math.max(-25, Math.min(scrollY * 0.06, 35));
  const depthScale = Math.min(1.02, Math.max(0.98, 1 + scrollY * 0.00004));

  return (
    <div id="notch-demo" className="w-full relative pt-2 pb-0 flex flex-col items-center select-none bg-transparent">
      
      {/* Background Sonoma Rolling Hills Landscape with transparent sky above */}
      <div 
        className="w-full relative bg-bottom bg-no-repeat bg-cover flex flex-col items-center px-4 pt-6 pb-28 sm:pb-36 overflow-hidden"
        style={{
          backgroundImage: `url('/sonoma_wallpaper.webp')`,
          minHeight: '680px'
        }}
      >
        
        {/* FROSTED GLASS MAC SCREEN (Middle Layer: z-20, Behind Foreground Dunes) */}
        <div 
          className="w-full max-w-5xl rounded-[32px] sm:rounded-[40px] frosted-glass-mac relative z-20 shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9.5] flex flex-col justify-between transition-transform duration-300 ease-out mb-[-50px] sm:mb-[-70px]"
          style={{
            transform: `translateY(${depthTranslateY}px) scale(${depthScale})`,
            willChange: 'transform'
          }}
        >
          
          {/* Mac Top Bar inside the Frosted Glass Window */}
          <div className="h-10 px-5 flex items-center justify-between text-white/90 text-xs font-semibold select-none z-30 relative">
            
            {/* Left:  DopeNotch */}
            <div className="flex items-center gap-1.5 drop-shadow">
              <Apple className="w-3.5 h-3.5 fill-white" />
              <span className="font-semibold text-[13px] tracking-tight">DopeNotch</span>
            </div>

            {/* Right: Search, Wifi, 09:41 */}
            <div className="flex items-center gap-3 drop-shadow text-[11px] font-medium">
              <Search className="w-3.5 h-3.5 text-white/80 cursor-pointer hover:text-white" />
              <Wifi className="w-3.5 h-3.5 text-white/80" />
              <span className="font-mono font-semibold">09:41</span>
            </div>

          </div>

          {/* HARDWARE NOTCH CUTTING DOWN FROM TOP OF GLASS WINDOW */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-start w-full justify-center pointer-events-none">
            
            {/* Left Notch Ear SVG (Exact Apple Concave Curve) */}
            <div className="w-5 h-5 flex-none relative overflow-visible -mr-[0.5px]">
              <svg 
                viewBox="0 0 20 20" 
                className="w-5 h-5 fill-black flex-none" 
                style={{ transform: 'scaleX(-1)' }}
                aria-hidden="true"
              >
                <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" />
              </svg>
            </div>

            {/* NOTCH CONTAINER WITH SMOOTH SPRING MORPH (EXPANDED vs COMPACT ISLAND) */}
            {isNotchExpanded ? (
              /* --- STATE 1: EXPANDED SHELF (Exact 1:1 Supaste Layout) --- */
              <div 
                className={`w-[92%] sm:w-[84%] md:w-[76%] lg:w-[68%] max-w-4xl bg-black text-white rounded-b-[24px] p-3.5 sm:p-4 shadow-2xl border-b border-x border-white/10 flex flex-col gap-3 pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  morphing ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
                }`}
              >
                
                {/* Top Row: Search Bar + Action Icons + Dynamic Island Collapse Toggle */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  
                  {/* Search Input */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181f] border border-white/10 text-zinc-400 text-[11px] w-40 sm:w-56">
                    <Search className="w-3 h-3 text-zinc-500" />
                    <span>Search speech & clips...</span>
                  </div>

                  {/* Action Icons + Collapse Button */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-400">
                    <button className="p-1.5 rounded-full hover:text-amber-400 hover:bg-white/5 transition-colors" title="Starred">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-full hover:text-amber-400 hover:bg-white/5 transition-colors" title="Grid View">
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-full hover:text-amber-400 hover:bg-white/5 transition-colors" title="Full Library">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Apple Dynamic Island Collapse Button */}
                    <button 
                      onClick={toggleNotch}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-white/10 transition-all text-[10px] font-semibold ml-1"
                      title="Collapse to Dynamic Island"
                    >
                      <Minimize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Island</span>
                    </button>
                  </div>
                </div>

                {/* Tabs with Count Badges (1:1 with Screenshot 4) */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5 no-scrollbar">
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
                          : 'text-zinc-400 hover:text-white bg-[#18181f] hover:bg-zinc-800'
                      }`}
                    >
                      <span>{tab.name}</span>
                      <span className={`text-[9px] ${activeTab === tab.name ? 'text-zinc-500' : 'text-zinc-500'}`}>{tab.count}</span>
                    </button>
                  ))}
                  <button className="p-1 rounded-full bg-[#18181f] text-zinc-400 hover:text-white flex-none">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Clip Cards Row (1:1 with media_1789956698808.png) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                  
                  {/* CARD 1: Portrait Photo of Smiling Woman */}
                  <div 
                    onClick={() => handleCardClick('c1', 'Portrait asset screenshot')}
                    className="rounded-2xl bg-cover bg-center border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between p-2.5 h-32 relative group overflow-hidden"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                    <div className="relative z-10 flex justify-end">
                      {copiedId === 'c1' && <Check className="w-3.5 h-3.5 text-amber-400 drop-shadow" />}
                    </div>
                    <div className="relative z-10 flex items-center justify-between text-[9px] text-zinc-300 font-mono">
                      <span>5 min ago</span>
                      <span>3.5 MB</span>
                    </div>
                  </div>

                  {/* CARD 2: Minneapolis Address Snippet */}
                  <div 
                    onClick={() => handleCardClick('c2', 'Minneapolis 55410, 2041 Rocket Drive United States')}
                    className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1a1a20] border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between h-32 group"
                  >
                    <div>
                      <span className="text-[10px] text-zinc-300 font-medium block leading-snug">
                        Minneapolis 55410, 2041 Rocket Drive United States
                      </span>
                    </div>
                    {copiedId === 'c2' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                      <span className="flex items-center gap-1 font-mono text-zinc-400">
                        Chrome
                      </span>
                      <span>19 min ago</span>
                    </div>
                  </div>

                  {/* CARD 3: DopeNotch Curated Apps Bookmark */}
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
                      <span>23 min ago</span>
                    </div>
                  </div>

                  {/* CARD 4: Signature Amber Gold Swatch (#F59E0B) */}
                  <div 
                    onClick={() => handleCardClick('c4', '#F59E0B')}
                    className="p-3 rounded-2xl bg-[#f59e0b] hover:brightness-110 cursor-pointer transition-all flex flex-col justify-between h-32 text-black font-bold shadow-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-extrabold tracking-tight">#F59E0B</span>
                      {copiedId === 'c4' && <Check className="w-4 h-4 text-black" />}
                    </div>
                    <div className="text-[10px] font-bold opacity-90">
                      DopeNotch Gold
                    </div>
                    <div className="text-[9px] opacity-80 font-mono">
                      35 min ago
                    </div>
                  </div>

                  {/* CARD 5: Live Whisper Voice Dictation Clip */}
                  <div 
                    onClick={() => handleCardClick('c5', 'Voice dictation: Summarize key engineering milestones for Q4 launch')}
                    className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1a1a20] border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between group h-32 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-300 leading-tight line-clamp-2">Voice: "Summarize key Q4 milestones"</span>
                      {copiedId === 'c5' && <Check className="w-3.5 h-3.5 text-amber-400" />}
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

                </div>

              </div>
            ) : (
              /* --- STATE 2: COMPACT IDLE DYNAMIC ISLAND NOTCH (Apple iOS / macOS Style) --- */
              <div 
                onClick={toggleNotch}
                className="w-[260px] sm:w-[320px] h-[38px] bg-black text-white rounded-b-[18px] px-3.5 flex items-center justify-between shadow-2xl border-b border-x border-white/10 pointer-events-auto cursor-pointer hover:bg-zinc-950 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 group"
                title="Click to expand DopeNotch Shelf"
              >
                {/* Left: Animated Audio Pulse / Status Dot */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/40 absolute animate-ping"></span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[6, 11, 8, 14, 9].map((h, i) => (
                      <div key={i} className="w-0.5 bg-amber-400 rounded-full animate-pulse" style={{ height: `${h}px` }}></div>
                    ))}
                  </div>
                </div>

                {/* Center: Dynamic Island Prompt */}
                <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 group-hover:text-amber-300 transition-colors">
                  <span>⌥ + Space to Dictate</span>
                </div>

                {/* Right: Expand Hint with Shimmer Icon */}
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-white transition-colors">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono">Shelf</span>
                </div>
              </div>
            )}

            {/* Right Notch Ear SVG (Exact Apple Concave Curve) */}
            <div className="w-5 h-5 flex-none relative overflow-visible -ml-[0.5px]">
              <svg 
                viewBox="0 0 20 20" 
                className="w-5 h-5 fill-black flex-none" 
                aria-hidden="true"
              >
                <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" />
              </svg>
            </div>

          </div>

          {/* Bottom Clear Blur Area (Overlapping the Green Hills with 0 Fake Dock) */}
          <div className="h-14 sm:h-20 pointer-events-none select-none"></div>

        </div>

        {/* FOREGROUND GOLDEN DUNES IMAGE (In Front of the Glass Screen: z-30) */}
        <div className="w-full absolute bottom-0 left-0 right-0 z-30 pointer-events-none select-none flex justify-center items-end overflow-hidden">
          <img 
            src="/foreground_hills.png" 
            alt="DopeNotch Golden Dunes Landscape" 
            className="w-full min-w-[1040px] max-w-[2000px] h-auto object-cover object-bottom translate-y-1 sm:translate-y-3 drop-shadow-2xl" 
          />
        </div>

        {/* Soft Bottom Fade into White Section */}
        <div className="w-full absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-white/80 to-white z-35 pointer-events-none"></div>

      </div>

      {/* CIRCULAR AWARDS BADGES ROW AT BOTTOM OF WALLPAPER (Grounding Layer: z-40) */}
      <div className="w-full bg-white flex justify-center py-6 border-b border-black/5 relative z-40">
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
