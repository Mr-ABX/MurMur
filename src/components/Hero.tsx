import React from 'react';
import { Apple } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 sm:pt-40 pb-12 px-4 flex flex-col items-center text-center supaste-hero-gradient text-white overflow-hidden">
      
      {/* Top Translucent Pill Badge (Screenshot 4/5) */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold mb-8 backdrop-blur-md transition-all shadow-sm">
        <Apple className="w-3.5 h-3.5 fill-white" />
        <span>Speech & Clipboard history</span>
      </div>

      {/* Main Big Headline: Copy once. Reuse anytime. (Instrument Serif Italic) */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.04] mb-6 select-none">
        Speak once.<br />
        <span className="font-serif-italic font-normal text-white">
          Reuse anytime.
        </span>
      </h1>

      {/* Subtitle description (Screenshot 4) */}
      <p className="max-w-2xl text-sm sm:text-base md:text-lg text-white/80 leading-relaxed mb-8 font-normal">
        DopeNotch saves your on-device Whisper voice dictations and clipboard in a beautiful visual history, automatically grouped by type, app, and custom categories, so you can search, find, and paste anything back in seconds.
      </p>

      {/* Download for macOS (Solid Black Pill Button) */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <a 
          href="#pricing"
          className="px-8 py-3.5 rounded-full text-sm font-bold bg-black text-white hover:bg-zinc-900 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2.5"
        >
          <Apple className="w-4 h-4 fill-white" />
          <span>Download for macOS</span>
        </a>

        {/* Micro Trust Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs text-white/60 font-medium">
          <span>One-time purchase</span>
          <span>•</span>
          <span>Fully offline and privacy</span>
          <span>•</span>
          <span>macOS Sonoma 14.0 or later</span>
        </div>
      </div>

    </section>
  );
};
