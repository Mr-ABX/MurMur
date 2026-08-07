import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { AppState } from "../hooks/useAppState";
import { motion } from "framer-motion";

function AiWaveVisualizer({
  active,
  level,
  isTranscribing,
}: {
  active: boolean;
  level: number;
  isTranscribing: boolean;
}) {
  const barsCount = 21;

  return (
    <div className="flex items-center justify-center gap-[3px] h-4 w-full px-1 overflow-hidden">
      {Array.from({ length: barsCount }, (_, i) => {
        const distFromCenter = Math.abs(i - (barsCount - 1) / 2) / ((barsCount - 1) / 2);
        const centerWeight = Math.cos(distFromCenter * (Math.PI / 2));

        // Base active wave height + audio level boost
        const baseCenter = Math.max(0.35, centerWeight * 0.9);
        const voiceBoost = level * 1.5;

        // Vibrant AI color palette (Indigo, Violet, Fuchsia, Cyan, Emerald)
        const colors = [
          "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.85)]",
          "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.85)]",
          "bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.85)]",
          "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.85)]",
          "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.85)]",
        ];
        const barColor = colors[i % colors.length];

        const h1 = `${Math.min(17, Math.max(4, 16 * (baseCenter * 0.4 + voiceBoost)))}px`;
        const h2 = `${Math.min(17, Math.max(5, 16 * (baseCenter * 1.0 + voiceBoost)))}px`;
        const h3 = `${Math.min(17, Math.max(4, 16 * (baseCenter * 0.6 + voiceBoost)))}px`;

        return (
          <motion.div
            key={i}
            className={`w-[2.5px] rounded-full ${
              isTranscribing ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.85)]" : barColor
            }`}
            animate={
              active
                ? {
                    height: [h1, h2, h3, h1],
                    transition: {
                      duration: 0.35 + (i % 5) * 0.06,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    },
                  }
                : isTranscribing
                ? {
                    height: ["3px", "12px", "3px"],
                    transition: {
                      duration: 0.7,
                      repeat: Infinity,
                      delay: i * 0.03,
                      ease: "easeInOut",
                    },
                  }
                : { height: "2px", opacity: 0.2 }
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
        className={`bg-black flex items-center justify-center px-3 py-0 pointer-events-auto transition-all duration-300 border-none outline-none ${
          notchStyle === "macbook"
            ? "rounded-b-[12px] rounded-t-none mt-0 shadow-none"
            : "rounded-full mt-1 bg-black shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        }`}
        data-tauri-drag-region
        style={{
          width: isInteracting ? "280px" : "200px",
          height: notchStyle === "macbook" ? "26px" : "28px",
        }}
      >
        <AiWaveVisualizer
          active={isInteracting}
          level={audioLevel}
          isTranscribing={isTranscribing}
        />
      </motion.div>
    </div>
  );
}
