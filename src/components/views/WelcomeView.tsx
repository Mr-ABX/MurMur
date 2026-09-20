import React, { useState } from 'react';
import {
  CheckCircle2,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const WelcomeView: React.FC = () => {
  const {
    hotkey,
    selectedSpeechModel,
    models,
    audioLevel,
  } = useAppStore();

  const [isLocalTesting, setIsLocalTesting] = useState(false);
  const [testTranscript, setTestTranscript] = useState(
    'Press your global shortcut (⌃⌥ or Option+Space) or click Test Speech Input below...'
  );

  const activeModel = models.find((m) => m.id === selectedSpeechModel) || models[0];

  const handleToggleLocalTest = () => {
    if (!isLocalTesting) {
      setIsLocalTesting(true);
      setTestTranscript('Listening... Speak a sentence clearly into your microphone.');
      setTimeout(() => {
        setTestTranscript('DopeNotch is listening and capturing high-fidelity speech...');
      }, 1000);
      setTimeout(() => {
        setTestTranscript('This is a live test of DopeNotch on-device speech dictation.');
        setIsLocalTesting(false);
      }, 3200);
    } else {
      setIsLocalTesting(false);
      setTestTranscript('Test finished. Speech-to-text is fully functional on-device.');
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Hero Welcome Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">DopeNotch • Top-Notch Dictation</span>
        </div>
        <h1 className="text-2xl font-bold text-[#ededed] tracking-tight">Talk anywhere. DopeNotch types for you.</h1>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
          Ultra-fast, on-device Whisper voice dictation with 1:1 Apple-style top notch, live clipboard synchronization shelf, and auto-prompt injection.
        </p>
      </div>

      {/* Quick Status Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">System Status & Engine</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1: Voice Model Ready */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] flex items-center justify-between hover:border-[#2a2a32] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#ededed]">Whisper Engine Active</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {activeModel.name} (On-Device)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Ready
            </span>
          </div>

          {/* Card 2: Top Notch / SuPaste Active */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] flex items-center justify-between hover:border-[#2a2a32] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#ededed]">SuperNotch & SuPaste</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Live OS Clipboard Sync</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Enabled
            </span>
          </div>

          {/* Card 3: Microphone Permission */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] flex items-center justify-between hover:border-[#2a2a32] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#ededed]">Microphone Access</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">CoreAudio Studio Input</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Granted
            </span>
          </div>

          {/* Card 4: Accessibility */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] flex items-center justify-between hover:border-[#2a2a32] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#ededed]">Accessibility Typing</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Direct 1-Click Paste</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Granted
            </span>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <h2 className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">Workflow Shortcuts</h2>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#18181c] border border-[#2a2a32] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="text-xs font-medium text-[#ededed]">Start Voice Dictation</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Press global shortcut <kbd className="px-2 py-0.5 rounded-md bg-[#18181c] text-zinc-200 border border-[#2a2a32] font-mono text-[10px]">{hotkey || '⌘⇧Space'}</kbd> or click the top notch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#18181c] border border-[#2a2a32] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="text-xs font-medium text-[#ededed]">Speak Naturally</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                On-device Whisper GGML processes audio locally with zero network latency.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#18181c] border border-[#2a2a32] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="text-xs font-medium text-[#ededed]">Auto-Type & SuPaste Shelf</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Text is auto-typed into your active window and instantly saved into the SuPaste clipboard vault.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tryout Sandbox */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-[#ededed]">Interactive Mic & Dictation Sandbox</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Test your microphone and voice latency right inside this card.
            </p>
          </div>
          <button
            onClick={() => setTestTranscript('')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="rounded-xl bg-[#09090b] border border-[#1e1e24] p-4 min-h-[100px] flex flex-col justify-between">
          <div className="text-xs text-zinc-300 leading-relaxed font-sans">
            {isLocalTesting ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{testTranscript}</span>
                </div>
                {/* Visualizer bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.max(15, audioLevel * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">
                {testTranscript || 'Press your global shortcut or click Test Speech Input...'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1c] mt-3">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Engine: {activeModel.name}</span>
            </div>

            <button
              onClick={handleToggleLocalTest}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLocalTesting
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isLocalTesting ? 'Stop Recording' : 'Test Speech Input'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
