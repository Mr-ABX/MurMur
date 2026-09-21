import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is DopeNotch?',
      a: 'DopeNotch is a local-first speech-to-text dictation and clipboard history app for Mac. It merges sub-80ms on-device Whisper AI with a 1:1 hardware dynamic notch shelf, letting you speak directly into any application or access copied links, code, colors, and notes from the top of your screen.'
    },
    {
      q: 'Where is my voice and clipboard history stored?',
      a: 'Everything is stored 100% locally on your Mac (`~/Library/Application Support/Murmur` or `~/Library/Application Support/DopeNotch`). Zero audio recordings, transcribed texts, or clipboard items are ever uploaded to cloud servers.'
    },
    {
      q: 'Does DopeNotch block clicks near the top of my screen?',
      a: 'No. When idle, DopeNotch resizes its native NSWindow strictly to physical hardware notch dimensions (170px × 32px), completely eliminating invisible click-blocking over Safari tabs, Chrome tabs, and menu items.'
    },
    {
      q: 'Can I customize the hotkeys and global speech shortcuts?',
      a: 'Yes! DopeNotch has a built-in key combination recorder in Preferences. You can easily set Option+Space (default), Control+Option+Space, or any combination of modifier and letter keys.'
    },
    {
      q: 'Is DopeNotch a recurring subscription?',
      a: 'No. DopeNotch is a one-time purchase with lifetime access. All future updates and improvements on macOS are included for free.'
    },
    {
      q: 'What is the refund policy?',
      a: 'We offer a full 14-day money-back guarantee. If DopeNotch does not elevate your daily workflow, reach out within 14 days for a 100% full refund.'
    }
  ];

  return (
    <section id="faq" className="bg-white text-black py-24 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base">
            Everything you need to know before getting started with DopeNotch.
          </p>
        </div>

        {/* Accordion Cards (Apple Style Light Cards) */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#f5f5f7] border border-black/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 group"
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-black">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 group-hover:text-black transition-transform duration-200 flex-none ${isOpen ? 'rotate-180 text-black' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-black/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
