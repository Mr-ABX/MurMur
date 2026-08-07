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
    <div className="flex items-center justify-center gap-[3px] h-3.5 w-full px-1 overflow-hidden">
      {Array.from({ length: barsCount }, (_, i) => {
        const distFromCenter = Math.abs(i - (barsCount - 1) / 2) / ((barsCount - 1) / 2);
        const centerWeight = Math.cos(distFromCenter * (Math.PI / 2));
        
        // Active base + dynamic voice peak scaling
        const dynamicAmp = active ? 0.35 + Math.min(0.65, level * 1.8) * centerWeight : 0.05;

        // Vibrant AI color palette (Indigo, Violet, Fuchsia, Cyan, Emerald)
        const colors = [
          "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.85)]",
          "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.85)]",
          "bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.85)]",
          "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.85)]",
          "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.85)]",
        ];
        const barColor = colors[i % colors.length];

        return (
          <motion.div
            key={i}
            className={`w-[2.5px] rounded-full ${
              isTranscribing ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.85)]" : barColor
            }`}
            animate={
              active
                ? {
                    height: [
                      `${Math.max(3, 14 * dynamicAmp * 0.35)}px`,
                      `${Math.min(15, Math.max(4, 15 * dynamicAmp))}px`,
                      `${Math.max(3, 14 * dynamicAmp * 0.35)}px`,
                    ],
                    transition: {
                      duration: 0.2 + (i % 4) * 0.04,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    },
                  }
                : isTranscribing
                ? {
                    height: ["3px", "10px", "3px"],
                    transition: {
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.04,
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
            ? "rounded-b-[10px] rounded-t-none mt-0 shadow-none"
            : "rounded-full mt-1 bg-black shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        }`}
        data-tauri-drag-region
        style={{
          width: isInteracting ? "280px" : "200px",
          height: notchStyle === "macbook" ? "24px" : "26px",
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
