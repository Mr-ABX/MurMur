import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const leftColumnFaqs = [
    {
      q: 'What is DopeNotch?',
      a: 'DopeNotch is an ultra-fast on-device speech-to-text dictation and clipboard shelf for macOS. It merges sub-80ms local Whisper AI with a hardware-anchored dynamic notch shelf, letting you dictate anywhere and access copied clips with zero cloud dependency.'
    },
    {
      q: 'Does DopeNotch support iCloud Sync?',
      a: 'Yes! You can choose to keep your clipboard history, custom categories, and saved snippets seamlessly synced across your MacBook, Mac Studio, and other Mac devices via your private Apple iCloud account.'
    },
    {
      q: 'Where is my clipboard history stored?',
      a: 'Everything is stored 100% locally in your Mac NVMe storage (`~/Library/Application Support/DopeNotch`). Zero audio recordings or text snippets are ever sent to external cloud servers.'
    },
    {
      q: 'Does DopeNotch upload my copied content?',
      a: 'Never. DopeNotch is built with a strict offline-first architecture. All speech recognition and text processing happen on your local Apple Silicon Neural Engine without internet required.'
    },
    {
      q: 'What types of content does DopeNotch support?',
      a: 'DopeNotch supports voice recordings, rich text, code snippets with syntax detection, colors/hex codes, URLs, screenshots, images with OCR text extraction, and file attachments.'
    },
    {
      q: 'Can I search my clipboard history?',
      a: 'Yes. With instant fuzzy search and global shortcuts, you can search thousands of previous clips, voice memos, and code snippets in milliseconds using keywords or app filters.'
    }
  ];

  const rightColumnFaqs = [
    {
      q: 'Can DopeNotch detect sensitive content?',
      a: 'Yes. DopeNotch includes automatic sensitive data filters that recognize passwords from password managers (1Password, Bitwarden), credit cards, and confidential tokens to prevent unwanted storage.'
    },
    {
      q: 'What does a 1 Device license mean?',
      a: 'A 1 Device license allows you to activate DopeNotch on one Mac with lifetime updates included. You can upgrade to 2 or 3 device licenses at any time from your account dashboard.'
    },
    {
      q: 'Can I pause clipboard capture?',
      a: 'Yes. You can pause clipboard monitoring or voice listening at any moment with a single click from the notch menu or by setting auto-pause for specific applications.'
    },
    {
      q: 'Does DopeNotch include screenshot history?',
      a: 'Yes! Screenshots taken on your Mac are automatically organized in the Notch Shelf with built-in instant image preview, OCR text recognition, and quick drag-and-drop sharing.'
    },
    {
      q: 'Is DopeNotch a subscription?',
      a: 'No. DopeNotch is a one-time payment for lifetime access. You get all future features, performance improvements, and macOS compatibility updates with no recurring fees.'
    },
    {
      q: 'How do I get the app after purchase?',
      a: 'Immediately upon checkout via Polar/Stripe, you will receive a direct DMG download link and your lifetime license key via email to activate on your Mac in seconds.'
    }
  ];

  const allFaqs = [
    ...leftColumnFaqs.map((f, i) => ({ ...f, id: i * 2 })),
    ...rightColumnFaqs.map((f, i) => ({ ...f, id: i * 2 + 1 }))
  ].sort((a, b) => a.id - b.id);

  const toggleItem = (id: number) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section id="faq" className="bg-white text-black py-24 sm:py-32 px-4 flex flex-col items-center select-none">
      
      {/* ─── 1:1 SECTION HEADER (SUPASTE STYLE) ─────────────────────────── */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-black mb-4">
          Frequently Asked<br />Questions
        </h2>
        <p className="text-zinc-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Everything you need to know before getting started with DopeNotch, from privacy and compatibility to how your voice dictations and clipboard history are stored and handled.
        </p>
      </div>

      {/* ─── 1:1 2-COLUMN FAQ PILL GRID (SUPASTE STYLE) ───────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-3.5">
          {leftColumnFaqs.map((item, idx) => {
            const itemId = idx * 2;
            const isOpen = openIndex === itemId;
            return (
              <div
                key={itemId}
                className={`rounded-2xl transition-all duration-200 border border-black/5 overflow-hidden ${
                  isOpen ? 'bg-[#f0f0f2] shadow-sm' : 'bg-[#f5f5f7] hover:bg-[#ededf0]'
                }`}
              >
                <button
                  onClick={() => toggleItem(itemId)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white border border-black/10 flex items-center justify-center flex-none text-zinc-600 group-hover:text-black transition-colors shadow-xs">
                      {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-black">
                      {item.q}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed pl-12 border-t border-black/5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-3.5">
          {rightColumnFaqs.map((item, idx) => {
            const itemId = idx * 2 + 1;
            const isOpen = openIndex === itemId;
            return (
              <div
                key={itemId}
                className={`rounded-2xl transition-all duration-200 border border-black/5 overflow-hidden ${
                  isOpen ? 'bg-[#f0f0f2] shadow-sm' : 'bg-[#f5f5f7] hover:bg-[#ededf0]'
                }`}
              >
                <button
                  onClick={() => toggleItem(itemId)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white border border-black/10 flex items-center justify-center flex-none text-zinc-600 group-hover:text-black transition-colors shadow-xs">
                      {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-black">
                      {item.q}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed pl-12 border-t border-black/5">
                    {item.a}
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
