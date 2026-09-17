import React from 'react';
import { Sparkle, CheckCircle2 } from 'lucide-react';

export const ChangelogView: React.FC = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      <div>
        <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-emerald-400" /> What's New in Liquid Voice
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Recent architecture updates, performance improvements, and model enhancements.
        </p>
      </div>

      <div className="p-6 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-5">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#ededed]">Version 0.4.0 (Vercel Slate Refresh)</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Latest
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">September 2026</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-semibold text-[#ededed]">Vercel Minimalist Design System</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Stark slate black and white typography, zero glitter or heavy neon glows, high-contrast readability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-semibold text-[#ededed]">Local On-Device Whisper by Default</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                100% offline, private speech recognition running directly on CPU/Metal with zero API keys required.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-semibold text-[#ededed]">1:1 FluidVoice Dynamic Island (Notch)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compact 330px top bezel dock with 7 bouncing equalizer bars and live streaming recognized speech.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-semibold text-[#ededed]">Full Draggable Window & Native Traffic Lights</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Smooth titlebar dragging anywhere across the window, macOS native buttons with traffic-light clearance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
