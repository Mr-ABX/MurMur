import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, CheckCircle2, AlertCircle, Waves } from "lucide-react";
import type { AppState, RecordingState } from "../hooks/useAppState";

interface Props {
  state: AppState;
}

const stateConfig: Record<RecordingState, {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  idle: {
    label: "Ready",
    color: "text-murmur-muted",
    bg: "rgba(19, 19, 26, 0.9)",
    borderColor: "rgba(42, 42, 58, 0.8)",
    icon: <Mic size={18} className="text-murmur-muted" />,
  },
  recording: {
    label: "Listening...",
    color: "text-red-400",
    bg: "rgba(30, 15, 18, 0.95)",
    borderColor: "rgba(255, 71, 87, 0.4)",
    icon: <Mic size={18} className="text-red-400" />,
  },
  transcribing: {
    label: "Transcribing...",
    color: "text-murmur-primary",
    bg: "rgba(16, 14, 35, 0.95)",
    borderColor: "rgba(124, 106, 247, 0.4)",
    icon: <Loader2 size={18} className="text-murmur-primary animate-spin" />,
  },
  done: {
    label: "Done!",
    color: "text-murmur-accent",
    bg: "rgba(4, 26, 20, 0.95)",
    borderColor: "rgba(6, 214, 160, 0.4)",
    icon: <CheckCircle2 size={18} className="text-murmur-accent" />,
  },
  error: {
    label: "Error",
    color: "text-murmur-danger",
    bg: "rgba(30, 10, 12, 0.95)",
    borderColor: "rgba(255, 71, 87, 0.4)",
    icon: <AlertCircle size={18} className="text-murmur-danger" />,
  },
};

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="wave-bar"
          style={{ height: active ? undefined : "6px" }}
          animate={active ? {
            scaleY: [0.5, 1.5, 0.5],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeInOut",
            }
          } : { scaleY: 0.5 }}
        />
      ))}
    </div>
  );
}

export default function OverlayWindow({ state }: Props) {
  const { recordingState, transcript, partialTranscript, error } = state;
  const config = stateConfig[recordingState];
  const displayText = partialTranscript || transcript;
  const isRecording = recordingState === "recording";
  const isIdle = recordingState === "idle";

  return (
    <div className="flex items-end justify-center w-full h-full pb-8 animate-fade-in">
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: isIdle ? 0 : 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="relative max-w-lg w-full mx-6"
        style={{ pointerEvents: isIdle ? "none" : "all" }}
      >
        {/* Glow effect behind card */}
        {isRecording && (
          <div
            className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
            style={{ background: "radial-gradient(ellipse, #ff4757, transparent)" }}
          />
        )}

        <div
          className="relative rounded-2xl px-5 py-4 overflow-hidden"
          style={{
            background: config.bg,
            border: `1px solid ${config.borderColor}`,
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${config.borderColor}`,
          }}
        >
          {/* Recording pulse rings */}
          {isRecording && (
            <div className="absolute top-1/2 left-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center">
              <div className="pulse-ring" />
              <div className="pulse-ring" />
            </div>
          )}

          {/* Header row */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl
              ${isRecording ? "bg-red-500/20" : recordingState === "done" ? "bg-murmur-accent/20" : "bg-murmur-surface"}`}
            >
              {config.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {config.label}
                </span>
                {isRecording && (
                  <span className="flex items-center gap-1 text-xs text-red-400/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    REC
                  </span>
                )}
              </div>
              <p className="text-xs text-murmur-muted mt-0.5">
                {isRecording ? "Speak now — release hotkey to stop" :
                 recordingState === "transcribing" ? "Processing with Whisper..." :
                 recordingState === "done" ? "Text pasted to active window" :
                 recordingState === "error" ? (error ?? "Unknown error") :
                 "Press Cmd+Shift+Space to start"}
              </p>
            </div>

            {/* Waveform shown when recording */}
            {isRecording && <WaveformBars active={isRecording} />}

            {/* Waves icon when transcribing */}
            {recordingState === "transcribing" && (
              <Waves size={20} className="text-murmur-primary animate-pulse" />
            )}
          </div>

          {/* Transcript display */}
          <AnimatePresence>
            {displayText && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl px-4 py-3 mt-1"
                  style={{
                    background: "rgba(10, 10, 15, 0.6)",
                    border: "1px solid rgba(42, 42, 58, 0.5)",
                  }}
                >
                  <p className="text-sm text-murmur-text font-mono leading-relaxed line-clamp-4">
                    {displayText}
                    {partialTranscript && (
                      <span className="inline-block w-0.5 h-4 bg-murmur-primary ml-0.5 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom strip: app brand */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-murmur-border/30">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-murmur-primary to-murmur-accent" />
              <span className="text-xs font-medium text-murmur-muted tracking-wide">murmur</span>
            </div>
            {state.settings.voxcoderMode && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(124, 106, 247, 0.15)", color: "#9080ff", border: "1px solid rgba(124, 106, 247, 0.25)" }}>
                VoxCoder
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
