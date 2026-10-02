import React from 'react';
import { Paintbrush, Code2, PenLine, MessageSquare, Laptop, User } from 'lucide-react';

interface AudienceCard {
  icon: React.ElementType;
  title: string;
  description: string;
}

const audienceData: AudienceCard[] = [
  {
    icon: Paintbrush,
    title: 'Designers',
    description: 'Keep colors, icons, screenshots, SVGs, gradients, visual references, and assets close at hand in a beautiful searchable shelf.',
  },
  {
    icon: Code2,
    title: 'Developers',
    description: 'Save code snippets, commands, errors, JSON, API responses, and GitHub links automatically, then find and paste them back whenever you need them.',
  },
  {
    icon: PenLine,
    title: 'Content and Marketing',
    description: 'Capture hooks, taglines, SEO keywords, drafts, research links, screenshots, and campaign ideas before they disappear from your clipboard.',
  },
  {
    icon: MessageSquare,
    title: 'Sales and Support',
    description: 'Reuse your best replies, email templates, product links, customer notes, and support screenshots without digging through old conversations.',
  },
  {
    icon: Laptop,
    title: 'Founders and Operators',
    description: 'Organize investor notes, product ideas, competitor screenshots, pricing pages, links, and daily research in one visual history.',
  },
  {
    icon: User,
    title: 'Personal Use',
    description: 'Find copied links, addresses, tracking numbers, images, screenshots, recipes, quotes, and anything else you meant to save.',
  },
];

export const AudienceShowcase: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white flex flex-col items-center select-none">
      <div className="max-w-6xl w-full mx-auto">
        
        {/* ─── SECTION HEADER (1:1 SUPASTE TYPOGRAPHY) ────────────────────── */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111113] mb-5 leading-[1.08]">
            Built for everything you copy
          </h2>
          <p className="text-[#6e6e73] text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            From code snippets and design assets to customer replies, screenshots, links, and personal notes, DopeNotch keeps every useful piece of your clipboard organized and ready to reuse.
          </p>
        </div>

        {/* ─── 3x2 CARDS GRID (1:1 SUPASTE #f7f7f7 CARDS) ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {audienceData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#f7f7f7] rounded-[30px] p-8 sm:p-10 flex flex-col items-start text-left border border-black/[0.03] hover:border-black/[0.08] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] group"
              >
                {/* 1:1 Fav Icon Container (White Rounded Pill / Glass) */}
                <div className="w-12 h-12 rounded-[20px] bg-white shadow-xs border border-black/[0.04] flex items-center justify-center text-[#111113] mb-6 group-hover:scale-105 group-hover:border-amber-400/40 transition-transform">
                  <Icon className="w-5 h-5 stroke-[2] text-[#111113]" />
                </div>

                {/* Card Title */}
                <h3 className="text-2xl font-bold tracking-tight text-[#111113] mb-3">
                  {item.title}
                </h3>

                {/* Card Description */}
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#6e6e73] font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
