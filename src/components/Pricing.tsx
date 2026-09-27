import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { AppleLogo } from './AppleLogo';

export const Pricing: React.FC = () => {
  const [devices, setDevices] = useState<1 | 2 | 3>(1);

  const priceMap = {
    1: { price: '$15', oldPrice: '$29', license: '1 device license' },
    2: { price: '$24', oldPrice: '$49', license: '2 devices license' },
    3: { price: '$29', oldPrice: '$59', license: '3 devices license' },
  };

  const current = priceMap[devices];

  return (
    <section id="pricing" className="relative py-28 sm:py-36 px-4 flex flex-col items-center text-center bg-white overflow-hidden select-none">
      
      {/* ─── VIBRANT SKY BLUE ATMOSPHERIC BACKGROUND (1:1 SUPASTE STYLE) ─── */}
      <div 
        className="absolute inset-x-0 top-24 bottom-12 pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #60a5fa 0%, #93c5fd 35%, #dbeafe 65%, #ffffff 100%)',
        }}
        aria-hidden="true"
      />
      
      {/* Soft Top & Bottom Fades for Seamless Transition */}
      <div 
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {/* ─── 1:1 HEADLINE & SUBTITLE ──────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-14 relative z-10">
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-black mb-5 leading-[1.05]">
          One price.<br />
          Lifetime access.
        </h2>
        <p className="text-zinc-700 text-sm sm:text-base font-medium mb-3 leading-relaxed">
          One-time payment. No subscription.<br />
          Get lifetime access to DopeNotch on your Mac.
        </p>
        <p className="text-zinc-500 text-xs max-w-lg mx-auto leading-relaxed">
          Try it risk-free. If DopeNotch doesn't fit your workflow, email us within 14 days and we'll refund your purchase.
        </p>
      </div>

      {/* ─── SIGNATURE NOTCHED WHITE PRICING CARD (1:1 SUPASTE DESIGN) ───── */}
      <div className="w-full max-w-[440px] bg-white rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.14)] p-8 sm:p-10 text-black relative flex flex-col items-center border border-black/5 z-10">
        
        {/* Card's Top Hardware Notch with Seamless Concave Ears */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-start z-20 pointer-events-none">
          {/* Left concave ear */}
          <div className="w-4 h-4 flex-none relative overflow-visible -mr-[0.5px]">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-black flex-none" style={{ transform: 'scaleX(-1)' }} aria-hidden="true">
              <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" />
            </svg>
          </div>
          {/* Black Notch Center Pill */}
          <div className="bg-black text-white h-8 px-4 rounded-b-[16px] flex items-center justify-center gap-2 shadow-md flex-none">
            <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[9px] font-black text-black">
              ⚡
            </div>
            <span className="text-[11px] font-bold tracking-tight">DopeNotch app for macOS</span>
          </div>
          {/* Right concave ear */}
          <div className="w-4 h-4 flex-none relative overflow-visible -ml-[0.5px]">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-black flex-none" aria-hidden="true">
              <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" />
            </svg>
          </div>
        </div>

        {/* ─── Device Selector Segmented Control ──────────────────────────── */}
        <div className="w-full grid grid-cols-3 gap-1.5 p-1 rounded-full bg-[#f4f4f6] border border-black/5 mt-6 mb-7">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setDevices(num as 1 | 2 | 3)}
              className={`py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                devices === num
                  ? 'bg-black text-white shadow-sm scale-[1.02]'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {num} {num === 1 ? 'device' : 'devices'}
            </button>
          ))}
        </div>

        {/* ─── Big Price Display ($15 $29) ────────────────────────────────── */}
        <div className="flex items-baseline justify-center gap-3 mb-5">
          <span className="text-6xl sm:text-7xl font-black text-black tracking-tight">{current.price}</span>
          <span className="text-3xl font-normal text-zinc-300 line-through tracking-normal">{current.oldPrice}</span>
        </div>

        {/* ─── Limited Offer Progress Box ─────────────────────────────────── */}
        <div className="w-full p-3.5 rounded-2xl bg-[#f8f9fa] border border-zinc-200/70 mb-7 text-left flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
            <span>Limited offer for early users 🥳</span>
            <span className="text-[11px] text-zinc-500 font-medium font-sans">5 spots left</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-200/80 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[75%] transition-all duration-500" />
          </div>
        </div>

        {/* ─── Feature Checklist with Rounded Check Circles ───────────────── */}
        <div className="w-full space-y-3.5 text-left text-xs sm:text-[13px] font-medium text-zinc-700 mb-8">
          {[
            'One-time payment',
            '14-day money-back guarantee',
            'Lifetime updates included',
            'All features unlocked from day one',
            'Native macOS app',
            current.license,
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center flex-none text-zinc-500">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* ─── CTA Download for macOS Button ──────────────────────────────── */}
        <a 
          href="#"
          className="w-full py-4 rounded-full text-sm font-bold bg-black text-white hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-xl flex items-center justify-center gap-2"
        >
          <AppleLogo className="w-4 h-4 text-white" />
          <span>Download for macOS</span>
        </a>

      </div>

      {/* ─── SUB-FOOTER REASSURANCE TEXT (1:1 SUPASTE) ─────────────────────── */}
      <p className="text-[11px] text-zinc-500 text-center max-w-md mx-auto mt-7 relative z-10 leading-relaxed font-normal">
        Secure checkout by Polar.sh, powered by Stripe. Prices are in USD, excluding VAT and may vary by location.
      </p>

    </section>
  );
};
