import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import type { AppState, RecordingState } from "../hooks/useAppState";

interface Props {
  state: AppState;
}

const stateConfig: Record<RecordingState, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  idle: {
    label: "Ready",
    color: "text-zinc-500",
    icon: <Mic size={18} className="text-zinc-500" />,
  },
  recording: {
    label: "Listening...",
    color: "text-zinc-300",
    icon: <Mic size={18} className="text-zinc-300" />,
  },
  transcribing: {
    label: "Transcribing...",
    color: "text-zinc-400",
    icon: <Loader2 size={18} className="text-zinc-400 animate-spin" />,
  },
  done: {
    label: "Done!",
    color: "text-zinc-100",
    icon: <CheckCircle2 size={18} className="text-zinc-100" />,
  },
  error: {
    label: "Error",
    color: "text-red-400",
    icon: <AlertCircle size={18} className="text-red-400" />,
  },
};

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[4px] h-8 ml-4">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="wave-bar"
          style={{ height: active ? undefined : "6px", width: "4px", borderRadius: "4px" }}
          animate={active ? {
            scaleY: [0.3, 1.8, 0.3],
            transition: {
              duration: 1.0,
              repeat: Infinity,
              delay: i * 0.05,
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
    <div className="flex items-end justify-center w-full h-full pb-10 animate-fade-in">
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ y: 0, opacity: isIdle ? 0 : 1, scale: 1, filter: "blur(0px)" }}
        exit={{ y: 20, opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
        className="relative max-w-lg w-full mx-6"
        style={{ pointerEvents: isIdle ? "none" : "all" }}
      >
        {/* Ambient Glow behind the panel */}
        <AnimatePresence>
          {isRecording &&              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-[32px] blur-3xl -z-10 bg-zinc-100"
              />
          }
        </AnimatePresence>

        <div className="glass-panel relative rounded-[28px] p-5 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4">
            <motion.div 
              className={`flex items-center justify-center w-12 h-12 rounded-[18px] relative ${isRecording ? 'bg-zinc-800' : 'bg-zinc-800/50 border border-zinc-700/50'}`}
              layout
            >
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-[18px] border-2 border-zinc-500/50 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-0 rounded-[18px] border-2 border-zinc-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                </>
              )}
              {config.icon}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[15px] font-semibold tracking-wide ${config.color}`}>
                  {config.label}
                </span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 uppercase tracking-wider bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                    REC
                  </span>
                )}
              </div>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5 truncate">
                {isRecording ? "Speak now — release hotkey to stop" :
                 recordingState === "transcribing" ? "Processing with Hybrid AI..." :
                 recordingState === "done" ? "Pasted to active window" :
                 recordingState === "error" ? (error ?? "Unknown error") :
                 "Press Cmd+Shift+Space to start"}
              </p>
            </div>

            {/* Waveform shown when recording */}
            <AnimatePresence>
              {isRecording && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}>
                  <WaveformBars active={isRecording} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {recordingState === "transcribing" && (
              <Sparkles size={22} className="text-zinc-400 animate-pulse ml-2" />
            )}
          </div>

          {/* Transcript display */}
          <AnimatePresence>
            {displayText && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-[18px] p-4 bg-black/40 border border-white/5">
                  <p className="text-[14px] text-white/90 font-medium leading-relaxed">
                    {displayText}
                    {partialTranscript && (
                      <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-1 animate-pulse align-middle rounded-full" />
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom strip: app brand */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2 opacity-60">
              <div className="w-4 h-4 rounded-full bg-zinc-700" />
              <span className="text-[11px] font-bold text-white tracking-[0.2em] uppercase">murmur</span>
            </div>
            {state.settings.voxcoderMode && (
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                VoxCoder Mode
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
