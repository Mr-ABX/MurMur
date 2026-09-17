import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Copy,
  Check,
  Pin,
  Trash2,
  ExternalLink,
  Code2,
  FileText,
  Mic,
  Sparkles,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  useAppStore,
  ClipboardCategory,
  ClipboardItem,
} from '../../stores/appStore';

export const SuperNotch: React.FC = () => {
  const {
    isRecording,
    audioLevel,
    streamingText,
    recordingMode,
    superNotchMode,
    setSuperNotchMode,
    clipboardItems,
    activeClipboardCategory,
    setActiveClipboardCategory,
    clipboardSearchQuery,
    setClipboardSearchQuery,
    togglePinClipboardItem,
    deleteClipboardItem,
    clearClipboardItems,
  } = useAppStore();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isCommand = recordingMode === 'command';
  const isRewrite = recordingMode === 'rewrite';
  const activeMode = isRecording ? 'recording' : superNotchMode;

  // 7-bar Equalizer distribution
  const bars = [0.35, 0.65, 0.95, 1.0, 0.85, 0.55, 0.35];

  // Filter clips based on active tab and search query
  const filteredItems = clipboardItems.filter((item) => {
    // Category filter
    if (activeClipboardCategory === 'pinned' && !item.isPinned) return false;
    if (activeClipboardCategory === 'dictation' && item.category !== 'dictation') return false;
    if (activeClipboardCategory === 'clipboard' && item.category !== 'clipboard') return false;
    if (activeClipboardCategory === 'code' && item.category !== 'code') return false;
    if (activeClipboardCategory === 'link' && item.category !== 'link') return false;

    // Search query filter
    if (clipboardSearchQuery.trim()) {
      const q = clipboardSearchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        (item.sourceApp && item.sourceApp.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Handle window expansion with Tauri backend
  useEffect(() => {
    if (activeMode === 'shelf') {
      invoke('set_notch_expanded', { expanded: true }).catch(() => {});
      getCurrentWindow().setFocus().catch(() => {});
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      invoke('set_notch_expanded', { expanded: false }).catch(() => {});
    }
  }, [activeMode]);

  // Handle keyboard navigation (Arrow Up/Down, Enter to Paste, Esc to Close)
  useEffect(() => {
    if (activeMode !== 'shelf') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuperNotchMode('idle');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handlePaste(filteredItems[selectedIndex].content);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, filteredItems, selectedIndex, setSuperNotchMode]);

  const handleCopy = (item: ClipboardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePaste = async (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await invoke('paste_text_direct', { text });
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text);
    }
    setSuperNotchMode('idle');
  };

  const categories: Array<{ id: ClipboardCategory; label: string; icon: any }> = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'dictation', label: 'Dictations', icon: Mic },
    { id: 'clipboard', label: 'Clipboard', icon: FileText },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'link', label: 'Links', icon: ExternalLink },
  ];

  const getCategoryBadge = (category: ClipboardItem['category']) => {
    switch (category) {
      case 'dictation':
        return (
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <Mic className="w-2.5 h-2.5" /> Dictation
          </span>
        );
      case 'code':
        return (
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-950/80 text-purple-400 border border-purple-800/40 font-mono">
            <Code2 className="w-2.5 h-2.5" /> Code
          </span>
        );
      case 'link':
        return (
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-950/80 text-blue-400 border border-blue-800/40">
            <ExternalLink className="w-2.5 h-2.5" /> Link
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
            <FileText className="w-2.5 h-2.5" /> Clip
          </span>
        );
    }
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 select-none flex flex-col items-center">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* 1. IDLE STATE: Sleek minimal bezel pill hugging the top camera notch     */}
        {/* ========================================================================= */}
        {activeMode === 'idle' && (
          <motion.div
            key="notch-idle"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 450 }}
            onClick={() => setSuperNotchMode('shelf')}
            className="group cursor-pointer"
            title="Click to open SuPaste shelf"
          >
            <div className="w-[175px] h-[24px] bg-[#000000] border-b border-x border-[#222222] rounded-b-xl shadow-2xl flex items-center justify-center transition-all duration-200 group-hover:border-[#444444] group-hover:shadow-[0_4px_20px_rgba(255,255,255,0.06)]">
              {/* Ultra-clean minimal center pill indicator */}
              <div className="w-6 h-[3px] rounded-full bg-[#2a2a2a] transition-all duration-200 group-hover:bg-[#555555] group-hover:w-8" />
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. RECORDING STATE: 7-bar audio equalizer + live transcription stream     */}
        {/* ========================================================================= */}
        {activeMode === 'recording' && (
          <motion.div
            key="notch-recording"
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 450 }}
            className="w-[340px] max-w-[92vw]"
          >
            <div className="rounded-b-2xl px-4 py-2.5 bg-[#0a0a0a] border-x border-b border-[#262626] shadow-2xl backdrop-blur-xl flex flex-col items-center gap-1.5">
              {/* Top Row: Equalizer Bars + Mode Badge */}
              <div className="flex items-center gap-2">
                {/* 7 Vertical Equalizer Bars */}
                <div className="flex items-center gap-[2.5px] h-3.5">
                  {bars.map((mult, i) => {
                    const heightPercent = Math.max(
                      20,
                      Math.min(100, audioLevel * 100 * mult * 2.5)
                    );
                    return (
                      <div
                        key={i}
                        className={`w-[2.5px] rounded-full transition-all duration-75 ${
                          isCommand
                            ? 'bg-red-500'
                            : isRewrite
                            ? 'bg-blue-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>

                {/* Mode Name */}
                <span
                  className={`text-[11px] font-semibold tracking-wide ${
                    isCommand
                      ? 'text-red-400'
                      : isRewrite
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {isCommand ? 'Command' : isRewrite ? 'Rewrite' : 'Dictate'}
                </span>
              </div>

              {/* Bottom Row: Streaming Speech Preview */}
              <div className="w-full text-center px-1">
                <p className="text-xs text-[#ededed] font-medium leading-tight line-clamp-2">
                  {streamingText ? (
                    <>
                      <span>{streamingText}</span>
                      <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse align-middle" />
                    </>
                  ) : (
                    <span className="text-zinc-500 text-[11px]">Listening to your voice...</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. SHELF STATE: SuPaste Drawer with Search, Categories, & Instant Paste   */}
        {/* ========================================================================= */}
        {activeMode === 'shelf' && (
          <motion.div
            key="notch-shelf"
            initial={{ y: -80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="w-[490px] max-w-[95vw] rounded-b-2xl bg-[#0a0a0a] border-x border-b border-[#222222] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col overflow-hidden text-[#ededed]"
          >
            {/* Header: Search Bar & Actions */}
            <div className="p-3 border-b border-[#1f1f1f] space-y-2.5 bg-[#0e0e10]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search dictations, clipboard clips, code, links..."
                    value={clipboardSearchQuery}
                    onChange={(e) => setClipboardSearchQuery(e.target.value)}
                    className="w-full bg-[#161618] border border-[#262628] rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444] transition-colors"
                  />
                  {clipboardSearchQuery && (
                    <button
                      onClick={() => setClipboardSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSuperNotchMode('idle')}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1c] transition-colors"
                  title="Close Shelf (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeClipboardCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveClipboardCategory(cat.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#ededed] text-[#000000] shadow-sm font-semibold'
                          : 'bg-[#141416] text-zinc-400 hover:text-zinc-200 hover:bg-[#1b1b1e] border border-[#222224]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clips & Dictations List */}
            <div
              ref={listRef}
              className="max-h-[300px] overflow-y-auto p-2 space-y-1.5 divide-y divide-[#18181a]"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 space-y-1">
                  <p className="font-medium text-zinc-400">No clips or dictations found</p>
                  <p className="text-[11px]">Copy any text or speak with Liquid Voice to save items here.</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = selectedIndex === index;
                  const isCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(index)}
                      onDoubleClick={() => handlePaste(item.content)}
                      className={`group relative p-2.5 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#151518] border border-[#333336]'
                          : 'hover:bg-[#111113] border border-transparent'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {getCategoryBadge(item.category)}
                          {item.sourceApp && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {item.sourceApp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                          <span>{item.timestamp}</span>

                          {/* Pin Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinClipboardItem(item.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              item.isPinned
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                            }`}
                            title={item.isPinned ? 'Unpin snippet' : 'Pin to top'}
                          >
                            <Pin className="w-3 h-3 fill-current" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteClipboardItem(item.id);
                            }}
                            className="p-1 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors"
                            title="Delete snippet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p
                        className={`text-xs text-zinc-200 line-clamp-3 leading-relaxed break-words select-text ${
                          item.category === 'code' ? 'font-mono text-[11px] text-zinc-300' : 'font-sans'
                        }`}
                      >
                        {item.content}
                      </p>

                      {/* Quick Action Bar (Visible on Selection/Hover) */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#1c1c1f] text-[10px] text-zinc-500 font-mono">
                        <div className="flex items-center gap-2">
                          <span>{item.wordCount} words</span>
                          <span>•</span>
                          <span>{item.charCount} chars</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Copy Button */}
                          <button
                            onClick={(e) => handleCopy(item, e)}
                            className="px-2 py-0.5 rounded bg-[#1f1f22] hover:bg-[#28282c] text-zinc-300 hover:text-white border border-[#2e2e32] flex items-center gap-1 transition-colors"
                            title="Copy to clipboard (⌘C)"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Paste Button */}
                          <button
                            onClick={(e) => handlePaste(item.content, e)}
                            className="px-2.5 py-0.5 rounded bg-[#ededed] hover:bg-white text-black font-semibold flex items-center gap-1 transition-colors"
                            title="Paste into active app (Enter)"
                          >
                            <CornerDownLeft className="w-2.5 h-2.5" />
                            <span>Paste</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="px-3 py-1.5 border-t border-[#1a1a1c] bg-[#0c0c0e] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-3">
                <span>
                  <strong>{filteredItems.length}</strong> items
                </span>
                <span>•</span>
                <span>↑↓ navigate</span>
                <span>•</span>
                <span>⏎ paste</span>
                <span>•</span>
                <span>esc close</span>
              </div>

              {clipboardItems.length > 0 && (
                <button
                  onClick={clearClipboardItems}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
