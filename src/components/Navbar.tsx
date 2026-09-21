import React, { useState } from 'react';
import { Apple, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none select-none">
      {/* 1:1 Hardware Notch Header matching Supaste geometry */}
      <div className="relative flex items-start pointer-events-auto">
        
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

        {/* Center Notch Body */}
        <nav 
          className="bg-black text-white h-[50px] px-5 sm:px-6 rounded-b-[18px] flex items-center gap-6 sm:gap-8 shadow-2xl border-b border-x border-white/10"
          aria-label="Main Navigation"
        >
          {/* Logo (30x30 unboxed with 14px semi-bold text) */}
          <a href="#" className="flex items-center gap-2.5 group flex-none">
            <img 
              src="/logo.png" 
              alt="DopeNotch" 
              className="w-[30px] h-[30px] object-contain drop-shadow" 
            />
            <span className="font-semibold text-[14px] text-white tracking-tight group-hover:text-amber-400 transition-colors">
              DopeNotch
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6 text-[13px] text-white/60 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#workflows" className="hover:text-white transition-colors">Updates</a>
            <a href="#notch-demo" className="hover:text-white transition-colors">Notch Shelf</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          {/* Download Button (Exact Supaste 8px radius pill with Apple icon) */}
          <a 
            href="#pricing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-[12px] font-semibold bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-sm flex-none"
          >
            <Apple className="w-3.5 h-3.5 fill-black" />
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
        </nav>

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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-black/95 backdrop-blur-2xl rounded-2xl p-5 flex flex-col gap-3 md:hidden z-50 border border-white/10 shadow-2xl text-center pointer-events-auto">
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
