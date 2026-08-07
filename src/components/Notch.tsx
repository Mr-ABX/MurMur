import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { AppState } from "../hooks/useAppState";
import { motion } from "framer-motion";

function SingleLineAiWave({ level, isRecording }: { level: number; isRecording: boolean }) {
  const [phase, setPhase] = useState(0);
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  useEffect(() => {
    let animId: number;
    const animate = () => {
      // Super slow when idle (0.015), fast active speed when dictating (0.085)
      const step = isRecordingRef.current ? 0.085 : 0.015;
      setPhase((prev) => (prev + step) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const width = 220;
  const height = 18;
  const points = 45;
  // Subtle 1.2px idle wave vs DRAMATIC 7px base + up to 15px voice peak surge when dictating!
  const amp = isRecording ? 7 + Math.min(10, level * 14) : 1.2;

  // Build primary wave path
  let pathD = "";
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const normX = i / points;
    const envelope = Math.sin(normX * Math.PI); // Smooth 0 at edges
    const y = height / 2 + Math.sin(normX * Math.PI * 2.5 + phase) * amp * envelope;

    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  }

  // Build secondary offset wave path
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

        {/* Accent background line */}
        <path
          d={pathD2}
          fill="none"
          stroke="url(#aiWaveGrad)"
          strokeWidth="0.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        {/* Primary glowing single AI wave line */}
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
        className={`flex items-center justify-center px-4 py-0 pointer-events-auto transition-all duration-300 border-none outline-none ${
          notchStyle === "macbook"
            ? "rounded-b-[12px] rounded-t-none mt-0 shadow-none"
            : "rounded-full mt-1 shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        }`}
        data-tauri-drag-region
        style={{
          backgroundColor: "#000000",
          width: isInteracting ? "280px" : "240px",
          height: notchStyle === "macbook" ? "25px" : "27px",
        }}
      >
        <SingleLineAiWave level={audioLevel} isRecording={isInteracting} />
      </motion.div>
    </div>
  );
}
