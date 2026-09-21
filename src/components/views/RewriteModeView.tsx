import React, { useState } from 'react';
import { Pencil, Sparkles, Copy, Check, RotateCcw, Wand2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const RewriteModeView: React.FC = () => {
  const { rewriteHotkey } = useAppStore();

  const [originalText, setOriginalText] = useState(
    'hey team just wanted to let you know that the bug is fixed and we can deploy tomorrow morning'
  );
  const [selectedTone, setSelectedTone] = useState<'professional' | 'concise' | 'bullet' | 'casual'>('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const TONES = [
    { id: 'professional', label: 'Polite & Professional', desc: 'Formal workplace tone' },
    { id: 'concise', label: 'Ultra Concise', desc: 'Short, direct, no fluff' },
    { id: 'bullet', label: 'Bullet Points', desc: 'Structured summary list' },
    { id: 'casual', label: 'Casual & Friendly', desc: 'Warm peer communication' },
  ];

  const handleRewrite = () => {
    setIsProcessing(true);
    setRewrittenText('');

    setTimeout(() => {
      let result = '';
      switch (selectedTone) {
        case 'professional':
          result =
            'Hi Team,\n\nI am pleased to inform you that the issue has been resolved. We are on track to deploy tomorrow morning.\n\nBest regards,';
          break;
        case 'concise':
          result = 'Bug fixed. Deployment scheduled for tomorrow morning.';
          break;
        case 'bullet':
          result =
            '• Status: Bug successfully resolved\n• Next Step: Production deployment scheduled for tomorrow morning';
          break;
        case 'casual':
          result = 'Hey everyone! Bug is all sorted out, ready to ship first thing tomorrow morning! 🚀';
          break;
      }
      setRewrittenText(result);
      setIsProcessing(false);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
          <Pencil className="w-5 h-5 text-amber-400" /> Write & Rewrite Mode
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Select text in any app (VS Code, Chrome, Slack, Word) and press <kbd className="px-2 py-0.5 rounded-md bg-[#18181c] text-amber-400 font-mono border border-[#2a2a32] font-semibold">{rewriteHotkey}</kbd> to instantly transform inline.
        </p>
      </div>

      {/* Tone Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => setSelectedTone(tone.id as any)}
            className={`p-3.5 rounded-2xl text-left transition-all border ${
              selectedTone === tone.id
                ? 'bg-[#18181e] border-amber-400/50 ring-1 ring-amber-400/20'
                : 'bg-[#121215] border-[#1e1e24] hover:border-[#2a2a32]'
            }`}
          >
            <p className="text-xs font-semibold text-white">{tone.label}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{tone.desc}</p>
          </button>
        ))}
      </div>

      {/* Two Column Side-by-Side Playground */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Text */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-zinc-400">
            <span>Original Text (Highlighted Selection)</span>
            <button
              onClick={() => setOriginalText('')}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/5"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <textarea
            rows={6}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl p-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Rewritten Text Preview */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Rewritten Output
              </span>
              {rewrittenText && (
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className="mt-2 min-h-[140px] p-3.5 rounded-xl bg-[#09090b] border border-[#1e1e24]">
              {isProcessing ? (
                <p className="text-xs text-amber-400 font-medium animate-pulse">
                  Transforming selected text...
                </p>
              ) : rewrittenText ? (
                <p className="text-xs text-white whitespace-pre-line leading-relaxed font-sans">
                  {rewrittenText}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Click "Transform & Rewrite" to generate AI version...
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRewrite}
              disabled={isProcessing}
              className="btn-swift-primary text-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Generating...' : 'Transform & Rewrite'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
