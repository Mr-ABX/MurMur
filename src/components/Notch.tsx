import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { AppState } from "../hooks/useAppState";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bot,
  Mic,
  MicOff,
  Sliders,
  Sparkles,
  ChevronRight,
  X,
  Send,
  Loader2,
  FileText,
  Copy,
  Check
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

  const width = isExpanded ? 360 : 220;
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
  const [activeTab, setActiveTab] = useState<"controls" | "assistant" | "notes">("controls");

  // Assistant state
  const [prompt, setPrompt] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unlisten = listen<number>("audio_level", (e) => {
      const level = Math.min(Math.max(e.payload, 0), 1);
      setAudioLevel(level);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const isRecording = state.recordingState === "recording";
  const isInteracting = isRecording || audioLevel > 0.03;
  const notchStyle = state.settings.notchStyle ?? "macbook";

  const handleOpenSettings = async () => {
    try {
      await invoke("show_settings_window");
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await invoke("stop_recording");
      } else {
        await invoke("start_recording");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskAssistant = async (customPrompt?: string) => {
    const textToAsk = customPrompt || prompt;
    if (!textToAsk.trim() || isAsking) return;

    setIsAsking(true);
    setAssistantResponse("");

    try {
      // Capture screen or send prompt to backend
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
        {/* Top Header AI Wave Bar */}
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
                setIsExpanded(false);
              }}
              className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors ml-2"
              title="Collapse Notch"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Expanded Content View */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col px-4 pb-4 pt-1 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tab Navigation Pill Bar */}
              <div className="flex items-center justify-center gap-1 p-1 bg-zinc-900/80 rounded-full border border-white/5 mb-3">
                <button
                  onClick={() => setActiveTab("controls")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    activeTab === "controls"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sliders size={12} />
                  <span>Controls</span>
                </button>

                <button
                  onClick={() => setActiveTab("assistant")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    activeTab === "assistant"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Bot size={12} />
                  <span>AI Assistant</span>
                </button>

                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    activeTab === "notes"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileText size={12} />
                  <span>Notes</span>
                </button>
              </div>

              {/* Tab Pages */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* PAGE 1: QUICK CONTROLS */}
                {activeTab === "controls" && (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col gap-3 justify-between"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {/* Dictation Toggle Button */}
                      <button
                        onClick={handleToggleRecording}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                          isRecording
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-zinc-900/60 border-white/5 hover:border-white/20 text-zinc-200"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">
                            {isRecording ? "Stop Dictating" : "Start Dictating"}
                          </div>
                          <div className="text-[10px] text-zinc-400">Global Hotkey Active</div>
                        </div>
                      </button>

                      {/* Open Settings Button */}
                      <button
                        onClick={handleOpenSettings}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/20 text-zinc-200 text-left transition-all hover:bg-zinc-900"
                      >
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Settings size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Open Settings</div>
                          <div className="text-[10px] text-zinc-400">Models & Preferences</div>
                        </div>
                      </button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-medium">Operating Mode</span>
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/5 text-[11px]">
                        <span className="px-2 py-0.5 rounded text-indigo-300 bg-indigo-500/20 font-medium">
                          {state.settings.operatingMode.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Quick Transcript Snippet */}
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex-1 flex flex-col justify-center">
                      <div className="text-[10px] text-zinc-500 font-medium mb-1">RECENT TRANSCRIPT</div>
                      <p className="text-xs text-zinc-300 line-clamp-2 italic">
                        {state.partialTranscript || state.lastProcessedTranscript || "No recent dictation text..."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* PAGE 2: SCREEN AI ASSISTANT */}
                {activeTab === "assistant" && (
                  <motion.div
                    key="assistant"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col gap-2 overflow-hidden"
                  >
                    {/* Quick Prompt Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
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

                    {/* Response Card */}
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
                          <p>Ask a question or tap a preset above to analyze your active screen.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* PAGE 3: VOICE NOTES */}
                {activeTab === "notes" && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

