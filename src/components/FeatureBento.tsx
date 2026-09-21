import React from 'react';
import { Mic, Layers, Keyboard, Palette, CheckCircle2 } from 'lucide-react';

export const FeatureBento: React.FC = () => {
  return (
    <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Engineered for Speed & Privacy
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Built for Everything You <span className="font-serif-italic font-normal text-amber-400">Speak & Copy</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          From instantaneous voice transcription to a categorized visual clipboard shelf, DopeNotch replaces multiple clunky utilities with one seamless native Mac experience.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: On-Device Whisper AI (Spans 2 columns) */}
        <div className="md:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Local Inference Engine</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-3">
              On-Device Whisper AI with &lt;80ms Latency
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-lg mb-6">
              Powered by optimized C++ GGML kernels with Apple Silicon Metal acceleration. Transcribe fluent speech into clean formatted text completely offline with zero cloud API keys, zero rate limits, and zero recurring fees.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Model</span>
                <p className="text-xs font-bold text-white">GGML Base.en</p>
                <span className="text-[10px] text-amber-400">147 MB</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Speed</span>
                <p className="text-xs font-bold text-white">&lt;80ms Greedy</p>
                <span className="text-[10px] text-amber-400">Real-time</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Privacy</span>
                <p className="text-xs font-bold text-white">100% Offline</p>
                <span className="text-[10px] text-amber-400">Zero Cloud</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Hardware</span>
                <p className="text-xs font-bold text-white">Metal GPU</p>
                <span className="text-[10px] text-amber-400">M1/M2/M3/M4</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Zero-Interference Hardware Notch */}
        <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Mac Hardware Integration</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3">
              Zero-Interference Notch Cutout
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Idle notch is mathematically locked to physical dimensions (<strong className="text-white">170px × 32px</strong>). Transparent dead zones never intercept clicks on Safari tabs or menu bar items.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Auto-collapses on blur</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Click-Safe
            </span>
          </div>
        </div>

        {/* CARD 3: Instant Auto-Paste & Hotkeys */}
        <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Keyboard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Global Keystrokes</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3">
              Instant Auto-Paste Anywhere
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Release your hotkey (<kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-xs">⌥ Space</kbd>) and DopeNotch immediately types the transcribed text straight into your cursor focus via macOS CoreGraphics.
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
              <span>Default Hotkey</span>
              <span className="text-amber-400 font-bold">⌥ Space</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
              <span>Alternative Preset</span>
              <span className="text-zinc-400 font-bold">⌃ ⌥ Space</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Rich Multi-Type Clipboard Vault (Spans 2 columns) */}
        <div className="md:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Palette className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Smart Clipboard Vault</span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-3">
              Auto-Categorized Multi-Format History
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-lg mb-6">
              Every copy is automatically classified into high-utility cards with live previews: color swatches, syntax-highlighted code, smart links, audio transcripts, and OCR screenshot text.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-lg">🎨</span>
                <span className="text-xs font-bold text-white">Color Swatches</span>
                <span className="text-[10px] text-zinc-400">HEX & RGB preview</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-lg">💻</span>
                <span className="text-xs font-bold text-white">Code Blocks</span>
                <span className="text-[10px] text-zinc-400">Syntax formatted</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-lg">🎙️</span>
                <span className="text-xs font-bold text-white">Voice Dictations</span>
                <span className="text-[10px] text-zinc-400">WPM & speech duration</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-lg">🔗</span>
                <span className="text-xs font-bold text-white">Smart Links</span>
                <span className="text-[10px] text-zinc-400">One-click launch</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
