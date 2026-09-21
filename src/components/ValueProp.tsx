import React from 'react';
import { Cloud, Sparkles, Shield, Lock, Search, Camera, FileText, Layers, Filter, Zap, EyeOff, Folder } from 'lucide-react';

export const ValueProp: React.FC = () => {
  const pills = [
    { label: 'iCloud Sync', icon: Cloud, color: 'text-blue-500' },
    { label: 'Apple Intelligence', icon: Sparkles, color: 'text-orange-500' },
    { label: 'Local first', icon: Shield, color: 'text-zinc-700' },
    { label: 'Privacy first', icon: Lock, color: 'text-zinc-700' },
    { label: 'Search anything', icon: Search, color: 'text-zinc-700' },
    { label: 'Screenshots', icon: Camera, color: 'text-zinc-700' },
    { label: 'Screenshot & image OCR', icon: FileText, color: 'text-zinc-700' },
    { label: 'Grouped by App', icon: Layers, color: 'text-zinc-700' },
    { label: 'Type filters', icon: Filter, color: 'text-zinc-700' },
    { label: 'Smart Filter', icon: Zap, color: 'text-amber-500' },
    { label: 'Sensitive detection', icon: EyeOff, color: 'text-zinc-700' },
    { label: 'Custom categories', icon: Folder, color: 'text-zinc-700' },
  ];

  return (
    <section className="bg-white text-black py-24 px-4 flex flex-col items-center text-center">
      
      {/* 1:1 Title & Subtitle (Screenshot 2) */}
      <div className="max-w-3xl mx-auto mb-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-black mb-4">
          Your clipboard, wherever you need it
        </h2>
        <p className="text-zinc-500 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
          Use the notch shelf, quick search, inline paste, drag and drop, and the full Library view to find, reuse, and organize anything you copied.
        </p>
      </div>

      {/* 12 Pill Badges Grid (1:1 Screenshot 2) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-16">
        {pills.map((pill, idx) => {
          const Icon = pill.icon;
          return (
            <div 
              key={idx}
              className="light-badge-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-default"
            >
              <Icon className={`w-3.5 h-3.5 ${pill.color}`} />
              <span>{pill.label}</span>
            </div>
          );
        })}
      </div>

      {/* Light Gray Rounded Feature Card Container (Screenshot 2) */}
      <div className="w-full max-w-5xl rounded-[32px] bg-[#f5f5f7] border border-black/5 p-8 sm:p-14 text-center flex flex-col items-center">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black mb-4">
          Smarter, Faster, and Connected Across Your Mac
        </h3>
        <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-8">
          Keep your clipboard synced with iCloud, automatically organize clips with Smart Auto-Filter, and transcribe speech instantly using on-device Whisper AI.
        </p>

        {/* Apple-style Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left pt-4">
          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
            <span className="text-2xl mb-3 block">⚡</span>
            <h4 className="text-base font-bold text-black mb-1">Sub-80ms Whisper AI</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Real-time on-device voice dictation running entirely on your Mac's Apple Silicon GPU.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
            <span className="text-2xl mb-3 block">🏝️</span>
            <h4 className="text-base font-bold text-black mb-1">1:1 Dynamic Notch</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Hardware-sized 170×32 notch cutout that never intercepts clicks on browser tabs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
            <span className="text-2xl mb-3 block">🔒</span>
            <h4 className="text-base font-bold text-black mb-1">100% Offline & Private</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Zero cloud APIs, zero telemetries, and zero data leaves your local NVMe storage.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};
