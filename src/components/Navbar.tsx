import React, { useState } from 'react';
import { Apple, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none select-none">
      {/* 1:1 Supaste Hardware Notch Header with Curved Ears (Image 1) */}
      <div className="relative flex items-start pointer-events-auto">
        
        {/* Left Notch Ear SVG (concave curve connecting top ceiling into left notch wall) */}
        <svg 
          className="w-5 h-5 text-black -mr-[0.5px] fill-current flex-none" 
          viewBox="0 0 20 20" 
          aria-hidden="true"
        >
          <path d="M0,0 C10,0 20,10 20,20 L20,0 Z" />
        </svg>

        {/* Center Notch Body */}
        <div className="bg-black text-white h-11 px-4 sm:px-6 rounded-b-[20px] flex items-center gap-4 sm:gap-7 shadow-2xl">
          
          {/* Logo & Brand Name */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-white/20 flex-none shadow-sm group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="DopeNotch" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
              DopeNotch
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs text-zinc-300 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#workflows" className="hover:text-white transition-colors">Updates</a>
            <a href="#notch-demo" className="hover:text-white transition-colors">Notch Shelf</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* White Pill Download Button */}
          <a 
            href="#pricing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-md flex-none"
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
        </div>

        {/* Right Notch Ear SVG (concave curve connecting right notch wall into top ceiling) */}
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
        <div className="absolute top-12 left-4 right-4 bg-black/95 backdrop-blur-2xl rounded-2xl p-5 flex flex-col gap-3 md:hidden z-50 border border-white/10 shadow-2xl text-center pointer-events-auto">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-white py-1.5"
          >
            Features
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-white py-1.5"
          >
            FAQ
          </a>
          <a 
            href="#workflows" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-white py-1.5"
          >
            Updates
          </a>
          <a 
            href="#notch-demo" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-white py-1.5"
          >
            Notch Shelf
          </a>
          <a 
            href="#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-semibold text-zinc-200 hover:text-white py-1.5"
          >
            Pricing ($15 Lifetime)
          </a>
        </div>
      )}
    </header>
  );
};
