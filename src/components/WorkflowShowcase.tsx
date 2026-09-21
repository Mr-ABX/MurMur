import React, { useState } from 'react';
import { Terminal, PenTool, Code, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

export const WorkflowShowcase: React.FC = () => {
  const [activePersona, setActivePersona] = useState<'dev' | 'designer' | 'writer' | 'founder'>('dev');

  const personas = [
    {
      id: 'dev' as const,
      name: 'Developers',
      icon: Terminal,
      title: 'Dictate PRs, terminal commands & code comments without lifting your hands.',
      description: 'Speak terminal commands, regex queries, and commit messages straight into Cursor, VS Code, iTerm, or Xcode. DopeNotch strips filler words and auto-formats variable names.',
      bullets: [
        'Speak comments & documentation 3x faster than typing',
        'Auto-paste code snippets from the top notch shelf',
        'Save git commands and API keys securely in local vault'
      ],
      sample: '$ git commit -m "feat: integrate on-device whisper voice model"'
    },
    {
      id: 'designer' as const,
      name: 'Designers',
      icon: PenTool,
      title: 'Keep hex colors, SVG icons & design tokens in your top notch shelf.',
      description: 'Click the notch to drag and drop design assets, hex codes, and client feedback right into Figma, Photoshop, and Sketch.',
      bullets: [
        'Instant live preview color swatches (#f59e0b, #ea580c)',
        'Drag SVG code directly into Figma canvas',
        'Dictate design feedback and sprint notes on the fly'
      ],
      sample: 'Color copied: #f59e0b (Brand Amber 500) • RGBA(245, 158, 11, 1)'
    },
    {
      id: 'writer' as const,
      name: 'Writers & Creators',
      icon: Code,
      title: 'Draft articles, scripts & emails with pure stream-of-consciousness dictation.',
      description: 'Speak your thoughts at 180+ WPM without touching the keyboard. Perfect for writing newsletters, documentation, and video scripts in Notion or Obsidian.',
      bullets: [
        'Fluently dictate at 180+ words per minute',
        'Zero cloud latency with local Whisper AI',
        'Save favorite templates and intro hooks in quick shelf'
      ],
      sample: '"DopeNotch completely changed how I write long-form newsletters."'
    },
    {
      id: 'founder' as const,
      name: 'Founders & Operators',
      icon: Briefcase,
      title: 'Fast customer replies, investor updates, and meeting notes.',
      description: 'Keep your best replies, pitch snippets, and email templates pinned in the top notch, ready to paste in 1 keystroke.',
      bullets: [
        'Answer customer support inquiries in seconds',
        'Dictate meeting recaps immediately after Zoom calls',
        '100% offline privacy for confidential company data'
      ],
      sample: 'Template: "Thanks for checking out DopeNotch! Here is your download link."'
    }
  ];

  const current = personas.find(p => p.id === activePersona) || personas[0];

  return (
    <section id="workflows" className="py-20 px-4 max-w-6xl mx-auto border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Workflows & Use Cases
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Supercharge Your Daily <span className="font-serif-italic font-normal text-amber-400">Flow</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Whether you're writing code, designing interfaces, or drafting high-stakes emails, DopeNotch adapts to how you work.
        </p>

        {/* Persona Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-2xl glass-card max-w-xl mx-auto">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Persona Card */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/10">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Optimized for {current.name}</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            {current.title}
          </h3>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            {current.description}
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            {current.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-none" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Snippet Box */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">dopenotch-output.txt</span>
          </div>

          <div className="py-6">
            <span className="text-[11px] font-mono text-zinc-400 block mb-2">Live Result:</span>
            <p className="text-xs sm:text-sm font-mono text-amber-300 leading-relaxed bg-[#121217] p-3 rounded-xl border border-white/5">
              {current.sample}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5">
            <span>Latency: <strong>&lt;70ms</strong></span>
            <span className="text-amber-400 font-semibold">100% On-Device</span>
          </div>
        </div>
      </div>
    </section>
  );
};
