import React, { useState } from 'react';
import { Apple, Search, Star, LayoutGrid, Maximize2, Mic, Check, Volume2, Plus } from 'lucide-react';

export const InteractiveNotchDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('History');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);

  const handleCardClick = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1800);
  };

  return (
    <div id="notch-demo" className="w-full supaste-hero-gradient pb-20 px-4 flex justify-center">
      
      {/* Mac Viewport Frame with Sonoma Landscape Wallpaper */}
      <div className="w-full max-w-5xl rounded-[32px] overflow-hidden border border-white/20 shadow-2xl shadow-black/60 relative aspect-[16/10] sm:aspect-[16/9] flex flex-col justify-between bg-cover bg-center" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85')`
      }}>
        
        {/* Frosted Atmospheric Blur Overlay over Wallpaper */}
        <div className="absolute inset-0 bg-sky-900/10 backdrop-blur-[2px] pointer-events-none"></div>

        {/* TOP DYNAMIC NOTCH SHELF (1:1 Screenshot 4/5) */}
        <div className="relative z-20 flex justify-center w-full">
          
          {/* Main Black Notch Container */}
          <div className="w-[96%] sm:w-[88%] md:w-[82%] bg-black text-white rounded-b-[28px] p-4 sm:p-5 shadow-2xl border-b border-x border-white/10 flex flex-col gap-3.5 transition-all">
            
            {/* Shelf Top Row: Logo, Search, Tabs, Meta icons */}
            <div className="flex items-center justify-between gap-3 text-xs">
              
              {/* Left: Apple / Logo + Search Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-bold text-white tracking-tight">
                  <Apple className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">DopeNotch</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 text-[11px] w-28 sm:w-36">
                  <Search className="w-3 h-3 text-zinc-500" />
                  <span>Search...</span>
                </div>
              </div>

              {/* Center: Tabs with Count Badges */}
              <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {[
                  { name: 'History', count: 24 },
                  { name: 'Prompts', count: 24 },
                  { name: 'Colors', count: 24 },
                  { name: 'Assets', count: 24 },
                  { name: 'Inspirations', count: 24 },
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all ${
                      activeTab === tab.name 
                        ? 'bg-white text-black font-semibold shadow-sm' 
                        : 'text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{tab.name}</span>
                    <span className={`text-[9px] ${activeTab === tab.name ? 'text-zinc-500' : 'text-zinc-500'}`}>{tab.count}</span>
                  </button>
                ))}
                <button className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Right: Actions + 09:41 Clock */}
              <div className="flex items-center gap-2.5 text-zinc-400 text-xs">
                <button 
                  onClick={() => setIsDictating(!isDictating)}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                    isDictating ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span className="hidden sm:inline">{isDictating ? 'Speaking...' : 'Simulate ⌥ Space'}</span>
                </button>
                <Star className="w-3.5 h-3.5 hover:text-white cursor-pointer hidden sm:block" />
                <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer hidden sm:block" />
                <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer hidden sm:block" />
                <span className="font-semibold text-white font-mono text-[11px] ml-1">09:41</span>
              </div>
            </div>

            {/* Shelf Items Grid (Screenshot 4 & 5 exact layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
              
              {/* CARD 1: Voice Dictation Live Widget */}
              <div 
                onClick={() => handleCardClick('c1', 'DopeNotch speech dictation model loaded into RAM with <80ms greedy search.')}
                className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1c1c22] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between group h-32 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400 line-clamp-1">Voice dictation widget</span>
                  {copiedText === 'c1' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                
                <div className="p-2 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[8, 16, 12, 20, 10].map((h, i) => (
                      <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${h}px` }}></div>
                    ))}
                  </div>
                  <Volume2 className="w-3 h-3 text-amber-400" />
                </div>

                <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 23 min ago
                  </span>
                </div>
              </div>

              {/* CARD 2: Portrait Image Preview */}
              <div 
                onClick={() => handleCardClick('c2', 'Image preview copied')}
                className="rounded-2xl bg-cover bg-center border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between p-2.5 h-32 relative group overflow-hidden"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="relative z-10 flex justify-end">
                  {copiedText === 'c2' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="relative z-10 flex items-center justify-between text-[9px] text-zinc-300 font-mono">
                  <span>5 min ago</span>
                  <span>3.5 MB</span>
                </div>
              </div>

              {/* CARD 3: Retro Mac Illustration Card */}
              <div 
                onClick={() => handleCardClick('c3', 'A curated shelf of on-device Whisper voice tools for macOS.')}
                className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1c1c22] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between h-32 group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-zinc-300 line-clamp-2">
                    A curated shelf of on-device macOS apps.
                  </p>
                  {copiedText === 'c3' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-black">
                  
                </div>
                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                  <span>23 min ago</span>
                </div>
              </div>

              {/* CARD 4: Text Address Snippet */}
              <div 
                onClick={() => handleCardClick('c4', 'Minneapolis 55410, 2041 Rocket Drive United States')}
                className="p-3 rounded-2xl bg-[#141419] hover:bg-[#1c1c22] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between h-32 group"
              >
                <div>
                  <span className="text-[10px] text-zinc-400 font-medium block leading-snug">
                    Minneapolis 55410, 2041 Rocket Drive United States
                  </span>
                </div>
                {copiedText === 'c4' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> 19 min ago
                  </span>
                </div>
              </div>

              {/* CARD 5: Color Swatch Card */}
              <div 
                onClick={() => handleCardClick('c5', '#F59E0B')}
                className="p-3 rounded-2xl bg-[#f59e0b] hover:brightness-110 cursor-pointer transition-all flex flex-col justify-between h-32 text-black font-bold shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-extrabold tracking-tight">#F59E0B</span>
                  {copiedText === 'c5' && <Check className="w-4 h-4 text-black" />}
                </div>
                <div className="text-[10px] font-medium opacity-80">
                  Amber Brand 500
                </div>
                <div className="text-[9px] opacity-70 font-mono">
                  35 min ago
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Dock Simulation inside Mac screen */}
        <div className="relative z-10 flex justify-center pb-4 select-none">
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl flex items-center gap-3">
            {['finder', 'launchpad', 'safari', 'messages', 'mail', 'calendar', 'music', 'appstore', 'settings'].map((item, idx) => (
              <div key={idx} className="w-8 h-8 rounded-xl bg-white/40 border border-white/30 shadow-sm hover:scale-125 transition-transform cursor-pointer"></div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
