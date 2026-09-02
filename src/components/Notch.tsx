import { useEffect, useState, useRef, MutableRefObject } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppState, AppSettings } from "../hooks/useAppState";
import { useHandyAudioEngine } from "../hooks/useHandyAudioEngine";
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

function SingleLineAiWave({
  isRecording: propIsRecording,
  isExpanded,
  levelRef,
  notchStyle = "dynamicisland",
}: {
  isRecording: boolean;
  isExpanded: boolean;
  levelRef: MutableRefObject<number>;
  notchStyle?: "macbook" | "dynamicisland";
}) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isExpandedRef = useRef(isExpanded);
  const isRecordingRef = useRef(propIsRecording);
  const isIsland = notchStyle === "dynamicisland";

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    isRecordingRef.current = propIsRecording;
  }, [propIsRecording]);

  // Direct native event listener to guarantee 0ms recording state sync
  useEffect(() => {
    let unlistenStart: (() => void) | null = null;
    let unlistenStop: (() => void) | null = null;

    listen("murmur://recording-started", () => {
      isRecordingRef.current = true;
    }).then((fn) => {
      unlistenStart = fn;
    });

    listen("murmur://recording-stopped", () => {
      isRecordingRef.current = false;
    }).then((fn) => {
      unlistenStop = fn;
    });

    return () => {
      if (unlistenStart) unlistenStart();
      if (unlistenStop) unlistenStop();
    };
  }, []);

  useEffect(() => {
    let animId: number;
    let phase = 0;
    let currentAmp = 1.2;
    const points = 64;
    let currentWidth = isIsland ? 140 : 210;
    let currentHeight = isIsland ? 24 : 28;

    const animate = () => {
      const rec = isRecordingRef.current;
      const exp = isExpandedRef.current;
      const nowSec = Date.now() * 0.001;

      // === FAST FAKE ANIMATION LOOP ===
      const fastSyllable = Math.sin(nowSec * 14.0) * 0.5 + 0.5;
      const fastCadence = Math.cos(nowSec * 8.5) * 0.5 + 0.5;
      const fastBurst = (Math.sin(nowSec * 22.0) * Math.cos(nowSec * 12.0)) * 0.5 + 0.5;
      
      const voiceIntensity = rec
        ? 0.35 + (fastSyllable * 0.40 + fastCadence * 0.35 + fastBurst * 0.25) * 0.65
        : 0;

      const targetWidth = exp
        ? (isIsland ? 330 : 380)
        : rec
        ? (isIsland ? 170 : 250)
        : (isIsland ? 120 : 180);
      const targetHeight = rec
        ? (isIsland ? 30 : 34)
        : (isIsland ? 24 : 28);
      currentWidth += (targetWidth - currentWidth) * 0.15;
      currentHeight += (targetHeight - currentHeight) * 0.15;
      const midY = currentHeight / 2;

      // Update SVG viewBox dynamically in rAF to stay in sync with path rendering
      if (svgRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${currentWidth.toFixed(1)} ${currentHeight.toFixed(1)}`);
      }

      // When recording: surges based on fake voice intensity
      // When idle: gentle 1.2px breathing wave
      const targetAmp = rec
        ? Math.min(isIsland ? 10.5 : 13.5, (isIsland ? 4.0 : 5.5) + voiceIntensity * (isIsland ? 8.5 : 12.0))
        : (exp ? 2.0 : 1.2);

      currentAmp += (targetAmp - currentAmp) * (targetAmp > currentAmp ? 0.85 : 0.20);

      const step = rec ? (0.12 + voiceIntensity * 0.28) : 0.02;
      phase = (phase + step) % (Math.PI * 2);

      // 1. Primary multi-color glowing ribbon
      let d1 = "";
      for (let i = 0; i <= points; i++) {
        const normX = i / points;
        const x = normX * currentWidth;
        const envelope = Math.pow(Math.sin(normX * Math.PI), 0.90);
        const y =
          midY +
          (Math.sin(normX * Math.PI * 3.0 + phase) * 0.72 +
            Math.sin(normX * Math.PI * 5.6 - phase * 1.4) * 0.28) *
            currentAmp *
            envelope;
        d1 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
      }
      if (path1Ref.current) {
        path1Ref.current.setAttribute("d", d1);
        if (rec) {
          path1Ref.current.setAttribute("stroke-width", (3.0 + voiceIntensity * 2.0).toFixed(2));
          path1Ref.current.setAttribute("stroke-opacity", "1.0");
          path1Ref.current.style.filter = `drop-shadow(0 0 ${(8.0 + voiceIntensity * 12.0).toFixed(1)}px rgba(168, 85, 247, 1.0))`;
        } else {
          path1Ref.current.setAttribute("stroke-width", "1.6");
          path1Ref.current.setAttribute("stroke-opacity", "0.60");
          path1Ref.current.style.filter = "none";
        }
      }

      // 2. Harmonic secondary ribbon
      let d2 = "";
      for (let i = 0; i <= points; i++) {
        const normX = i / points;
        const x = normX * currentWidth;
        const envelope = Math.pow(Math.sin(normX * Math.PI), 0.90);
        const y =
          midY +
          (Math.cos(normX * Math.PI * 2.4 - phase * 0.9) * 0.65 +
            Math.cos(normX * Math.PI * 4.8 + phase * 1.2) * 0.35) *
            (currentAmp * 0.82) *
            envelope;
        d2 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
      }
      if (path2Ref.current) {
        path2Ref.current.setAttribute("d", d2);
        if (rec) {
          path2Ref.current.setAttribute("stroke-width", (2.2 + voiceIntensity * 1.5).toFixed(2));
          path2Ref.current.setAttribute("stroke-opacity", "0.95");
        } else {
          path2Ref.current.setAttribute("stroke-width", "1.2");
          path2Ref.current.setAttribute("stroke-opacity", "0.40");
        }
      }

      // 3. Core white laser line (pops with high voice intensity)
      if (path3Ref.current) {
        if (rec && voiceIntensity > 0.25) {
          let d3 = "";
          for (let i = 0; i <= points; i++) {
            const normX = i / points;
            const x = normX * currentWidth;
            const envelope = Math.pow(Math.sin(normX * Math.PI), 1.2);
            const y =
              midY +
              Math.sin(normX * Math.PI * 4.2 + phase * 1.6) * (currentAmp * 0.60) * envelope;
            d3 += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(2)}` : ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
          }
          path3Ref.current.setAttribute("d", d3);
          path3Ref.current.setAttribute("stroke-width", (1.8 + voiceIntensity * 1.5).toFixed(2));
          path3Ref.current.setAttribute("stroke-opacity", "0.95");
          path3Ref.current.style.filter = `drop-shadow(0 0 ${(4.0 + voiceIntensity * 8.0).toFixed(1)}px #ffffff)`;
        } else {
          path3Ref.current.setAttribute("d", "");
          path3Ref.current.setAttribute("stroke-opacity", "0");
          path3Ref.current.style.filter = "none";
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [levelRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible px-1">
      <svg
        ref={svgRef}
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${propIsRecording ? 300 : 240} ${propIsRecording ? 38 : 30}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="aiWaveGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
            <stop offset="15%" stopColor="#818cf8" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#c084fc" stopOpacity="1" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="1" />
            <stop offset="68%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="85%" stopColor="#34d399" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="aiWaveGradSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="20%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
            <stop offset="80%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Secondary intertwined ribbon */}
        <path
          ref={path2Ref}
          fill="none"
          stroke="url(#aiWaveGradSecondary)"
          strokeWidth="1.4"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />

        {/* Primary vibrant multi-color ribbon */}
        <path
          ref={path1Ref}
          fill="none"
          stroke="url(#aiWaveGradPrimary)"
          strokeWidth="2.4"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />

        {/* Core crisp laser line — opacity controlled entirely by rAF loop */}
        <path
          ref={path3Ref}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}


interface VisualizerProps {
  isRecording: boolean;
  levelRef?: MutableRefObject<number>;
  bandsRef?: MutableRefObject<Float32Array | number[]>;
  notchStyle?: "macbook" | "dynamicisland";
}

// -------------------------------------------------------------
// Component 2: 9-Bar Symmetrical Equalizer (Handy / Freeflow Style)
// -------------------------------------------------------------
function EqualizerBars({ isRecording, notchStyle = "macbook" }: VisualizerProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const isIsland = notchStyle === "dynamicisland";

  const numBars = 9;
  const barGradients = [
    "from-indigo-500 to-purple-400",
    "from-indigo-400 to-sky-400",
    "from-sky-400 to-cyan-300",
    "from-cyan-400 to-emerald-300",
    "from-purple-500 to-pink-400",
    "from-cyan-400 to-emerald-300",
    "from-sky-400 to-cyan-300",
    "from-indigo-400 to-sky-400",
    "from-indigo-500 to-purple-400",
  ];

  useEffect(() => {
    const animate = () => {
      timeRef.current += isRecording ? 0.14 : 0.03;
      const t = timeRef.current;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        let h = 4.0;
        if (isRecording) {
          const speedMod = 1.0 + (i % 3) * 0.4;
          const sine1 = Math.sin(t * speedMod + i * 0.9);
          const sine2 = Math.cos(t * 0.7 - i * 0.6);
          const normalized = (sine1 * 0.5 + sine2 * 0.5 + 1.0) / 2.0;
          h = 4.0 + normalized * (isIsland ? 14.0 : 16.0);
        } else {
          h = 4.0 + Math.sin(t + i * 0.5) * 1.5;
        }

        bar.style.height = `${Math.max(4.0, h)}px`;
        bar.style.opacity = isRecording ? "1" : "0.45";
      });

      animFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRecording, isIsland]);

  return (
    <div className={`flex items-center justify-center ${isIsland ? "gap-[3.5px] h-[22px]" : "gap-[4.5px] h-[24px]"}`}>
      {barGradients.slice(0, numBars).map((grad, idx) => (
        <div
          key={idx}
          ref={(el) => (barsRef.current[idx] = el)}
          style={{ height: "4.0px" }}
          className={`${isIsland ? "w-[3.5px]" : "w-[4.5px]"} rounded-full bg-gradient-to-t ${grad} shadow-sm shadow-indigo-500/30 transition-opacity`}
        />
      ))}
    </div>
  );
}

export default function Notch({ state }: { state: AppState }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pageIndex, setPageIndex] = useState<0 | 1 | 2>(0);
  const [localIsRecording, setLocalIsRecording] = useState(false);
  const [liveSettings, setLiveSettings] = useState<AppSettings>(state.settings);

  // Sync with prop updates
  useEffect(() => {
    if (state.settings) {
      setLiveSettings(state.settings);
    }
  }, [state.settings]);

  // Direct reactive IPC listener to guarantee 0ms instant updates across windows
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<AppSettings>("murmur://settings-updated", (e) => {
      if (e.payload) {
        setLiveSettings(e.payload);
      }
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Assistant state
  const [prompt, setPrompt] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastSwipeRef = useRef(0);
  const activeSettings = liveSettings || state.settings;
  const selectedModel = activeSettings.localAssistantModel || "gemini-2.0-flash-lite-preview-02-05";
  const isRecording = localIsRecording || state.recordingState === "recording";
  const notchStyle = activeSettings.notchStyle ?? "dynamicisland";
  const visualizerStyle = activeSettings.visualizerStyle ?? "wave";
  const isInteracting = isRecording;
  const isDynamicIsland = notchStyle === "dynamicisland";

  // 🎤 Real native CoreAudio 60 FPS audio engine — levelRef and bandsRef are updated
  // directly from Rust "murmur://audio-snapshot" IPC events at 60 FPS.
  const { levelRef, bandsRef } = useHandyAudioEngine(isRecording);

  useEffect(() => {
    let unlistenStart: (() => void) | null = null;
    let unlistenStop: (() => void) | null = null;

    listen("murmur://recording-started", () => {
      setLocalIsRecording(true);
    }).then((fn) => {
      unlistenStart = fn;
    });

    listen("murmur://recording-stopped", () => {
      setLocalIsRecording(false);
    }).then((fn) => {
      unlistenStop = fn;
    });

    return () => {
      if (unlistenStart) unlistenStart();
      if (unlistenStop) unlistenStop();
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      invoke("set_notch_expanded", { expanded: true }).catch((err) => {
        console.warn("set_notch_expanded IPC warning:", err);
      });
      getCurrentWindow().setFocus().catch(() => {});
    } else {
      // Delay shrinking native NSWindow by 220ms so Framer Motion spring finishes collapsing smoothly without clipping!
      const timer = setTimeout(() => {
        invoke("set_notch_expanded", { expanded: false }).catch((err) => {
          console.warn("set_notch_expanded IPC warning:", err);
        });
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  useEffect(() => {
    let unlistenBlurFn: (() => void) | null = null;
    getCurrentWindow().listen("tauri://blur", () => {
      if (!isLocked) {
        setIsExpanded(false);
      }
    }).then((fn) => {
      unlistenBlurFn = fn;
    });

    return () => {
      if (unlistenBlurFn) unlistenBlurFn();
    };
  }, [isLocked]);

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
      if (e.deltaX > 0) {
        // swipe left -> next page
        setPageIndex((prev) => (prev < 2 ? (prev + 1) as 0 | 1 | 2 : 2));
      } else {
        // swipe right -> prev page
        setPageIndex((prev) => (prev > 0 ? (prev - 1) as 0 | 1 | 2 : 0));
      }
      lastSwipeRef.current = now;
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
      className="flex items-start justify-center w-full h-full bg-transparent overflow-visible select-none"
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded
            ? (isDynamicIsland ? 380 : 440)
            : isInteracting
            ? (isDynamicIsland ? 190 : 270)
            : (isDynamicIsland ? 140 : 210),
          height: isExpanded
            ? (isDynamicIsland ? 260 : 270)
            : isInteracting
            ? (isDynamicIsland ? 34 : 36)
            : (isDynamicIsland ? 28 : 30),
          marginTop: isDynamicIsland ? 6 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.7,
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`relative mx-auto flex flex-col items-center border-none outline-none overflow-hidden ${
          isDynamicIsland
            ? `${isExpanded ? "rounded-[24px]" : "rounded-full"} border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.75)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] ring-1 ring-white/10 ring-inset backdrop-blur-2xl`
            : `${isExpanded ? "rounded-b-[18px]" : isInteracting ? "rounded-b-[16px]" : "rounded-b-[14px]"} rounded-t-none border-x border-b border-white/[0.14] border-t-0 ring-1 ring-white/5 ring-inset shadow-2xl`
        } ${!isExpanded ? "cursor-pointer hover:brightness-110" : ""}`}
        style={{
          backgroundColor: "#000000",
        }}
      >
        {/* Top Header AI Wave Bar + Lock Toggle */}
        <div
          className={`w-full flex items-center justify-between ${isDynamicIsland ? "px-2.5" : "px-3"} ${
            isInteracting
              ? isDynamicIsland ? "h-[34px]" : "h-[36px]"
              : isDynamicIsland ? "h-[28px]" : "h-[30px]"
          } flex-shrink-0 cursor-pointer overflow-visible`}
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              setIsExpanded(false);
            }
          }}
        >
          <div className="flex-1 h-full flex items-center justify-center">
            {visualizerStyle === "bars" ? (
              <EqualizerBars isRecording={isRecording} levelRef={levelRef} bandsRef={bandsRef} notchStyle={notchStyle} />
            ) : (
              <SingleLineAiWave isRecording={isRecording} isExpanded={isExpanded} levelRef={levelRef} notchStyle={notchStyle} />
            )}
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

                        {/* 2. Open Dashboard Icon */}
                        <button
                          onClick={handleOpenSettings}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 text-indigo-400 flex items-center justify-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 group-hover:scale-105">
                            <Settings size={18} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium group-hover:text-zinc-200">
                            Dashboard
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

                      {/* Quick Appearance Controls: Visualizer Style & Notch Style */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Visualizer Style Switch */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-white/5 flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-400 font-medium">Visualizer</span>
                          <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-white/5">
                            <button
                              onClick={() => {
                                state.updateSettings({ visualizerStyle: "bars" });
                              }}
                              className={`flex-1 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                                visualizerStyle === "bars"
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              Bars
                            </button>
                            <button
                              onClick={() => {
                                state.updateSettings({ visualizerStyle: "wave" });
                              }}
                              className={`flex-1 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                                visualizerStyle === "wave"
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              AI Wave
                            </button>
                          </div>
                        </div>

                        {/* Notch Style Switch */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-white/5 flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-400 font-medium">Notch Style</span>
                          <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-white/5">
                            <button
                              onClick={() => {
                                state.updateSettings({ notchStyle: "macbook" });
                              }}
                              className={`flex-1 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                                notchStyle === "macbook"
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              MacBook
                            </button>
                            <button
                              onClick={() => {
                                state.updateSettings({ notchStyle: "dynamicisland" });
                              }}
                              className={`flex-1 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                                notchStyle === "dynamicisland"
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              Island
                            </button>
                          </div>
                        </div>
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
