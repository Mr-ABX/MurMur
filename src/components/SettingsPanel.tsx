import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Mic, Cpu, Code2, Globe, ChevronRight,
  Download, CheckCircle2, Loader2, Keyboard, X, Cloud, Key, Trash2, FolderOpen, Beaker, History, FileText, Wrench
} from "lucide-react";
import type { AppState, WhisperModel } from "../hooks/useAppState";
import murmurIcon from "../assets/murmur_icon.png";
import NotesTab from "./tabs/NotesTab";
import SkillsTab from "./tabs/SkillsTab";

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

type Tab = "notes" | "skills" | "general" | "model" | "cloud" | "voxcoder" | "history" | "experimental" | "about";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]">{icon}</div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
        enabled ? "bg-[var(--accent-primary)]" : "bg-zinc-600/50"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
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
  interactive?: boolean;
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between py-5 px-3 border-b border-[var(--border-subtle)] last:border-0 gap-6`}>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center justify-end sm:min-w-[260px]">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPanel({ state }: Props) {
  const { settings, updateSettings, isModelDownloaded, isDownloading, downloadingModel, downloadProgress, downloadModel, deleteModel } = state;
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "notes", label: "Notes", icon: <FileText size={16} /> },
    { id: "skills", label: "Skills", icon: <Wrench size={16} /> },
    { id: "general", label: "General", icon: <Settings size={16} /> },
    { id: "model", label: "AI Model", icon: <Cpu size={16} /> },
    { id: "cloud", label: "Cloud APIs", icon: <Cloud size={16} /> },
    { id: "voxcoder", label: "VoxCoder", icon: <Code2 size={16} /> },
    { id: "history", label: "History", icon: <History size={16} /> },
    { id: "experimental", label: "Experimental", icon: <Beaker size={16} /> },
    { id: "about", label: "About", icon: <Mic size={16} /> },
  ];

  return (
    <div className="flex h-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] relative z-10 shadow-xl">
        {/* Header in sidebar */}
        <div data-tauri-drag-region className="px-6 py-6 flex flex-col gap-2 pb-8">
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-base)] border border-[var(--border-strong)] shadow-sm overflow-hidden">
              <img src={murmurIcon} alt="Murmur Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide text-[var(--text-primary)] leading-tight">Murmur</h1>
              <p className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Preferences</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Top Right Close Button & Drag Region */}
        <div data-tauri-drag-region className="h-14 flex items-center justify-end px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
          <button 
            onClick={() => getCurrentWindow().hide()}
            className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 pt-20">
          <AnimatePresence mode="wait">
            {activeTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="h-full"
              >
                <NotesTab state={state} />
              </motion.div>
            )}

            {activeTab === "skills" && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="h-full"
              >
                <SkillsTab state={state} />
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Keyboard size={16} />} title="Input & Shortcuts" />
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Global Hotkey" description="Shortcut to start/stop recording">
                    <input
                      type="text"
                      value={settings.hotkey}
                      onChange={(e) => updateSettings({ hotkey: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                    />
                  </SettingRow>

                  <SettingRow label="Microphone Device" description="Select which microphone to use">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={settings.inputDevice}
                        onChange={(e) => updateSettings({ inputDevice: e.target.value })}
                        className="w-full text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-2 focus:ring-[var(--accent-primary)]/50 border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      >
                        <option value="default" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">System Default</option>
                        {/* More devices would be populated here dynamically */}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow label="Auto-Paste" description="Automatically type transcription into active window">
                    <Toggle enabled={settings.autoPaste} onChange={(v) => updateSettings({ autoPaste: v })} />
                  </SettingRow>

                  <SettingRow label="Sound Effects" description="Play sounds on recording start/stop">
                    <Toggle enabled={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
                  </SettingRow>

                  <SettingRow label="Show App in Dock" description="Show the app icon in the macOS Dock (restart required)">
                    <Toggle enabled={settings.showDockIcon} onChange={(v) => updateSettings({ showDockIcon: v })} />
                  </SettingRow>

                  <SettingRow label="Tray Icon Style" description="Choose the style of the menu bar icon">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={settings.trayIconStyle || "color"}
                        onChange={(e) => updateSettings({ trayIconStyle: e.target.value as "color" | "flat" })}
                        className="w-full text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-2 focus:ring-[var(--accent-primary)]/50 border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      >
                        <option value="color" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Color</option>
                        <option value="flat" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Flat</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </SettingRow>
                </div>

                <SectionHeader icon={<Globe size={16} />} title="Language & Vocabulary" />
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Transcription Language" description="Language spoken during recording">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                        className="w-full text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-2 focus:ring-[var(--accent-primary)]/50 border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow label="Custom Vocabulary" description="Comma-separated jargon, names, or code terms to improve accuracy.">
                    <textarea
                      placeholder="React, useEffect, Tauri, API..."
                      value={settings.customVocabulary}
                      onChange={(e) => updateSettings({ customVocabulary: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm resize-none border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      rows={3}
                    />
                  </SettingRow>
                </div>

                <div className="pt-6 border-t border-[var(--border-strong)] mt-10">
                  <h3 className="text-sm font-bold text-red-400/90 mb-4 uppercase tracking-wider">Danger Zone</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">Clear All App Data</p>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1">This deletes all settings and downloaded models, then uninstalls the app data.</p>
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
                      className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-colors border border-red-500/20 whitespace-nowrap"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Cpu size={16} />} title="Whisper Model" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  All models run 100% locally on your device. No internet required after download.
                </p>
                <div className="flex flex-col gap-4">
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
                          isSelected ? "ring-1 ring-[var(--accent-primary)] shadow-md shadow-indigo-500/10" : "hover:border-[var(--border-strong)]"
                        }`}
                        style={{
                          background: isSelected ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
                          border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">{model}</span>
                              {model === "base" && (
                                <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mb-2">{info.description}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                              <span className="font-mono" title="Disk Size">💾 {info.size}</span>
                              <span>·</span>
                              <span className="font-mono text-[var(--text-primary)]" title="RAM Required">🧠 {info.ram} RAM</span>
                              <span>·</span>
                              <span title="Latency">⏱️ {info.speed}</span>
                              <span>·</span>
                              <span className="text-[var(--accent-primary)] font-medium">{info.quality}</span>
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
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                  title="Delete Model"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-surface-elevated)]"}`}>
                                  <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-[var(--text-secondary)]"} />
                                </div>
                              </>
                            ) : isThisDownloading ? (
                              <div className="flex flex-col items-center gap-1">
                                <Loader2 size={16} className="text-[var(--accent-primary)] animate-spin" />
                                <span className="text-xs text-[var(--accent-primary)]">
                                  {downloadProgress.total > 0 
                                    ? `${downloadProgress.progress}% (${(downloadProgress.downloaded / 1048576).toFixed(1)} MB)` 
                                    : `${(downloadProgress.downloaded / 1048576).toFixed(1)} MB`}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); downloadModel(model); }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[var(--bg-surface-elevated)] hover:bg-[var(--accent-primary)] border border-[var(--border-strong)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-all"
                              >
                                <Download size={14} />
                                Get
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Download progress bar */}
                        {isThisDownloading && downloadProgress.total > 0 && (
                          <div className="mt-3 h-1 rounded-full overflow-hidden bg-[var(--bg-base)]">
                            <motion.div
                              className="h-full rounded-full bg-[var(--accent-primary)]"
                              initial={{ width: "0%" }}
                              animate={{ width: `${downloadProgress.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => invoke("open_models_directory")}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-surface-elevated)] px-4 py-2 rounded-lg border border-[var(--border-strong)]"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Cloud size={16} />} title="Cloud Transcribers" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  Use cloud APIs for perfect accuracy. Automatically falls back to Local if offline.
                </p>
                
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Primary Engine" description="Choose which engine handles transcription first">
                    <div className="relative w-full sm:w-64">
                      <select
                        value={settings.cloudProvider}
                        onChange={(e) => updateSettings({ cloudProvider: e.target.value as any })}
                        className="w-full text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer appearance-none transition-all shadow-sm focus:ring-2 focus:ring-[var(--accent-primary)]/50 border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      >
                        <option value="local" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Local (Whisper.cpp)</option>
                        <option value="gemini" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Google Gemini (Free Tier)</option>
                        <option value="groq" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Groq Whisper (Free Tier)</option>
                        <option value="deepgram" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Deepgram (Live & Fast)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </SettingRow>
                </div>

                <SectionHeader icon={<Key size={16} />} title="API Keys" />
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Google Gemini API Key" description="Required for Gemini transcription">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={settings.geminiApiKey}
                      onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                    />
                  </SettingRow>

                  <SettingRow label="Groq API Key" description="Required for Groq Whisper transcription">
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={settings.groqApiKey}
                      onChange={(e) => updateSettings({ groqApiKey: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                    />
                  </SettingRow>

                  <SettingRow label="Deepgram API Key" description="Required for Deepgram (Live Streaming) transcription">
                    <input
                      type="password"
                      placeholder="dg_..."
                      value={settings.deepgramApiKey}
                      onChange={(e) => updateSettings({ deepgramApiKey: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                    />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeTab === "voxcoder" && (
              <motion.div
                key="voxcoder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Code2 size={16} />} title="VoxCoder Mode" />
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow
                    label="Enable VoxCoder Mode"
                    description="Smart formatting for coding dictation — converts spoken syntax to code symbols"
                  >
                    <Toggle enabled={settings.voxcoderMode} onChange={(v) => updateSettings({ voxcoderMode: v })} />
                  </SettingRow>
                </div>

                <div className={`rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-opacity duration-300 shadow-sm ${!settings.voxcoderMode ? "opacity-50 pointer-events-none" : ""}`}>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-6">Spoken → Output Examples</p>
                  <div className="flex flex-col gap-4">
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
                      <div key={spoken} className="flex items-center gap-4">
                        <span className="text-[14px] text-[var(--text-secondary)] italic flex-1">{spoken}</span>
                        <ChevronRight size={16} className="text-[var(--border-strong)] flex-shrink-0" />
                        <code className="text-sm font-mono text-[var(--accent-primary)] px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 min-w-[5rem] text-center">
                          {output}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<History size={16} />} title="Transcription History" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  Recently transcribed text is saved here temporarily. History is cleared when the app restarts.
                </p>
                
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-elevated)] flex items-center justify-center mb-5 border border-[var(--border-strong)]">
                    <History size={24} className="text-[var(--text-secondary)]" />
                  </div>
                  <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">No History Yet</h4>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm">Transcriptions will appear here once you start using Murmur.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "experimental" && (
              <motion.div
                key="experimental"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Beaker size={16} />} title="Experimental Features" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  These features are currently in testing. They may be unstable or change in the future.
                </p>
                
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow 
                    label="Live Streaming Transcription" 
                    description="Transcribe audio in real-time as you speak instead of waiting until the end. Uses Deepgram API or local VAD chunking."
                  >
                    <Toggle enabled={settings.liveStreaming} onChange={(v) => updateSettings({ liveStreaming: v })} />
                  </SettingRow>

                  <SettingRow 
                    label="AI Rewrite & Polisher" 
                    description="Automatically use a free LLM (Groq/Llama 3) to polish the final transcript for better grammar and clarity."
                  >
                    <Toggle enabled={settings.aiRewrite} onChange={(v) => updateSettings({ aiRewrite: v })} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col items-center text-center pt-10 max-w-3xl mx-auto"
              >
                {/* App Icon */}
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shadow-lg mb-6 overflow-hidden"
                >
                  <img src={murmurIcon} alt="Murmur Icon" className="w-full h-full object-cover" />
                </motion.div>

                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">Murmur</h2>
                <p className="text-sm text-[var(--text-secondary)] font-mono mb-6">v0.1.0</p>
                <p className="text-base text-[var(--text-secondary)] mb-10 max-w-md leading-relaxed">
                  Voice-to-text for AI coding tools. Local, private, free — forever.
                </p>

                <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 text-left shadow-sm">
                  <SettingRow label="Engine" description="OpenAI Whisper (whisper.cpp)" interactive={false}>
                    <span className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-surface-elevated)] px-2 py-1 rounded-md">MIT</span>
                  </SettingRow>
                  <SettingRow label="GPU Acceleration" description="Metal (macOS) / CUDA (Windows)" interactive={false}>
                    <CheckCircle2 size={18} className="text-[var(--accent-primary)]" />
                  </SettingRow>
                  <SettingRow label="Privacy" description="100% offline — zero telemetry" interactive={false}>
                    <CheckCircle2 size={18} className="text-[var(--accent-primary)]" />
                  </SettingRow>
                  <SettingRow label="License" description="MIT Open Source" interactive={false}>
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-elevated)] px-2 py-1 rounded-md">Free</span>
                  </SettingRow>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mt-10 opacity-60 font-medium">
                  Built with Tauri · Rust · React
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
