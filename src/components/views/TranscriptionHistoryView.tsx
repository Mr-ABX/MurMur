import React, { useState } from 'react';
import {
  History,
  Search,
  Copy,
  Check,
  Trash2,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const TranscriptionHistoryView: React.FC = () => {
  const { historyRecords, clearHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    historyRecords[0]?.id || null
  );
  const [copied, setCopied] = useState(false);

  const filteredRecords = historyRecords.filter(
    (r) =>
      r.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.enhancedText && r.enhancedText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.appName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRecord =
    historyRecords.find((r) => r.id === selectedId) || filteredRecords[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden select-none bg-[#000000] text-[#ededed]">
      {/* Left List Pane */}
      <div className="w-full md:w-80 h-full border-r border-[#222222] flex flex-col bg-[#0a0a0a]">
        {/* Search & Header */}
        <div className="p-4 border-b border-[#222222] space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xs font-semibold text-[#ededed] flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" /> History & Audio
            </h1>
            {historyRecords.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear all recordings"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search past dictations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-[#222222] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
            />
          </div>
        </div>

        {/* Record Item List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching dictations found.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isSelected = selectedRecord?.id === record.id;

              return (
                <button
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[#171717] border border-[#333333]'
                      : 'hover:bg-[#121212] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 font-mono">
                    <span className="text-white font-medium">{record.appName}</span>
                    <span className="text-zinc-500">{record.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                    {record.enhancedText || record.rawText}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500 font-mono">
                    <span>⚡ {record.speakingWPM} WPM</span>
                    <span>•</span>
                    <span>{record.durationSeconds.toFixed(1)}s</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000]">
        {selectedRecord ? (
          <>
            {/* Record Meta Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#ededed] tracking-tight flex items-center gap-2">
                  <span>{selectedRecord.appName} Dictation</span>
                  <span className="text-xs font-normal font-mono text-zinc-500">
                    ({selectedRecord.timestamp})
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                  <span>🎙️ {selectedRecord.modelUsed}</span>
                  <span>•</span>
                  <span>⚡ Latency: {selectedRecord.latencyMs}ms</span>
                  <span>•</span>
                  <span>⏱️ Duration: {selectedRecord.durationSeconds.toFixed(1)}s</span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleCopy(selectedRecord.enhancedText || selectedRecord.rawText)
                }
                className="btn-liquid-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Audio Wave Player Bar */}
            <div className="p-4 rounded-lg bg-[#0f0f11] border border-[#222222] flex items-center gap-4">
              <button className="w-8 h-8 rounded-md bg-[#1a1a1a] text-zinc-300 flex items-center justify-center border border-[#2e2e2e] hover:text-white transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Audio Recording Cache</span>
                  <span>{selectedRecord.durationSeconds.toFixed(1)}s</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1c1c1c] overflow-hidden">
                  <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Enhanced Transcript */}
            {selectedRecord.enhancedText && (
              <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" /> AI Enhanced Transcript
                </div>
                <p className="text-sm text-[#ededed] leading-relaxed font-sans select-text">
                  {selectedRecord.enhancedText}
                </p>
              </div>
            )}

            {/* Raw Speech Transcript */}
            <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <span>Raw Acoustic Transcription</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono select-text">
                {selectedRecord.rawText}
              </p>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            Select a past recording from the left to view details.
          </div>
        )}
      </div>
    </div>
  );
};
