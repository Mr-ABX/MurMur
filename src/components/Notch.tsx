import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppState } from "../hooks/useAppState";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bot,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Loader2,
  FileText,
  Copy,
  Check,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function SingleLineAiWave({ level, isRecording, isExpanded }: { level: number; isRecording: boolean; isExpanded: boolean }) {
  const [phase, setPhase] = useState(0);
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  useEffect(() => {
    let animId: number;
    const animate = () => {
      const step = isRecordingRef.current ? 0.085 : 0.015;
      setPhase((prev) => (prev + step) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const width = isExpanded ? 340 : 220;
  const height = 18;
  const points = 45;
  const amp = isRecording ? 7 + Math.min(10, level * 14) : (isExpanded ? 2.5 : 1.2);

  let pathD = "";
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const normX = i / points;
    const envelope = Math.sin(normX * Math.PI);
    const y = height / 2 + Math.sin(normX * Math.PI * 2.5 + phase) * amp * envelope;

    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  }

  let pathD2 = "";
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const normX = i / points;
    const envelope = Math.sin(normX * Math.PI);
    const y = height / 2 + Math.cos(normX * Math.PI * 2.0 - phase * 0.9) * (amp * 0.6) * envelope;

    if (i === 0) {
      pathD2 += `M ${x} ${y}`;
    } else {
      pathD2 += ` L ${x} ${y}`;
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-2">
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="aiWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="15%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="35%" stopColor="#c084fc" stopOpacity="1" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="85%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={pathD2}
          fill="none"
          stroke="url(#aiWaveGrad)"
          strokeWidth="0.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        <path
          d={pathD}
          fill="none"
          stroke="url(#aiWaveGrad)"
          strokeWidth="0.9"
          strokeLinecap="round"
          filter="url(#aiGlow)"
        />
      </svg>
    </div>
  );
}

export default function Notch({ state }: { state: AppState }) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pageIndex, setPageIndex] = useState<0 | 1 | 2>(0);

  // Assistant state
  const [prompt, setPrompt] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unlistenAudio = listen<number>("audio_level", (e) => {
      const level = Math.min(Math.max(e.payload, 0), 1);
      setAudioLevel(level);
    });

    // Auto-collapse on window blur when un-locked
    const unlistenBlur = getCurrentWindow().listen("tauri://blur", () => {
      if (!isLocked) {
        setIsExpanded(false);
      }
    });

    return () => {
      unlistenAudio.then((fn) => fn());
      unlistenBlur.then((fn) => fn());
    };
  }, [isLocked]);

  const isRecording = state.recordingState === "recording";
  const isInteracting = isRecording || audioLevel > 0.03;
  const notchStyle = state.settings.notchStyle ?? "macbook";

  const handleOpenSettings = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await invoke("open_settings");
    } catch (err) {
      console.error("Failed to open settings:", err);
    }
  };

  const handleToggleRecording = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (isRecording) {
        await invoke("stop_recording");
      } else {
        await invoke("start_recording");
      }
    } catch (err) {
      console.error("Failed to toggle recording:", err);
    }
  };

  const handleAskAssistant = async (customPrompt?: string) => {
    const textToAsk = customPrompt || prompt;
    if (!textToAsk.trim() || isAsking) return;

    setIsAsking(true);
    setAssistantResponse("");

    try {
      const res = await invoke<string>("ask_screen_assistant", {
        prompt: textToAsk,
        imageBase64: ""
      });
      setAssistantResponse(res);
      setPrompt("");
    } catch (err: any) {
      setAssistantResponse("Error: " + (err?.toString() || "Failed to ask assistant"));
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyResponse = () => {
    if (!assistantResponse) return;
    navigator.clipboard.writeText(assistantResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex items-start justify-center w-screen h-screen bg-transparent overflow-hidden select-none"
      data-tauri-drag-region
    >
      <motion.div
        layout
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`relative pointer-events-auto flex flex-col items-center border-none outline-none overflow-hidden transition-colors ${
          notchStyle === "macbook"
            ? "rounded-b-[20px] rounded-t-none mt-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-x border-b border-white/10"
            : "rounded-[24px] mt-2 shadow-[0_8px_32px_rgba(0,0,0,0.85)] border border-white/10"
        } ${!isExpanded ? "cursor-pointer hover:bg-zinc-950" : ""}`}
        style={{
          backgroundColor: "#000000",
          width: isExpanded ? "440px" : isInteracting ? "280px" : "240px",
          height: isExpanded ? "270px" : notchStyle === "macbook" ? "25px" : "27px",
        }}
      >
        {/* Top Header AI Wave Bar + Lock Toggle */}
        <div
          className="w-full flex items-center justify-between px-3 h-[25px] flex-shrink-0 cursor-pointer"
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              setIsExpanded(false);
            }
          }}
        >
          <div className="flex-1 h-full flex items-center justify-center">
            <SingleLineAiWave level={audioLevel} isRecording={isInteracting} isExpanded={isExpanded} />
          </div>

          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
              }}
              className={`p-1 rounded-full transition-colors ml-2 ${
                isLocked ? "text-indigo-400 bg-indigo-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
              }`}
              title={isLocked ? "Locked (Stays open on blur)" : "Unlocked (Auto-closes on blur)"}
            >
              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          )}
        </div>

        {/* Expanded View with Paginated Dots Navigation */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col px-4 pb-2 pt-1 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pages Content Area with Gradient Bottom Fade Mask */}
              <div className="relative flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto pr-0.5 no-scrollbar">
                  {/* PAGE 0: DASHBOARD CONTROLS */}
                  {pageIndex === 0 && (
                    <motion.div
                      key="page0"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="flex-1 flex flex-col gap-3 justify-between"
                    >
                      {/* Sleek Circular Action Icons Grid */}
                      <div className="grid grid-cols-4 gap-3 py-1 px-2 bg-zinc-950/80 rounded-2xl border border-white/5">
                        {/* 1. Dictate Toggle Icon */}
                        <button
                          onClick={handleToggleRecording}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                              isRecording
                                ? "bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse"
                                : "bg-zinc-900 border border-white/10 text-zinc-300 group-hover:border-rose-500/50 group-hover:text-white"
                            }`}
                          >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-200">
                            {isRecording ? "Stop" : "Dictate"}
                          </span>
                        </button>

                        {/* 2. Open Settings Icon */}
                        <button
                          onClick={handleOpenSettings}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 text-indigo-400 flex items-center justify-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 group-hover:scale-105">
                            <Settings size={18} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-200">
                            Settings
                          </span>
                        </button>

                        {/* 3. AI Assistant Icon */}
                        <button
                          onClick={() => setPageIndex(1)}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 text-purple-400 flex items-center justify-center transition-all group-hover:border-purple-500/50 group-hover:bg-purple-500/10 group-hover:scale-105">
                            <Bot size={18} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-200">
                            Assistant
                          </span>
                        </button>

                        {/* 4. Notes Icon */}
                        <button
                          onClick={() => setPageIndex(2)}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 text-emerald-400 flex items-center justify-center transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 group-hover:scale-105">
                            <FileText size={18} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-200">
                            Notes
                          </span>
                        </button>
                      </div>

                      {/* Mode Badge */}
                      <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400 font-medium">Operating Mode</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full text-indigo-300 bg-indigo-500/20 font-semibold border border-indigo-500/30">
                          {state.settings.operatingMode.toUpperCase()}
                        </span>
                      </div>

                      {/* Recent Live Transcript Card */}
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex-1 flex flex-col justify-center relative group">
                        <div className="text-[9px] font-bold text-zinc-500 tracking-wider mb-1">LIVE RECENT TRANSCRIPT</div>
                        <p className="text-xs text-zinc-200 line-clamp-2 italic pr-6">
                          {state.partialTranscript || state.lastProcessedTranscript || "No recent voice dictation recorded..."}
                        </p>
                        {(state.partialTranscript || state.lastProcessedTranscript) && (
                          <button
                            onClick={() => {
                              const text = state.partialTranscript || state.lastProcessedTranscript;
                              if (text) navigator.clipboard.writeText(text);
                            }}
                            className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-white bg-zinc-900 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy transcript"
                          >
                            <Copy size={11} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* PAGE 1: SCREEN AI ASSISTANT */}
                  {pageIndex === 1 && (
                    <motion.div
                      key="page1"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex-1 flex flex-col gap-2 overflow-hidden"
                    >
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                        <button
                          onClick={() => handleAskAssistant("Summarize the visible screen in 2 bullet points")}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[11px] text-zinc-300 hover:text-white hover:border-indigo-500/40 flex items-center gap-1 whitespace-nowrap transition-colors"
                        >
                          <Sparkles size={10} className="text-indigo-400" />
                          <span>Summarize Screen</span>
                        </button>
                        <button
                          onClick={() => handleAskAssistant("Explain the code visible on screen")}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[11px] text-zinc-300 hover:text-white hover:border-indigo-500/40 flex items-center gap-1 whitespace-nowrap transition-colors"
                        >
                          <Sparkles size={10} className="text-purple-400" />
                          <span>Explain Code</span>
                        </button>
                      </div>

                      {/* Prompt Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAskAssistant();
                        }}
                        className="flex items-center gap-1.5 bg-zinc-900/90 rounded-xl border border-white/10 p-1.5"
                      >
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ask Screen AI Assistant..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 px-2 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isAsking || !prompt.trim()}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors"
                        >
                          {isAsking ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        </button>
                      </form>

                      {/* Response Box */}
                      <div className="flex-1 bg-zinc-950 rounded-xl border border-white/5 p-2.5 overflow-y-auto relative text-xs text-zinc-300">
                        {isAsking ? (
                          <div className="flex items-center justify-center h-full gap-2 text-zinc-400">
                            <Loader2 size={14} className="animate-spin text-indigo-400" />
                            <span>Analyzing screen & generating answer...</span>
                          </div>
                        ) : assistantResponse ? (
                          <div className="relative group">
                            <p className="whitespace-pre-wrap leading-relaxed pr-6">{assistantResponse}</p>
                            <button
                              onClick={handleCopyResponse}
                              className="absolute top-0 right-0 p-1 text-zinc-400 hover:text-white bg-zinc-900 rounded border border-white/10 transition-colors"
                              title="Copy response"
                            >
                              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-1 text-center">
                            <Bot size={20} className="text-indigo-400/60 mb-1" />
                            <p>Ask a question or tap a preset above to analyze your screen.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* PAGE 2: VOICE NOTES */}
                  {pageIndex === 2 && (
                    <motion.div
                      key="page2"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex-1 flex flex-col gap-2 overflow-hidden"
                    >
                      <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                        <span>Saved Voice Transcripts</span>
                        <span className="text-[10px] text-zinc-500">Auto-saved</span>
                      </div>

                      <div className="flex-1 bg-zinc-950 rounded-xl border border-white/5 p-2.5 overflow-y-auto space-y-2">
                        {state.lastProcessedTranscript ? (
                          <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5 flex items-start justify-between gap-2">
                            <p className="text-xs text-zinc-200">{state.lastProcessedTranscript}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(state.lastProcessedTranscript);
                              }}
                              className="p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded transition-colors"
                              title="Copy transcript"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
                            <FileText size={20} className="text-zinc-600 mb-1" />
                            <span>No voice notes recorded yet...</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Soft Faded Gradient Mask Overlay */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              {/* Paginated Dots Navigation Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={() => setPageIndex((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : 2))}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPageIndex(0)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      pageIndex === 0 ? "bg-indigo-400 w-5" : "bg-zinc-600 hover:bg-zinc-400"
                    }`}
                  />
                  <button
                    onClick={() => setPageIndex(1)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      pageIndex === 1 ? "bg-purple-400 w-5" : "bg-zinc-600 hover:bg-zinc-400"
                    }`}
                  />
                  <button
                    onClick={() => setPageIndex(2)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      pageIndex === 2 ? "bg-emerald-400 w-5" : "bg-zinc-600 hover:bg-zinc-400"
                    }`}
                  />
                </div>

                <button
                  onClick={() => setPageIndex((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : 0))}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
