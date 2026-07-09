import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Mic, Cpu, Code2, Volume2, Globe, ChevronRight,
  Download, CheckCircle2, Loader2, Keyboard, ClipboardPaste, X, Cloud, Key, Trash2, FolderOpen
} from "lucide-react";
import type { AppState, WhisperModel } from "../hooks/useAppState";

interface Props {
  state: AppState;
}

const MODEL_INFO: Record<WhisperModel, { size: string; ram: string; speed: string; quality: string; description: string }> = {
  tiny: { size: "75 MB", ram: "~300 MB", speed: "~50ms", quality: "Good", description: "Fastest, lowest memory. Perfect for simple dictation." },
  base: { size: "142 MB", ram: "~500 MB", speed: "~200ms", quality: "Great", description: "Recommended. Best balance of speed and accuracy." },
  small: { size: "466 MB", ram: "~1.5 GB", speed: "~500ms", quality: "Excellent", description: "Higher accuracy for complex, technical terms." },
  medium: { size: "1.5 GB", ram: "~4.0 GB", speed: "~1s", quality: "Near-perfect", description: "Best accuracy. Slower on older hardware." },
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
];

type Tab = "general" | "model" | "cloud" | "voxcoder" | "about";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg bg-murmur-primary/20 text-murmur-primary">{icon}</div>
      <h3 className="text-sm font-semibold text-murmur-text">{title}</h3>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
        enabled ? "bg-murmur-primary" : "bg-murmur-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingRow({
  label, description, children
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-murmur-border/30 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-murmur-text">{label}</p>
        {description && <p className="text-xs text-murmur-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPanel({ state }: Props) {
  const { settings, updateSettings, isModelDownloaded, isDownloading, downloadProgress, downloadModel, deleteModel } = state;
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings size={14} /> },
    { id: "model", label: "AI Model", icon: <Cpu size={14} /> },
    { id: "cloud", label: "Cloud APIs", icon: <Cloud size={14} /> },
    { id: "voxcoder", label: "VoxCoder", icon: <Code2 size={14} /> },
    { id: "about", label: "About", icon: <Mic size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-5 py-4 border-b border-murmur-border"
        style={{ background: "rgba(19, 19, 26, 0.9)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-murmur-primary to-murmur-accent flex items-center justify-center shadow-lg">
            <Mic size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-murmur-text tracking-tight">Murmur</h1>
            <p className="text-xs text-murmur-muted">Settings</p>
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-murmur-muted hover:text-murmur-text hover:bg-murmur-card transition-all">
          <X size={14} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 px-4 py-2 border-b border-murmur-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-murmur-primary/20 text-murmur-primary"
                : "text-murmur-muted hover:text-murmur-text hover:bg-murmur-card"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader icon={<Keyboard size={14} />} title="Input & Shortcuts" />
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow label="Global Hotkey" description="Hold to record, release to transcribe">
                  <div className="flex items-center gap-1">
                    {["⌘", "⇧", "Space"].map((key) => (
                      <kbd key={key} className="px-1.5 py-0.5 text-xs rounded-md font-mono font-medium"
                        style={{ background: "rgba(124, 106, 247, 0.15)", color: "#9080ff", border: "1px solid rgba(124, 106, 247, 0.3)" }}>
                        {key}
                      </kbd>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label="Auto-Paste" description="Automatically type transcription into active window">
                  <Toggle enabled={settings.autoPaste} onChange={(v) => updateSettings({ autoPaste: v })} />
                </SettingRow>

                <SettingRow label="Sound Effects" description="Play sounds on recording start/stop">
                  <Toggle enabled={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
                </SettingRow>
              </div>

              <SectionHeader icon={<Globe size={14} />} title="Language" />
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow label="Transcription Language" description="Language spoken during recording">
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    style={{ background: "rgba(42, 42, 58, 0.5)", color: "#e8e8f0", border: "1px solid rgba(42, 42, 58, 0.8)" }}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </SettingRow>
              </div>
            </motion.div>
          )}

          {activeTab === "model" && (
            <motion.div
              key="model"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader icon={<Cpu size={14} />} title="Whisper Model" />
              <p className="text-xs text-murmur-muted mb-4">
                All models run 100% locally on your device. No internet required after download.
              </p>
              <div className="flex flex-col gap-3">
                {(["tiny", "base", "small", "medium"] as WhisperModel[]).map((model) => {
                  const info = MODEL_INFO[model];
                  const downloaded = isModelDownloaded[model];
                  const isSelected = settings.model === model;
                  const isThisDownloading = isDownloading && settings.model === model;

                  return (
                    <motion.div
                      key={model}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => downloaded && updateSettings({ model })}
                      className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-murmur-primary/60" : ""
                      }`}
                      style={{
                        background: isSelected ? "rgba(124, 106, 247, 0.1)" : "rgba(19, 19, 26, 0.8)",
                        border: `1px solid ${isSelected ? "rgba(124, 106, 247, 0.3)" : "rgba(42, 42, 58, 0.6)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-murmur-text capitalize">{model}</span>
                            {model === "base" && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                style={{ background: "rgba(6, 214, 160, 0.15)", color: "#06d6a0", border: "1px solid rgba(6, 214, 160, 0.25)" }}>
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-murmur-muted mb-2">{info.description}</p>
                          <div className="flex items-center gap-3 text-xs text-murmur-muted">
                            <span className="font-mono" title="Disk Size">💾 {info.size}</span>
                            <span>·</span>
                            <span className="font-mono text-murmur-text" title="RAM Required">🧠 {info.ram} RAM</span>
                            <span>·</span>
                            <span title="Latency">⏱️ {info.speed}</span>
                            <span>·</span>
                            <span className="text-murmur-accent">{info.quality}</span>
                          </div>
                        </div>

                        <div className="ml-3 flex-shrink-0 flex items-center gap-2">
                          {downloaded ? (
                            <>
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (window.confirm(`Are you sure you want to delete the ${model} model file from your disk?`)) {
                                    deleteModel(model); 
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-murmur-muted hover:text-red-400 transition-colors"
                                title="Delete Model"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? "bg-murmur-primary" : "bg-murmur-card"}`}>
                                <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-murmur-accent"} />
                              </div>
                            </>
                          ) : isThisDownloading ? (
                            <div className="flex flex-col items-center gap-1">
                              <Loader2 size={16} className="text-murmur-primary animate-spin" />
                              <span className="text-xs text-murmur-primary">{downloadProgress}%</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadModel(model); }}
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium btn-primary text-white"
                            >
                              <Download size={12} />
                              Get
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Download progress bar */}
                      {isThisDownloading && (
                        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(42, 42, 58, 0.5)" }}>
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-murmur-primary to-murmur-accent"
                            initial={{ width: "0%" }}
                            animate={{ width: `${downloadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => invoke("open_models_directory")}
                    className="flex items-center gap-2 text-xs font-medium text-murmur-muted hover:text-murmur-text transition-colors bg-murmur-surface px-4 py-2 rounded-full border border-murmur-border"
                  >
                    <FolderOpen size={14} />
                    Open Models Directory
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "cloud" && (
            <motion.div
              key="cloud"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader icon={<Cloud size={14} />} title="Cloud Transcribers" />
              <p className="text-xs text-murmur-muted mb-4">
                Use cloud APIs for perfect accuracy. Automatically falls back to Local if offline.
              </p>
              
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow label="Primary Engine" description="Choose which engine handles transcription first">
                  <select
                    value={settings.cloudProvider}
                    onChange={(e) => updateSettings({ cloudProvider: e.target.value as any })}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                    style={{ background: "rgba(42, 42, 58, 0.5)", color: "#e8e8f0", border: "1px solid rgba(42, 42, 58, 0.8)" }}
                  >
                    <option value="local">Local (Whisper.cpp)</option>
                    <option value="gemini">Google Gemini (Free Tier)</option>
                    <option value="groq">Groq Whisper (Free Tier)</option>
                  </select>
                </SettingRow>
              </div>

              <SectionHeader icon={<Key size={14} />} title="API Keys" />
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow label="Google Gemini API Key" description="Required for Gemini transcription">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={settings.geminiApiKey}
                    onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                    className="text-xs rounded-lg px-3 py-1.5 outline-none w-48 transition-all focus:ring-1 focus:ring-murmur-primary"
                    style={{ background: "rgba(19, 19, 26, 0.6)", color: "#e8e8f0", border: "1px solid rgba(42, 42, 58, 0.8)" }}
                  />
                </SettingRow>

                <SettingRow label="Groq API Key" description="Required for Groq Whisper transcription">
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={settings.groqApiKey}
                    onChange={(e) => updateSettings({ groqApiKey: e.target.value })}
                    className="text-xs rounded-lg px-3 py-1.5 outline-none w-48 transition-all focus:ring-1 focus:ring-murmur-primary"
                    style={{ background: "rgba(19, 19, 26, 0.6)", color: "#e8e8f0", border: "1px solid rgba(42, 42, 58, 0.8)" }}
                  />
                </SettingRow>
              </div>
            </motion.div>
          )}

          {activeTab === "voxcoder" && (
            <motion.div
              key="voxcoder"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader icon={<Code2 size={14} />} title="VoxCoder Mode" />
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow
                  label="Enable VoxCoder Mode"
                  description="Smart formatting for coding dictation — converts spoken syntax to code symbols"
                >
                  <Toggle enabled={settings.voxcoderMode} onChange={(v) => updateSettings({ voxcoderMode: v })} />
                </SettingRow>
              </div>

              <div className={`rounded-xl p-4 ${!settings.voxcoderMode ? "opacity-40 pointer-events-none" : ""}`}
                style={{ background: "rgba(19, 19, 26, 0.6)", border: "1px solid rgba(42, 42, 58, 0.4)" }}>
                <p className="text-xs font-semibold text-murmur-muted uppercase tracking-wider mb-3">Spoken → Output Examples</p>
                <div className="flex flex-col gap-2">
                  {[
                    { spoken: '"open curly brace"', output: '{' },
                    { spoken: '"close curly brace"', output: '}' },
                    { spoken: '"arrow function"', output: '=>' },
                    { spoken: '"double equals"', output: '==' },
                    { spoken: '"triple equals"', output: '===' },
                    { spoken: '"camel case print hello"', output: 'printHello' },
                    { spoken: '"snake case print hello"', output: 'print_hello' },
                    { spoken: '"new line"', output: '↵ (Enter)' },
                    { spoken: '"dot log open paren"', output: '.log(' },
                    { spoken: '"back tick"', output: '`' },
                  ].map(({ spoken, output }) => (
                    <div key={spoken} className="flex items-center gap-3">
                      <span className="text-xs text-murmur-muted italic flex-1">{spoken}</span>
                      <ChevronRight size={10} className="text-murmur-border flex-shrink-0" />
                      <code className="text-xs font-mono text-murmur-primary px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(124, 106, 247, 0.12)" }}>
                        {output}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center text-center pt-6"
            >
              {/* App Icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-murmur-primary via-[#5a50e0] to-murmur-accent flex items-center justify-center shadow-2xl mb-5"
                style={{ boxShadow: "0 20px 60px rgba(124, 106, 247, 0.4)" }}
              >
                <Mic size={36} className="text-white" strokeWidth={1.5} />
              </motion.div>

              <h2 className="text-2xl font-bold text-murmur-text mb-1 glow-text">Murmur</h2>
              <p className="text-xs text-murmur-primary font-mono mb-1">v0.1.0</p>
              <p className="text-sm text-murmur-muted mb-6 max-w-xs">
                Voice-to-text for AI coding tools. Local, private, free — forever.
              </p>

              <div className="w-full glass-card rounded-xl px-4 text-left">
                <SettingRow label="Engine" description="OpenAI Whisper (whisper.cpp)">
                  <span className="text-xs text-murmur-muted font-mono">MIT</span>
                </SettingRow>
                <SettingRow label="GPU Acceleration" description="Metal (macOS) / CUDA (Windows)">
                  <CheckCircle2 size={14} className="text-murmur-accent" />
                </SettingRow>
                <SettingRow label="Privacy" description="100% offline — zero telemetry">
                  <CheckCircle2 size={14} className="text-murmur-accent" />
                </SettingRow>
                <SettingRow label="License" description="MIT Open Source">
                  <span className="text-xs text-murmur-muted">Free</span>
                </SettingRow>
              </div>

              <p className="text-xs text-murmur-muted mt-5 opacity-50">
                Built with Tauri · Rust · React
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
