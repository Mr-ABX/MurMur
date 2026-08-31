import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppState } from "../hooks/useAppState";
import { ModernSelect } from "./ModernSelect";
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
  Unlock
} from "lucide-react";

function SingleLineAiWave({ level, isRecording, isExpanded }: { level: number; isRecording: boolean; isExpanded: boolean }) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);

  const levelRef = useRef(level);
  const isRecordingRef = useRef(isRecording);
  const isExpandedRef = useRef(isExpanded);

  levelRef.current = level;
  isRecordingRef.current = isRecording;
  isExpandedRef.current = isExpanded;

  useEffect(() => {
    let animId: number;
    let phase = 0;
    let currentAmp = 1.5;
    const points = 60;

    const animate = () => {
      const rec = isRecordingRef.current;
      const lvl = levelRef.current;
      const exp = isExpandedRef.current;

      const width = exp ? 380 : 220;
      const height = 28;

      // Ultra-dynamic vocal surge: swells up boldly with speech intensity
      const targetAmp = rec ? (3.0 + lvl * 14.0) : (exp ? 2.2 : (lvl > 0.04 ? 1.5 + lvl * 8.0 : 1.2));
      // Rapid attack, smooth decay
      currentAmp += (targetAmp - currentAmp) * (targetAmp > currentAmp ? 0.45 : 0.22);

      // Phase step: accelerates dynamically with voice intensity
      const step = rec ? (0.04 + lvl * 0.28) : 0.015;
      phase = (phase + step) % (Math.PI * 2);

      // 1. Primary glowing multi-color ribbon
      let d1 = "";
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = i / points;
        const envelope = Math.sin(normX * Math.PI);
        const y =
          height / 2 +
          (Math.sin(normX * Math.PI * 2.8 + phase) * 0.72 +
            Math.sin(normX * Math.PI * 5.2 - phase * 1.5) * 0.28) *
            currentAmp *
            envelope;
        d1 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
      }
      if (path1Ref.current) {
        path1Ref.current.setAttribute("d", d1);
        if (rec) {
          path1Ref.current.setAttribute("stroke-width", (1.0 + lvl * 2.0).toFixed(2));
          path1Ref.current.setAttribute("stroke-opacity", (0.85 + lvl * 0.15).toFixed(2));
        } else {
          path1Ref.current.setAttribute("stroke-width", "0.85");
          path1Ref.current.setAttribute("stroke-opacity", "0.6");
        }
      }

      // 2. Harmonic secondary ribbon
      let d2 = "";
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = i / points;
        const envelope = Math.sin(normX * Math.PI);
        const y =
          height / 2 +
          (Math.cos(normX * Math.PI * 2.2 - phase * 0.8) * 0.6 +
            Math.cos(normX * Math.PI * 4.4 + phase * 1.3) * 0.4) *
            (currentAmp * 0.75) *
            envelope;
        d2 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
      }
      if (path2Ref.current) {
        path2Ref.current.setAttribute("d", d2);
      }

      // 3. Core sharp white laser beam
      if (path3Ref.current) {
        if (rec || lvl > 0.05) {
          let d3 = "";
          for (let i = 0; i <= points; i++) {
            const x = (i / points) * width;
            const normX = i / points;
            const envelope = Math.pow(Math.sin(normX * Math.PI), 2);
            const y =
              height / 2 +
              Math.sin(normX * Math.PI * 6.5 + phase * 2.0) * (currentAmp * 0.55) * envelope;
            d3 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
          }
          path3Ref.current.setAttribute("d", d3);
          path3Ref.current.setAttribute("stroke-opacity", Math.min(0.98, 0.4 + lvl * 0.8).toFixed(2));
        } else {
          path3Ref.current.setAttribute("d", "");
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const width = isExpanded ? 380 : 220;
  const height = 28;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible px-1">
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="aiWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="15%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#c084fc" stopOpacity="1" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="1" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="85%" stopColor="#34d399" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>

          <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={path2Ref}
          fill="none"
          stroke="url(#aiWaveGrad)"
          strokeWidth="0.6"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        <path
          ref={path1Ref}
          fill="none"
          stroke="url(#aiWaveGrad)"
          strokeWidth="0.85"
          strokeOpacity="0.7"
          strokeLinecap="round"
          filter="url(#aiGlow)"
        />

        <path
          ref={path3Ref}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeOpacity="0"
          strokeLinecap="round"
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

  const lastSwipeRef = useRef(0);
  const selectedModel = state.settings.localAssistantModel || "gemini-2.0-flash-lite-preview-02-05";
  const isRecording = state.recordingState === "recording";
  const isInteracting = isRecording || audioLevel > 0.02;
  const notchStyle = state.settings.notchStyle ?? "macbook";

  // Continuous Web Audio Analyzer (stays active for instantaneous 0ms audio reaction)
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let animId: number;
    let isCancelled = false;

    const startContinuousMic = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyser || isCancelled) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          let maxVal = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
            if (dataArray[i] > maxVal) maxVal = dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, Math.max(0, (avg * 0.6 + maxVal * 0.4) / 90));
          setAudioLevel(normalized);

          animId = requestAnimationFrame(update);
        };

        update();
      } catch {
        // Fallback gracefully to Tauri IPC audio level if browser mic access isn't permitted
      }
    };

    startContinuousMic();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    invoke("set_notch_expanded", { expanded: isExpanded }).catch((err) => {
      console.warn("set_notch_expanded IPC warning:", err);
    });
    if (isExpanded) {
      getCurrentWindow().setFocus().catch(() => {});
    }
  }, [isExpanded]);

  // Listen to Tauri backend audio level events as native fallback
  useEffect(() => {
    const unlistenAudio = listen<number>("audio_level", (e) => {
      const level = Math.min(Math.max(e.payload, 0), 1);
      setAudioLevel((prev) => (prev > level ? prev * 0.9 : level));
    });

    // Auto-collapse whenever the user clicks outside the notch (window loses focus/blur)
    const unlistenBlur = getCurrentWindow().listen("tauri://blur", () => {
      if (!isLocked) {
        setIsExpanded(false);
      }
    });

    return () => {
      unlistenAudio.then((fn) => fn());
      unlistenBlur.then((fn) => fn());
    };
  }, [isRecording, isLocked]);

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    // Vertical scrolling: do e.stopPropagation() to allow smooth up/down content scrolling
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.stopPropagation();
      return;
    }

    // Horizontal trackpad swipe: switch pages
    if (Math.abs(e.deltaX) > 18 && now - lastSwipeRef.current > 400) {
      e.stopPropagation();
      lastSwipeRef.current = now;
      if (e.deltaX > 0) {
        setPageIndex((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : 0));
      } else {
        setPageIndex((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2) : 2));
      }
    }
  };

  const handleModelChange = async (newModel: string) => {
    const updatedSettings = { ...state.settings, localAssistantModel: newModel };
    state.settings.localAssistantModel = newModel;
    try {
      await invoke("save_settings", { settings: updatedSettings });
    } catch (err) {
      console.error("Failed to save assistant model:", err);
    }
  };

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
      className="flex items-start justify-center w-full h-full bg-transparent overflow-hidden select-none"
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded ? 440 : isInteracting ? 280 : 240,
          height: isExpanded ? 270 : notchStyle === "macbook" ? 26 : 28,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 32,
          mass: 0.8,
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`relative mx-auto flex flex-col items-center border-none outline-none overflow-hidden transition-colors ${
          notchStyle === "macbook"
            ? `${isExpanded ? "rounded-b-[12px]" : "rounded-b-[10px]"} rounded-t-none border-x border-b border-white/[0.14] ring-1 ring-white/5 ring-inset`
            : `${isExpanded ? "rounded-[12px]" : "rounded-[11px]"} border border-white/[0.14] ring-1 ring-white/5 ring-inset`
        } ${!isExpanded ? "cursor-pointer hover:bg-zinc-950" : ""}`}
        style={{
          backgroundColor: "#000000",
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
                <div
                  className="flex-1 flex flex-col overflow-y-auto pr-0.5 no-scrollbar pointer-events-auto"
                  onWheel={handleWheel}
                >
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
                          {state.partialTranscript || state.transcript || "No recent voice dictation recorded..."}
                        </p>
                        {(state.partialTranscript || state.transcript) && (
                          <button
                            onClick={() => {
                              const text = state.partialTranscript || state.transcript;
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
                      {/* Model Selector Bar */}
                      <div className="flex items-center justify-between gap-1.5 px-2 py-1 bg-zinc-950/80 rounded-xl border border-white/5">
                        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                          <Bot size={12} className="text-indigo-400" />
                          Model
                        </span>
                        <div className="w-56">
                          <ModernSelect
                            size="sm"
                            value={selectedModel}
                            onChange={(val) => handleModelChange(val)}
                            options={[
                              { value: "gemini-2.0-flash-lite-preview-02-05", label: "⚡ Gemini 2.0 Flash (Cloud API)" },
                              { value: "gemini-1.5-flash", label: "⚡ Gemini 1.5 Flash (Cloud API)" },
                              { value: "gemma:2b", label: "🧠 Gemma 2B (Local Ollama)" },
                              { value: "gemma:7b", label: "🧠 Gemma 7B (Local Ollama)" },
                              { value: "gemma4", label: "🧠 Gemma 4 (Local Ollama)" },
                            ]}
                          />
                        </div>
                      </div>

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
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-zinc-900/90 rounded-xl border border-white/10 p-1.5 relative z-20 cursor-text"
                      >
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Ask Screen AI Assistant..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 px-2 outline-none cursor-text select-text"
                        />
                        <button
                          type="submit"
                          disabled={isAsking || !prompt.trim()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
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
                        {state.transcript ? (
                          <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5 flex items-start justify-between gap-2">
                            <p className="text-xs text-zinc-200">{state.transcript}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(state.transcript);
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
              <div className="flex items-center justify-center pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageIndex(0)}
                    className={`h-2 rounded-full transition-all ${
                      pageIndex === 0 ? "bg-indigo-400 w-5" : "bg-zinc-600 hover:bg-zinc-400 w-2"
                    }`}
                  />
                  <button
                    onClick={() => setPageIndex(1)}
                    className={`h-2 rounded-full transition-all ${
                      pageIndex === 1 ? "bg-purple-400 w-5" : "bg-zinc-600 hover:bg-zinc-400 w-2"
                    }`}
                  />
                  <button
                    onClick={() => setPageIndex(2)}
                    className={`h-2 rounded-full transition-all ${
                      pageIndex === 2 ? "bg-emerald-400 w-5" : "bg-zinc-600 hover:bg-zinc-400 w-2"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
