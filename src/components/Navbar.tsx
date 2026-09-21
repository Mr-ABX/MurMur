import React, { useState } from 'react';
import { Apple, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none select-none">
      {/* 1:1 Hardware Notch Header with Curved Ears */}
      <div className="relative flex items-start pointer-events-auto">
        
        {/* Left Notch Ear SVG */}
        <svg 
          className="w-5 h-5 text-black -mr-[0.5px] fill-current flex-none" 
          viewBox="0 0 20 20" 
          aria-hidden="true"
        >
          <path d="M0,0 C10,0 20,10 20,20 L20,0 Z" />
        </svg>

        {/* Center Notch Body */}
        <div className="bg-black text-white h-12 px-4 sm:px-6 rounded-b-[22px] flex items-center gap-4 sm:gap-7 shadow-2xl border-b border-x border-white/10">
          
          {/* Bigger Logo without box container (Direct Transparent Squircle) */}
          <a href="#" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="DopeNotch" 
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform drop-shadow-md" 
            />
            <span className="font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-amber-400 transition-colors">
              DopeNotch
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs text-zinc-300 font-medium">
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
            <a href="#workflows" className="hover:text-amber-400 transition-colors">Updates</a>
            <a href="#notch-demo" className="hover:text-amber-400 transition-colors">Notch Shelf</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a>
          </nav>

          {/* Download Button (White pill with Apple icon) */}
          <a 
            href="#pricing"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-md flex-none"
          >
            <Apple className="w-3.5 h-3.5 fill-current" />
            <span>Download</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded text-zinc-400 hover:text-white md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Notch Ear SVG */}
        <svg 
          className="w-5 h-5 text-black -ml-[0.5px] fill-current flex-none" 
          viewBox="0 0 20 20" 
          aria-hidden="true"
        >
          <path d="M20,0 C10,0 0,10 0,20 L0,0 Z" />
        </svg>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-4 right-4 bg-black/95 backdrop-blur-2xl rounded-2xl p-5 flex flex-col gap-3 md:hidden z-50 border border-white/10 shadow-2xl text-center pointer-events-auto">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-amber-400 py-1.5"
          >
            Features
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-amber-400 py-1.5"
          >
            FAQ
          </a>
          <a 
            href="#workflows" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-amber-400 py-1.5"
          >
            Updates
          </a>
          <a 
            href="#notch-demo" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-amber-400 py-1.5"
          >
            Notch Shelf
          </a>
          <a 
            href="#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-amber-400 py-1.5"
          >
            Pricing ($15 Lifetime)
          </a>
        </div>
      )}
    </header>
  );
};
