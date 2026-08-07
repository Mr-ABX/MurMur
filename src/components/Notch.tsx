import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { AppState } from "../hooks/useAppState";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/murmur_icon.png";

function WaveformBars({ active, level }: { active: boolean; level: number }) {
  return (
    <div className="flex items-center gap-[3px] h-4 mx-2">
      {Array.from({ length: 7 }, (_, i) => {
        const heightMultiplier = 1 + level * 2;
        return (
          <motion.div
            key={i}
            className="bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
            style={{ height: active ? "12px" : "3px", width: "3px", borderRadius: "3px" }}
            animate={
              active
                ? {
                    scaleY: [0.3 * heightMultiplier, 1.2 * heightMultiplier, 0.3 * heightMultiplier],
                    transition: {
                      duration: 0.6 + i * 0.05,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeInOut",
                    },
                  }
                : { scaleY: 1 }
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
  const isInteracting = isRecording || audioLevel > 0.05;
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
        className={`bg-black shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex items-center justify-between px-3.5 py-1.5 pointer-events-auto transition-all duration-300 ${
          notchStyle === "macbook"
            ? "rounded-b-[18px] rounded-t-none mt-0 border-x border-b border-white/10 border-t-0"
            : "rounded-full mt-2 border border-white/20 backdrop-blur-2xl bg-black/95 shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
        }`}
        data-tauri-drag-region
        style={{
          minWidth: isInteracting ? "160px" : "110px",
          height: "34px",
        }}
      >
        {/* Brand Icon / Logo */}
        <motion.div
          animate={{ scale: isInteracting ? 1.1 + audioLevel * 0.25 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="flex items-center justify-center shrink-0"
        >
          <img
            src={logo}
            alt="Murmur"
            className="w-5 h-5 rounded-full pointer-events-none object-cover shadow-sm"
          />
        </motion.div>

        {/* Dynamic visualizer / status */}
        <div className="flex-1 flex justify-end items-center pointer-events-none pl-2 space-x-2">
          <AnimatePresence mode="wait">
            {isInteracting ? (
              <motion.div
                key="waveform"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
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
                className="flex items-center space-x-1.5"
              >
                <span className="text-[11px] font-medium text-blue-400">Processing...</span>
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-1.5"
              >
                <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  Murmur
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

