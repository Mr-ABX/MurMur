import { motion } from "framer-motion";
import { Mic, Settings, Power } from "lucide-react";
import type { AppState } from "../hooks/useAppState";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  state: AppState;
  onOpenSettings: () => void;
}

export default function TrayMenu({ state, onOpenSettings }: Props) {
  const { recordingState, settings } = state;

  const isRecording = recordingState === "recording";

  const handleQuit = async () => {
    await invoke("quit_app");
  };

  return (
    <div
      className="flex flex-col py-1 min-w-[200px] rounded-xl overflow-hidden animate-fade-in"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 1px var(--border-strong)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-murmur-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
            <Mic size={14} className="text-zinc-300" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-murmur-text leading-none">Murmur</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`status-dot ${isRecording ? "bg-red-500 animate-pulse" : "bg-murmur-accent"}`} />
              <p className="text-xs text-murmur-muted">{isRecording ? "Recording..." : "Ready"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotkey reminder */}
      <div className="px-4 py-2.5 border-b border-murmur-border/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-murmur-muted">Start recording</span>
          <div className="flex items-center gap-1">
            {["⌘", "⇧", "Space"].map((k) => (
              <kbd key={k} className="px-1.5 py-0.5 text-xs rounded font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                {k}
              </kbd>
            ))}
          </div>
        </div>
      </div>

      {/* VoxCoder toggle */}
      <div className="px-4 py-2.5 border-b border-murmur-border/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-murmur-muted">VoxCoder Mode</span>
          <button
            onClick={() => state.updateSettings({ voxcoderMode: !settings.voxcoderMode })}
            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
              settings.voxcoderMode
                ? "bg-zinc-800 text-zinc-200 border border-zinc-600"
                : "bg-zinc-900/50 text-zinc-500 border border-zinc-800"
            }`}
          >
            {settings.voxcoderMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <motion.button
          whileHover={{ background: "var(--bg-surface-elevated)" }}
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
        >
          <Settings size={14} className="text-murmur-muted" />
          <span className="text-sm text-murmur-text">Settings</span>
        </motion.button>

        <motion.button
          whileHover={{ background: "rgba(239, 68, 68, 0.1)" }}
          onClick={handleQuit}
          className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
        >
          <Power size={14} className="text-murmur-danger/70" />
          <span className="text-sm text-murmur-danger/80">Quit Murmur</span>
        </motion.button>
      </div>
    </div>
  );
}
