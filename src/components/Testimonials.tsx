import React from 'react';
import { Sparkles, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Alex Rivera',
      role: 'Staff Engineer & Open Source Creator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: "I've tried almost every voice dictation tool and clipboard manager on Mac. DopeNotch is the first one that feels like native Apple hardware. The <80ms Whisper inference is instantaneous, and having colors and snippets right in the notch shelf saves me hours every week.",
      rating: 5
    },
    {
      name: 'Elena Rostova',
      role: 'Design Director & Agency Founder',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      content: "The zero-interference notch design is genius. Other notch apps constantly intercepted clicks when I was switching tabs in Safari or Figma. DopeNotch only expands when I ask it to, and the amber design aesthetic is simply gorgeous.",
      rating: 5
    },
    {
      name: 'Marcus Chen',
      role: 'Product Lead & Technical Writer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: "The on-device privacy is the real game changer for me. Being able to dictate confidential client notes without worrying about audio recordings sent to cloud servers is worth 10x the one-time $15 price.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Loved by Mac Power Users
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Real Stories from <span className="font-serif-italic font-normal text-amber-400">Creators</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Join thousands of developers, designers, and operators boosting their daily output with DopeNotch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-8 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform">
            <Quote className="w-8 h-8 text-amber-500/20 mb-4" />
            
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6 font-normal">
              "{t.content}"
            </p>

            <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
              <img 
                src={t.avatar} 
                alt={t.name} 
                className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
              />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{t.name}</h4>
                <p className="text-[11px] text-zinc-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
