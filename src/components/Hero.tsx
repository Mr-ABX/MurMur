import React from 'react';
import { Apple } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 sm:pt-32 pb-8 px-4 flex flex-col items-center text-center supaste-hero-sky text-white overflow-hidden select-none">
      
      {/* Top Translucent Pill Badge (1:1 Screenshot 2 & 4) */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold mb-6 backdrop-blur-md transition-all shadow-sm">
        <Apple className="w-3.5 h-3.5 fill-white" />
        <span>Clipboard history</span>
      </div>

      {/* Main Big Headline: Copy once. Reuse anytime. (Instrument Serif Italic) */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.05] mb-5">
        Copy once.<br />
        <span className="font-serif-italic font-normal text-white">
          Reuse anytime.
        </span>
      </h1>

      {/* Subtitle description (Screenshot 4) */}
      <p className="max-w-2xl text-xs sm:text-sm md:text-base text-white/85 leading-relaxed mb-7 font-normal px-4">
        Supaste saves your clipboard and screenshots in a beautiful visual history, automatically grouped by type, app, and custom categories, so you can search, find, and paste anything back in seconds.
      </p>

      {/* Download for macOS (Solid Black Pill Button) */}
      <div className="flex flex-col items-center gap-3.5 mb-4">
        <a 
          href="#pricing"
          className="px-7 py-3 rounded-full text-xs sm:text-sm font-bold bg-black text-white hover:bg-zinc-900 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2.5"
        >
          <Apple className="w-4 h-4 fill-white" />
          <span>Download for macOS</span>
        </a>

        {/* Micro Trust Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-white/60 font-medium">
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
