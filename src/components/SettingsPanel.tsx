import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Mic, Cpu, Code2, Globe, ChevronRight,
  Download, CheckCircle2, Loader2, Keyboard, X, Cloud, Key, Trash2, FolderOpen
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
      <div className="p-1.5 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">{icon}</div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
        enabled ? "bg-[#00E5FF]" : "bg-white/10"
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
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPanel({ state }: Props) {
  const { settings, updateSettings, isModelDownloaded, isDownloading, downloadingModel, downloadProgress, downloadModel, deleteModel } = state;
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings size={14} /> },
    { id: "model", label: "AI Model", icon: <Cpu size={14} /> },
    { id: "cloud", label: "Cloud APIs", icon: <Cloud size={14} /> },
    { id: "voxcoder", label: "VoxCoder", icon: <Code2 size={14} /> },
    { id: "about", label: "About", icon: <Mic size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-[#FFFFFF]">
      {/* Header */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#141414]/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[12px] flex items-center justify-center shadow-lg" style={{ background: "var(--accent-gradient)" }}>
            <Mic size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide text-white leading-tight">Murmur</h1>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Preferences</p>
          </div>
        </div>
        <button 
          onClick={() => getCurrentWindow().hide()}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#B250FF]/50"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab Navigation (Segmented Control) */}
      <div className="px-5 py-4">
        <div className="flex p-1 rounded-xl bg-[#141414] border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
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
                  <div className="relative">
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value })}
                      className="text-xs rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer appearance-none transition-all hover:bg-white/10"
                      style={{ background: "rgba(42, 42, 58, 0.5)", color: "#e8e8f0", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-[#1F1F1F] text-white">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </SettingRow>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6">
                <h3 className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Clear All App Data</p>
                    <p className="text-xs text-gray-400">This deletes all settings and downloaded models, then uninstalls the app data.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmed = await ask("Are you sure you want to completely clear all Murmur app data? This will delete all your settings, downloaded models, and close the app. You will need to start fresh next time.", {
                        title: 'Clear All App Data',
                        kind: 'warning',
                      });
                      if (confirmed) {
                        invoke("clear_all_app_data");
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
                  >
                    Clear Data & Quit
                  </button>
                </div>
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
              <p className="text-xs text-gray-400 mb-4">
                All models run 100% locally on your device. No internet required after download.
              </p>
              <div className="flex flex-col gap-3">
                {(["tiny", "base", "small", "medium"] as WhisperModel[]).map((model) => {
                  const info = MODEL_INFO[model];
                  const downloaded = isModelDownloaded[model];
                  const isSelected = settings.model === model;
                  const isThisDownloading = isDownloading && downloadingModel === model;

                  return (
                    <motion.div
                      key={model}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => downloaded && updateSettings({ model })}
                      className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-[#00E5FF]/60" : ""
                      }`}
                      style={{
                        background: isSelected ? "rgba(124, 106, 247, 0.1)" : "rgba(19, 19, 26, 0.8)",
                        border: `1px solid ${isSelected ? "rgba(124, 106, 247, 0.3)" : "rgba(42, 42, 58, 0.6)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white capitalize">{model}</span>
                            {model === "base" && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                style={{ background: "rgba(6, 214, 160, 0.15)", color: "#06d6a0", border: "1px solid rgba(6, 214, 160, 0.25)" }}>
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{info.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="font-mono" title="Disk Size">💾 {info.size}</span>
                            <span>·</span>
                            <span className="font-mono text-white" title="RAM Required">🧠 {info.ram} RAM</span>
                            <span>·</span>
                            <span title="Latency">⏱️ {info.speed}</span>
                            <span>·</span>
                            <span className="text-[#B250FF]">{info.quality}</span>
                          </div>
                        </div>

                        <div className="ml-3 flex-shrink-0 flex items-center gap-2">
                          {downloaded ? (
                            <>
                              <button
                                onClick={async (e) => { 
                                  e.stopPropagation(); 
                                  const confirmed = await ask(`Are you sure you want to delete the ${model} model file from your disk?`, {
                                    title: 'Delete Model',
                                    kind: 'warning',
                                  });
                                  if (confirmed) {
                                    deleteModel(model); 
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete Model"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? "bg-[#00E5FF]" : "bg-[#141414]"}`}>
                                <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-[#B250FF]"} />
                              </div>
                            </>
                          ) : isThisDownloading ? (
                            <div className="flex flex-col items-center gap-1">
                              <Loader2 size={16} className="text-[#00E5FF] animate-spin" />
                              <span className="text-xs text-[#00E5FF]">
                                {downloadProgress.total > 0 
                                  ? `${downloadProgress.progress}%` 
                                  : `${(downloadProgress.downloaded / 1048576).toFixed(1)} MB`}
                              </span>
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
                      {isThisDownloading && downloadProgress.total > 0 && (
                        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(42, 42, 58, 0.5)" }}>
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#B250FF]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${downloadProgress.progress}%` }}
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
                    className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors bg-[#1F1F1F] px-4 py-2 rounded-full border border-white/10"
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
              <p className="text-xs text-gray-400 mb-4">
                Use cloud APIs for perfect accuracy. Automatically falls back to Local if offline.
              </p>
              
              <div className="glass-card rounded-xl px-4 mb-4">
                <SettingRow label="Primary Engine" description="Choose which engine handles transcription first">
                  <div className="relative">
                    <select
                      value={settings.cloudProvider}
                      onChange={(e) => updateSettings({ cloudProvider: e.target.value as any })}
                      className="text-xs rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer appearance-none transition-all hover:bg-white/10"
                      style={{ background: "rgba(42, 42, 58, 0.5)", color: "#e8e8f0", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    >
                      <option value="local" className="bg-[#1F1F1F] text-white">Local (Whisper.cpp)</option>
                      <option value="gemini" className="bg-[#1F1F1F] text-white">Google Gemini (Free Tier)</option>
                      <option value="groq" className="bg-[#1F1F1F] text-white">Groq Whisper (Free Tier)</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
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
                    className="text-xs rounded-lg px-3 py-1.5 outline-none w-48 transition-all focus:ring-1 focus:ring-[#00E5FF]"
                    style={{ background: "rgba(19, 19, 26, 0.6)", color: "#e8e8f0", border: "1px solid rgba(42, 42, 58, 0.8)" }}
                  />
                </SettingRow>

                <SettingRow label="Groq API Key" description="Required for Groq Whisper transcription">
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={settings.groqApiKey}
                    onChange={(e) => updateSettings({ groqApiKey: e.target.value })}
                    className="text-xs rounded-lg px-3 py-1.5 outline-none w-48 transition-all focus:ring-1 focus:ring-[#00E5FF]"
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Spoken → Output Examples</p>
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
                      <span className="text-xs text-gray-400 italic flex-1">{spoken}</span>
                      <ChevronRight size={10} className="text-murmur-border flex-shrink-0" />
                      <code className="text-xs font-mono text-[#00E5FF] px-1.5 py-0.5 rounded"
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
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00E5FF] via-[#5a50e0] to-[#B250FF] flex items-center justify-center shadow-2xl mb-5"
                style={{ boxShadow: "0 20px 60px rgba(124, 106, 247, 0.4)" }}
              >
                <Mic size={36} className="text-white" strokeWidth={1.5} />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-1 glow-text">Murmur</h2>
              <p className="text-xs text-[#00E5FF] font-mono mb-1">v0.1.0</p>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Voice-to-text for AI coding tools. Local, private, free — forever.
              </p>

              <div className="w-full glass-card rounded-xl px-4 text-left">
                <SettingRow label="Engine" description="OpenAI Whisper (whisper.cpp)">
                  <span className="text-xs text-gray-400 font-mono">MIT</span>
                </SettingRow>
                <SettingRow label="GPU Acceleration" description="Metal (macOS) / CUDA (Windows)">
                  <CheckCircle2 size={14} className="text-[#B250FF]" />
                </SettingRow>
                <SettingRow label="Privacy" description="100% offline — zero telemetry">
                  <CheckCircle2 size={14} className="text-[#B250FF]" />
                </SettingRow>
                <SettingRow label="License" description="MIT Open Source">
                  <span className="text-xs text-gray-400">Free</span>
                </SettingRow>
              </div>

              <p className="text-xs text-gray-400 mt-5 opacity-50">
                Built with Tauri · Rust · React
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
