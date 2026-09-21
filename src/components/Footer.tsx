import React from 'react';
import { Apple, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black text-white pt-0 pb-16 overflow-hidden select-none">
      
      {/* 1:1 NOTCH SEPARATOR FROM SUPASTE (media_1789954748879.png) */}
      <div className="w-full overflow-hidden leading-none relative -top-px">
        <svg 
          viewBox="0 0 1000 50" 
          className="w-full h-9 sm:h-12 block" 
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Top section white background */}
          <rect width="1000" height="50" fill="white" />
          {/* Black footer notch path dipping down into center bay */}
          <path 
            d="M 0,50 L 0,10 L 160,10 C 185,10 185,42 210,42 L 790,42 C 815,42 815,10 840,10 L 1000,10 L 1000,50 Z" 
            fill="black" 
          />
        </svg>
      </div>

      {/* Main Footer Container */}
      <div className="max-w-6xl mx-auto px-6 pt-12 sm:pt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
          
          {/* Left Column (Logo, Headline, Description, Download Button) */}
          <div className="lg:col-span-6 flex flex-col items-start gap-5">
            {/* Direct Transparent Squircle Logo - Bigger, No Container Box */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="DopeNotch" 
                className="w-10 h-10 object-contain drop-shadow-md" 
              />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base text-white tracking-tight">DopeNotch</span>
                <span className="text-[11px] text-zinc-500">macOS app</span>
              </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Speak once.<br />
              <span className="font-serif-italic font-normal text-white">
                Reuse anytime.
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
              DopeNotch saves your on-device Whisper voice dictations and clipboard in a beautiful visual history, automatically grouped by type, app, and custom categories, so you can search, find, and paste anything back in seconds.
            </p>

            <a 
              href="#pricing"
              className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <Apple className="w-4 h-4 fill-black" />
              <span>Download for macOS</span>
            </a>

            <div className="text-[11px] text-zinc-500 pt-3">
              <p>© {new Date().getFullYear()} DopeNotch.com - All rights reserved</p>
              <p className="flex items-center gap-1 mt-1 text-zinc-400">
                Built with <Heart className="w-3 h-3 text-amber-500 fill-amber-500 inline" /> by ABX
              </p>
            </div>
          </div>

          {/* Right Columns: Menu, Navigation, More products (1:1 Screenshot 1) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Column 1: Menu */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">Menu</span>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Home</a>
              <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#faq" className="text-zinc-400 hover:text-white transition-colors">FAQ</a>
              <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="#workflows" className="text-zinc-400 hover:text-white transition-colors">Updates</a>
            </div>

            {/* Column 2: Navigation */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">Navigation</span>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Roadmap</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy policy</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Terms of service</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Customer portal</a>
            </div>

            {/* Column 3: More Products */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider">More products</span>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Screen Movie</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Cooldock</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Macapp.Supply</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Runey.app</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Revone.app</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Icoon.co</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Selected.site</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Supaframe.io</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">Frameblox.com</a>
            </div>

          </div>

        </div>
      </div>

      {/* GIGANTIC SUBTLE WATERMARK LOGO AT BOTTOM (1:1 Screenshot 1) */}
      <div className="w-full flex justify-center overflow-hidden select-none pointer-events-none opacity-20 -mb-10 sm:-mb-16">
        <span className="text-[14vw] font-black text-zinc-800 tracking-tighter leading-none">
          Dopenotch
        </span>
      </div>

    </footer>
  );
};
