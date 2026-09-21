import React, { useState } from 'react';
import { Apple, Check } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [devices, setDevices] = useState<1 | 2 | 3>(1);

  const priceMap = {
    1: { price: '$15', oldPrice: '$29', license: '1 device license' },
    2: { price: '$24', oldPrice: '$49', license: '2 devices license' },
    3: { price: '$29', oldPrice: '$59', license: '3 devices license' },
  };

  const current = priceMap[devices];

  return (
    <section id="pricing" className="supaste-pricing-gradient py-28 px-4 flex flex-col items-center text-center text-white relative">
      
      {/* 1:1 Headline & Subtitle (Screenshot 3) */}
      <div className="max-w-2xl mx-auto mb-14">
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          One price.<br />
          Lifetime access.
        </h2>
        <p className="text-white/90 text-sm sm:text-base font-medium mb-2">
          One-time payment. No subscription.<br />
          Get lifetime access to DopeNotch on your Mac.
        </p>
        <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed">
          Try it risk-free. If DopeNotch doesn't fit your workflow, email us within 14 days and we'll refund your purchase.
        </p>
      </div>

      {/* SIGNATURE NOTCHED WHITE PRICING CARD (Screenshot 3) */}
      <div className="w-full max-w-md bg-white rounded-[36px] shadow-2xl p-7 sm:p-9 text-black relative flex flex-col items-center border border-white/40">
        
        {/* Card's Top Hardware Notch Cutout */}
        <div className="w-48 h-8 bg-black rounded-b-2xl absolute -top-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 text-white text-[11px] font-bold shadow-md">
          <div className="w-3.5 h-3.5 rounded-md overflow-hidden border border-white/20">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span>DopeNotch app for macOS</span>
        </div>

        {/* Device Selector Tabs */}
        <div className="w-full grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#f5f5f7] border border-black/5 mt-9 mb-6">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setDevices(num as 1 | 2 | 3)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                devices === num
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-500 hover:text-black'
              }`}
            >
              {num} {num === 1 ? 'device' : 'devices'}
            </button>
          ))}
        </div>

        {/* Big Price Display ($15 $29) */}
        <div className="flex items-baseline justify-center gap-3 mb-4">
          <span className="text-6xl font-black text-black tracking-tight">{current.price}</span>
          <span className="text-2xl font-bold text-zinc-300 line-through">{current.oldPrice}</span>
        </div>

        {/* Limited Offer Progress Box */}
        <div className="w-full p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/5 mb-6 text-left flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
            <span>Limited offer for early users 🥳</span>
            <span className="text-[11px] text-zinc-400 font-mono">5 spots left</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full w-[85%]"></div>
          </div>
        </div>

        {/* Checklist with Circular Checkmarks (1:1 Screenshot 3) */}
        <div className="w-full space-y-3 text-left text-xs font-medium text-zinc-700 mb-8">
          {[
            'One-time payment',
            '14-day money-back guarantee',
            'Lifetime updates included',
            'All features unlocked from day one',
            'Native macOS app (Sonoma & Sequoia)',
            current.license,
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#f5f5f7] border border-zinc-300 flex items-center justify-center flex-none text-zinc-600">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Download for macOS Button */}
        <a 
          href="#"
          className="w-full py-4 rounded-full text-xs sm:text-sm font-bold bg-black text-white hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
        >
          <Apple className="w-4 h-4 fill-white" />
          <span>Download for macOS</span>
        </a>

      </div>

    </section>
  );
};
