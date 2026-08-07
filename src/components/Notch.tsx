import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { AppState } from "../hooks/useAppState";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/murmur_icon.png";

function WaveformBars({ active, level }: { active: boolean; level: number }) {
  const barColors = [
    "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]",
    "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]",
    "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]",
    "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  ];

  return (
    <div className="flex items-center gap-[2.5px] h-3.5 mx-1.5">
      {Array.from({ length: 7 }, (_, i) => {
        const heightMultiplier = Math.max(0.2, level * 2.5);
        return (
          <motion.div
            key={i}
            className={`w-[2.5px] rounded-full ${barColors[i % barColors.length]}`}
            animate={
              active
                ? {
                    height: ["3px", `${Math.min(14, Math.max(4, 14 * heightMultiplier))}px`, "3px"],
                    transition: {
                      duration: 0.25 + (i % 3) * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
                : { height: "3px" }
            }
          />
        );
      })}
    </div>
  );
}

export default function Notch({ state }: { state: AppState }) {
  const [audioLevel, setAudioLevel] = useState(0);

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
  const isTranscribing = state.recordingState === "transcribing";
  const isInteracting = isRecording || audioLevel > 0.03;
  const notchStyle = state.settings.notchStyle ?? "macbook";

  return (
    <div
      className="flex items-start justify-center w-screen h-screen bg-transparent overflow-hidden select-none"
      data-tauri-drag-region
    >
      <motion.div
        layout
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`bg-black flex items-center justify-between px-2.5 py-0 pointer-events-auto transition-all duration-300 ${
          notchStyle === "macbook"
            ? "rounded-b-[10px] rounded-t-none mt-0 border-x border-b border-white/10 border-t-0 shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            : "rounded-full mt-1 border border-white/15 bg-black shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
        }`}
        data-tauri-drag-region
        style={{
          minWidth: isInteracting ? "140px" : "95px",
          height: notchStyle === "macbook" ? "24px" : "26px",
        }}
      >
        {/* Brand Icon / Logo */}
        <motion.div
          animate={{ scale: isInteracting ? 1.08 + audioLevel * 0.15 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="flex items-center justify-center shrink-0"
        >
          <img
            src={logo}
            alt="Murmur"
            className="w-3.5 h-3.5 rounded-full pointer-events-none object-cover"
          />
        </motion.div>

        {/* Dynamic visualizer / status */}
        <div className="flex-1 flex justify-end items-center pointer-events-none pl-1.5 space-x-1.5">
          <AnimatePresence mode="wait">
            {isInteracting ? (
              <motion.div
                key="waveform"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <WaveformBars active={true} level={audioLevel} />
              </motion.div>
            ) : isTranscribing ? (
              <motion.div
                key="transcribing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-1"
              >
                <span className="text-[10px] font-medium text-blue-400">Processing</span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-1"
              >
                <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                  Murmur
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 shadow-[0_0_5px_rgba(16,185,129,0.7)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

