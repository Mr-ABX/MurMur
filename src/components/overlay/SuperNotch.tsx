import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Copy,
  Pin,
  Trash2,
  X,
  CornerDownLeft,
  Star,
  Settings,
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
    setClipboardItems,
  } = useAppStore();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isCommand = recordingMode === 'command';
  const isRewrite = recordingMode === 'rewrite';
  const activeMode = isRecording ? 'recording' : superNotchMode;

  // 7 Equalizer Bars calculation for recording mode
  const bars = [0.35, 0.65, 0.95, 1.0, 0.85, 0.55, 0.35];

  // Filter items based on category and search query
  const filteredItems = clipboardItems.filter((item) => {
    if (activeClipboardCategory === 'pinned' && !item.isPinned) return false;
    if (activeClipboardCategory === 'dictation' && item.category !== 'dictation') return false;
    if (activeClipboardCategory === 'clipboard' && item.category !== 'clipboard') return false;
    if (activeClipboardCategory === 'code' && item.category !== 'code') return false;
    if (activeClipboardCategory === 'link' && item.category !== 'link') return false;
    if (activeClipboardCategory === 'color' && item.category !== 'color') return false;

    if (clipboardSearchQuery.trim()) {
      const q = clipboardSearchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        (item.sourceApp && item.sourceApp.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate live counts for each category badge
  const counts = {
    all: clipboardItems.length,
    dictation: clipboardItems.filter((c) => c.category === 'dictation').length,
    clipboard: clipboardItems.filter((c) => c.category === 'clipboard').length,
    pinned: clipboardItems.filter((c) => c.isPinned).length,
    code: clipboardItems.filter((c) => c.category === 'code').length,
    link: clipboardItems.filter((c) => c.category === 'link').length,
    color: clipboardItems.filter((c) => c.category === 'color').length,
  };

  // Adjust selection within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Sync window size with Tauri backend & fetch fresh clipboard items
  useEffect(() => {
    if (activeMode === 'shelf') {
      invoke<any[]>('get_clipboard_history')
        .then((items) => {
          if (Array.isArray(items)) {
            setClipboardItems(
              items.map((it) => ({
                id: it.id,
                content: it.content,
                category: it.category,
                timestamp: it.timestamp,
                timestampRaw: it.timestamp_raw || Date.now(),
                sourceApp: it.source_app || 'Clipboard',
                charCount: it.char_count || it.content.length,
                wordCount: it.word_count || it.content.split(/\s+/).filter(Boolean).length,
                isPinned: it.is_pinned || false,
              }))
            );
          }
        })
        .catch(() => {});
      invoke('set_notch_expanded', { expanded: true }).catch(() => {});
      getCurrentWindow().setFocus().catch(() => {});
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    } else {
      invoke('set_notch_expanded', { expanded: false }).catch(() => {});
    }
  }, [activeMode, setClipboardItems]);

  // Keyboard navigation
  useEffect(() => {
    if (activeMode !== 'shelf') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuperNotchMode('idle');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
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

  // Scroll selected card into view
  useEffect(() => {
    if (activeMode === 'shelf' && scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex, activeMode]);

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
      await navigator.clipboard.writeText(text);
    }
    setSuperNotchMode('idle');
  };

  const handleOpenDashboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    invoke('open_settings').catch(() => {});
    setSuperNotchMode('idle');
  };

  const categories: Array<{ id: ClipboardCategory; label: string; count: number }> = [
    { id: 'all', label: 'History', count: counts.all },
    { id: 'dictation', label: 'Dictations', count: counts.dictation },
    { id: 'clipboard', label: 'Clips', count: counts.clipboard },
    { id: 'code', label: 'Code', count: counts.code },
    { id: 'color', label: 'Colors', count: counts.color },
    { id: 'link', label: 'Links', count: counts.link },
    { id: 'pinned', label: 'Pinned', count: counts.pinned },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center select-none overflow-hidden bg-transparent">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* 1. IDLE NOTCH: Exact Apple Cutout Shape (Pure #000, No Shadow, No Border) */}
        {/* ========================================================================= */}
        {activeMode === 'idle' && (
          <motion.div
            key="notch-idle"
            initial={{ y: -35, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -35, opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 480 }}
            onClick={() => setSuperNotchMode('shelf')}
            className="pointer-events-auto cursor-pointer flex flex-col items-center group"
            title="Click to open SuPaste shelf"
          >
            {/* Authentic Apple Notch SVG with concave ear wings */}
            <svg
              width="170"
              height="30"
              viewBox="0 0 170 30"
              fill="none"
              className="overflow-visible"
            >
              {/* Path: (0,0) -> ear curve to (8,8) -> straight down to (8,18) -> bottom fillet to (20,30) -> flat bottom -> right fillet -> straight up -> ear curve to (170,0) */}
              <path
                d="M 0 0 C 5 0, 8 3, 8 8 L 8 18 C 8 25, 13 30, 20 30 L 150 30 C 157 30, 162 25, 162 18 L 162 8 C 162 3, 165 0, 170 0 Z"
                fill="#000000"
              />
            </svg>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. RECORDING NOTCH: 7-bar audio visualizer + real-time transcription stream */}
        {/* ========================================================================= */}
        {activeMode === 'recording' && (
          <motion.div
            key="notch-recording"
            initial={{ y: -60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 450 }}
            className="pointer-events-auto flex flex-col items-center w-[360px] max-w-[92vw]"
          >
            <div className="relative w-full">
              {/* Apple Notch Background Shell */}
              <svg
                width="100%"
                height="62"
                viewBox="0 0 360 62"
                preserveAspectRatio="none"
                className="overflow-visible"
              >
                <path
                  d="M 0 0 C 7 0, 10 4, 10 10 L 10 44 C 10 54, 18 62, 28 62 L 332 62 C 342 62, 350 54, 350 44 L 350 10 C 350 4, 353 0, 360 0 Z"
                  fill="#000000"
                />
              </svg>

              {/* Foreground Visualizer Content */}
              <div className="absolute inset-0 px-6 pt-2.5 pb-2 flex flex-col items-center justify-between">
                {/* Top Row: Equalizer Bars + Mode Badge */}
                <div className="flex items-center gap-2">
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

                {/* Bottom Row: Speech Preview */}
                <div className="w-full text-center px-1">
                  <p className="text-xs text-[#ededed] font-medium leading-tight line-clamp-1">
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
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. EXPANDED SHELF: 1:1 SuPaste Horizontal Shelf (Clean Apple Cutout)       */}
        {/* ========================================================================= */}
        {activeMode === 'shelf' && (
          <motion.div
            key="notch-shelf"
            initial={{ y: -100, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="pointer-events-auto flex flex-col items-center w-[760px] max-w-[96vw]"
          >
            <div className="relative w-full">
              {/* Apple Notch Expanded Cutout Shell */}
              <svg
                width="100%"
                height="225"
                viewBox="0 0 760 225"
                preserveAspectRatio="none"
                className="overflow-visible"
              >
                <path
                  d="M 0 0 C 10 0, 16 5, 16 14 L 16 201 C 16 214, 27 225, 40 225 L 720 225 C 733 225, 744 214, 744 201 L 744 14 C 744 5, 750 0, 760 0 Z"
                  fill="#000000"
                />
              </svg>

              {/* SuPaste Shelf Interior View */}
              <div className="absolute inset-0 px-6 pt-3 pb-3 flex flex-col justify-between text-[#ededed]">
                {/* Header: Search + Category Filter Tabs + Top Action Icons */}
                <div className="flex items-center justify-between gap-3 px-1">
                  {/* Left: Search Bar */}
                  <div className="flex items-center gap-1.5 bg-[#161618] rounded-full px-3 py-1 w-44">
                    <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={clipboardSearchQuery}
                      onChange={(e) => setClipboardSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    {clipboardSearchQuery && (
                      <button
                        onClick={() => setClipboardSearchQuery('')}
                        className="text-zinc-500 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Center: Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {categories.map((cat) => {
                      const isActive = activeClipboardCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveClipboardCategory(cat.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] transition-all whitespace-nowrap ${
                            isActive
                              ? 'bg-white text-black font-semibold'
                              : 'bg-[#18181a] text-zinc-400 hover:text-zinc-200 hover:bg-[#222226]'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={`text-[10px] ${
                              isActive ? 'text-zinc-600 font-bold' : 'text-zinc-500'
                            }`}
                          >
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveClipboardCategory(
                          activeClipboardCategory === 'pinned' ? 'all' : 'pinned'
                        )
                      }
                      className={`p-1.5 rounded-full transition-colors ${
                        activeClipboardCategory === 'pinned'
                          ? 'bg-amber-400/20 text-amber-400'
                          : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1c]'
                      }`}
                      title="Show Pinned"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={handleOpenDashboard}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#1a1a1c] transition-colors"
                      title="Open Dashboard"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSuperNotchMode('idle')}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#1a1a1c] transition-colors"
                      title="Close Shelf (Esc)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Content: SuPaste Horizontal Scrollable Cards Shelf */}
                <div
                  ref={scrollContainerRef}
                  className="flex flex-row gap-3 overflow-x-auto no-scrollbar py-1 px-1 items-stretch"
                >
                  {filteredItems.length === 0 ? (
                    <div className="w-full py-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-1">
                      <p className="font-medium text-zinc-400">No clips yet</p>
                      <p className="text-[11px] text-zinc-600">
                        Copy any text or speak with Liquid Voice to see clips appear here in real time.
                      </p>
                    </div>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isSelected = selectedIndex === index;
                      const isCopied = copiedId === item.id;
                      const isColor = item.category === 'color';

                      return (
                        <div
                          key={item.id}
                          onClick={() => handlePaste(item.content)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-[155px] min-w-[155px] h-[140px] rounded-[18px] p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none group relative overflow-hidden ${
                            isColor
                              ? 'border border-white/10'
                              : isSelected
                              ? 'bg-[#1c1c1f] ring-1 ring-white/20'
                              : 'bg-[#141416] hover:bg-[#18181b]'
                          }`}
                          style={
                            isColor
                              ? { backgroundColor: item.content }
                              : undefined
                          }
                        >
                          {/* Hover Actions Bar at Top Right */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinClipboardItem(item.id);
                              }}
                              className={`p-1 rounded-full bg-black/60 backdrop-blur-md transition-colors ${
                                item.isPinned ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                              }`}
                              title={item.isPinned ? 'Unpin' : 'Pin'}
                            >
                              <Pin className="w-2.5 h-2.5 fill-current" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteClipboardItem(item.id);
                              }}
                              className="p-1 rounded-full bg-black/60 backdrop-blur-md text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Card Body */}
                          {isColor ? (
                            <div className="flex-1 flex flex-col justify-end">
                              <span className="text-xs font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md self-start">
                                {item.content}
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1 overflow-hidden pr-2">
                              {item.category === 'dictation' && (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span className="text-[10px] font-semibold text-emerald-400">
                                    Dictation
                                  </span>
                                </div>
                              )}
                              <p
                                className={`text-[12px] leading-relaxed line-clamp-4 ${
                                  item.category === 'code'
                                    ? 'font-mono text-zinc-300 text-[11px]'
                                    : 'text-[#EDEDED] font-sans'
                                }`}
                              >
                                {item.content}
                              </p>
                            </div>
                          )}

                          {/* Card Footer */}
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 mt-1 border-t border-white/5 font-mono">
                            <div className="flex items-center gap-1 truncate">
                              <span className="truncate max-w-[80px] text-zinc-400">
                                {item.sourceApp || 'Clipboard'}
                              </span>
                            </div>

                            <span className="text-zinc-500 text-[9px] flex-shrink-0">
                              {item.timestamp}
                            </span>
                          </div>

                          {/* Quick 1-Click Paste / Copy Indicator on Hover */}
                          <div className="absolute inset-x-0 bottom-0 py-1 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-semibold text-white flex items-center gap-1">
                              <CornerDownLeft className="w-2.5 h-2.5" /> Paste
                            </span>
                            <button
                              onClick={(e) => handleCopy(item, e)}
                              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-0.5"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              {isCopied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
