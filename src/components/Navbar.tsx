import React, { useState, useEffect } from 'react';
import { Apple, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-4">
      {/* 1:1 Supaste Floating Notch Navbar */}
      <div className={`floating-notch-nav rounded-full px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-8 transition-all duration-300 max-w-fit shadow-2xl ${
        scrolled ? 'scale-95' : 'scale-100'
      }`}>
        
        {/* Brand & Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden border border-white/20 flex-none shadow-sm">
            <img src="/logo.jpg" alt="DopeNotch" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
            DopeNotch
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#workflows" className="hover:text-white transition-colors">Workflows</a>
          <a href="#notch-demo" className="hover:text-white transition-colors">Notch Shelf</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        {/* Action Button: White Pill with Apple Icon */}
        <div className="flex items-center gap-2">
          <a 
            href="#pricing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Apple className="w-3.5 h-3.5 fill-black" />
            <span>Download</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-black/95 backdrop-blur-2xl rounded-2xl p-5 flex flex-col gap-3 md:hidden z-50 border border-white/10 shadow-2xl text-center">
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
            Workflows
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
