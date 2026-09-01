import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Mic, Cpu, Code2, Globe, ChevronRight,
  Download, CheckCircle2, Loader2, Keyboard, X, Cloud, Key, Trash2, FolderOpen, Beaker, History, FileText, Wrench, Bot, RefreshCw,
  PanelLeftClose, PanelLeftOpen, Copy, Check, Search, Save
} from "lucide-react";
import type { AppState, WhisperModel, GemmaModel } from "../hooks/useAppState";
import { ModernSelect } from "./ModernSelect";
import { checkForAppUpdates, openReleasePage, notifyUpdateAvailable, UpdateInfo, APP_VERSION } from "../services/updaterService";
import murmurIcon from "../assets/murmur_icon.png";
import NotesTab from "./tabs/NotesTab";
import SkillsTab from "./tabs/SkillsTab";

interface Props {
  state: AppState;
}

export interface VoiceHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  dateStr: string;
  model: string;
}

const MODEL_INFO: Record<WhisperModel, { size: string; ram: string; speed: string; quality: string; description: string; isMultilingual: boolean }> = {
  "base": { size: "142 MB", ram: "~500 MB", speed: "~200ms", quality: "Great", description: "Recommended. 99 Languages + Urdu & Roman Urdu support.", isMultilingual: true },
  "base.en": { size: "142 MB", ram: "~500 MB", speed: "~180ms", quality: "Great", description: "English-only Base model for pure English dictation.", isMultilingual: false },
  "large-v3-turbo": { size: "1.5 GB", ram: "~4.0 GB", speed: "~600ms", quality: "Best-in-class", description: "Fastest large multilingual model with highest accuracy.", isMultilingual: true },
  "tiny": { size: "75 MB", ram: "~300 MB", speed: "~50ms", quality: "Good", description: "Fastest multilingual model across 99 languages.", isMultilingual: true },
  "tiny.en": { size: "39 MB", ram: "~250 MB", speed: "~40ms", quality: "Good", description: "Ultra-compact English-only model.", isMultilingual: false },
  "small": { size: "466 MB", ram: "~1.5 GB", speed: "~500ms", quality: "Excellent", description: "High accuracy multilingual model for mixed accents.", isMultilingual: true },
  "small.en": { size: "466 MB", ram: "~1.5 GB", speed: "~450ms", quality: "Excellent", description: "English-only Small model with high accuracy.", isMultilingual: false },
  "medium": { size: "1.5 GB", ram: "~4.0 GB", speed: "~1.0s", quality: "Near-perfect", description: "Studio-grade accuracy across 99 languages.", isMultilingual: true },
  "medium.en": { size: "1.5 GB", ram: "~4.0 GB", speed: "~900ms", quality: "Near-perfect", description: "Studio-grade accuracy English-only model.", isMultilingual: false },
};

const GEMMA_MODEL_INFO: Record<GemmaModel, { size: string; ram: string; speed: string; quality: string; description: string }> = {
  e2b: { size: "~1.5 GB", ram: "~2.0 GB", speed: "Fast", quality: "Good", description: "Fast and lightweight for basic tasks." },
  e4b: { size: "~2.7 GB", ram: "~3.5 GB", speed: "Medium", quality: "Great", description: "Better reasoning for complex tasks." },
};

const LANGUAGES = [
  { code: "auto", name: "Auto-Detect Language" },
  { code: "en", name: "English" },
  { code: "ur", name: "Urdu (اردو / Roman Urdu)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ru", name: "Russian (Русский)" },
];

type Tab = "notes" | "skills" | "general" | "model" | "assistant" | "cloud" | "voxcoder" | "history" | "experimental" | "about";

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

interface ShortcutBuilderProps {
  hotkey: string;
  onChange: (newHotkey: string) => void;
}

function ShortcutBuilder({ hotkey, onChange }: ShortcutBuilderProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Parse existing hotkey into components
  const parseHotkey = (keyStr: string) => {
    const parts = (keyStr || "").split("+").map((s) => s.trim()).filter(Boolean);
    let mod1 = isMac ? "Command" : "Control";
    let mod2 = "Shift";
    let key3 = "Space";

    if (parts.length === 1) {
      mod1 = parts[0] === "CommandOrControl" ? (isMac ? "Command" : "Control") : parts[0];
      mod2 = "none";
      key3 = "none";
    } else if (parts.length === 2) {
      mod1 = parts[0] === "CommandOrControl" ? (isMac ? "Command" : "Control") : parts[0];
      mod2 = parts[1];
      key3 = "none";
    } else if (parts.length >= 3) {
      mod1 = parts[0] === "CommandOrControl" ? (isMac ? "Command" : "Control") : parts[0];
      mod2 = parts[1];
      key3 = parts[2];
    }
    return { mod1, mod2, key3 };
  };

  const isModifier = (k: string) => ["Shift", "Option", "Alt", "Control", "Command"].includes(k);
  const { mod1, mod2, key3 } = parseHotkey(hotkey);

  const handleUpdate = (newMod1: string, newMod2: string, newKey3: string) => {
    let finalMod2 = newMod2;
    let finalKey3 = newKey3;

    // If Key 2 is a modifier and Key 3 is 'none', default Key 3 to 'Space' to ensure a valid OS hotkey
    if (isModifier(finalMod2) && (!finalKey3 || finalKey3 === "none")) {
      finalKey3 = "Space";
    }

    let result = newMod1;
    if (finalMod2 && finalMod2 !== "none") {
      result += `+${finalMod2}`;
    }
    if (finalKey3 && finalKey3 !== "none") {
      result += `+${finalKey3}`;
    }
    onChange(result);
  };

  const mod1Options = isMac
    ? [
        { value: "Command", label: "⌘ Command (Cmd)" },
        { value: "Option", label: "⌥ Option (Alt)" },
        { value: "Control", label: "⌃ Control (Ctrl)" },
        { value: "Shift", label: "⇧ Shift" },
      ]
    : [
        { value: "Control", label: "Ctrl (Control)" },
        { value: "Alt", label: "Alt" },
        { value: "Shift", label: "Shift" },
      ];

  const mod2Options = [
    { value: "Shift", label: isMac ? "⇧ Shift" : "Shift" },
    { value: isMac ? "Option" : "Alt", label: isMac ? "⌥ Option" : "Alt" },
    { value: isMac ? "Control" : "Control", label: isMac ? "⌃ Control" : "Ctrl" },
    { value: "Space", label: "Spacebar" },
    { value: "D", label: "D (Dictate)" },
    { value: "K", label: "K" },
    { value: "A", label: "A" },
    { value: "V", label: "V" },
    { value: "P", label: "P" },
    { value: "Slash", label: "/ (Slash)" },
    { value: "F8", label: "F8" },
    { value: "F12", label: "F12" },
  ];

  const key3Options = [
    { value: "none", label: "— None (2-Key Combo) —" },
    { value: "Space", label: "Spacebar" },
    { value: "D", label: "D (Dictate)" },
    { value: "K", label: "K" },
    { value: "A", label: "A" },
    { value: "V", label: "V" },
    { value: "P", label: "P" },
    { value: "E", label: "E" },
    { value: "J", label: "J" },
    { value: "Enter", label: "Enter / Return" },
    { value: "Tab", label: "Tab" },
    { value: "Slash", label: "/ (Slash)" },
    { value: "Backquote", label: "` (Backquote)" },
    { value: "F8", label: "F8" },
    { value: "F12", label: "F12" },
  ];

  const getBadgeLabel = (key: string) => {
    if (key === "Command") return "⌘ Cmd";
    if (key === "Option") return "⌥ Opt";
    if (key === "Control") return "⌃ Ctrl";
    if (key === "Shift") return "⇧ Shift";
    if (key === "Space") return "␣ Space";
    return key;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-[340px]">
      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Key 1 (Modifier)</label>
          <ModernSelect
            value={mod1}
            onChange={(val) => handleUpdate(val, mod2, key3)}
            options={mod1Options}
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Key 2</label>
          <ModernSelect
            value={mod2}
            onChange={(val) => handleUpdate(mod1, val, key3)}
            options={mod2Options}
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Key 3 (Optional)</label>
          <ModernSelect
            value={key3}
            onChange={(val) => handleUpdate(mod1, mod2, val)}
            options={key3Options}
          />
        </div>
      </div>

      {/* Live Badge Preview */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 text-xs font-mono font-semibold bg-zinc-800 border border-zinc-700/80 rounded-md text-zinc-200 shadow-sm">
            {getBadgeLabel(mod1)}
          </kbd>
          {mod2 && mod2 !== "none" && (
            <>
              <span className="text-zinc-500 text-xs font-bold">+</span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-semibold bg-zinc-800 border border-zinc-700/80 rounded-md text-zinc-200 shadow-sm">
                {getBadgeLabel(mod2)}
              </kbd>
            </>
          )}
          {key3 && key3 !== "none" && (
            <>
              <span className="text-zinc-500 text-xs font-bold">+</span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-semibold bg-indigo-600/40 border border-indigo-500/50 rounded-md text-indigo-200 shadow-sm">
                {getBadgeLabel(key3)}
              </kbd>
            </>
          )}
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          {key3 && key3 !== "none" ? "3-Key Combo" : "2-Key Combo"}
        </span>
      </div>
    </div>
  );
}

export default function SettingsPanel({ state }: Props) {
  const { 
    settings, updateSettings, 
    isModelDownloaded, isGemmaModelDownloaded,
    isDownloading, downloadingModel, downloadingGemmaModel, 
    downloadProgress, 
    downloadModel, deleteModel,
    downloadGemmaModel, deleteGemmaModel
  } = state;
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<"all" | "multi" | "en">("all");

  // Persistent voice history state (persists across app restarts and system reboots)
  const [historyItems, setHistoryItems] = useState<VoiceHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("murmur_voice_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchHistory, setSearchHistory] = useState("");
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);

  const refreshHistory = async () => {
    try {
      const items = await invoke<VoiceHistoryItem[]>("get_voice_history");
      if (Array.isArray(items)) {
        setHistoryItems(items);
        try {
          localStorage.setItem("murmur_voice_history", JSON.stringify(items));
        } catch {}
        return;
      }
    } catch {}
    try {
      const saved = localStorage.getItem("murmur_voice_history");
      if (saved) {
        setHistoryItems(JSON.parse(saved));
      }
    } catch {}
  };

  useEffect(() => {
    refreshHistory();
    let unlisten: (() => void) | null = null;
    listen<VoiceHistoryItem[]>("murmur://history-updated", (e) => {
      if (Array.isArray(e.payload)) {
        setHistoryItems(e.payload);
        try {
          localStorage.setItem("murmur_voice_history", JSON.stringify(e.payload));
        } catch {}
      }
    }).then((fn) => {
      unlisten = fn;
    });

    const handleUpdate = () => refreshHistory();
    window.addEventListener("focus", handleUpdate);

    return () => {
      if (unlisten) unlisten();
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      refreshHistory();
    }
  }, [activeTab]);

  const handleCopyHistoryItem = (item: VoiceHistoryItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedHistoryId(item.id);
    setTimeout(() => setCopiedHistoryId(null), 2000);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const updated = await invoke<VoiceHistoryItem[]>("delete_voice_history_item", { id });
      if (Array.isArray(updated)) {
        setHistoryItems(updated);
        try {
          localStorage.setItem("murmur_voice_history", JSON.stringify(updated));
        } catch {}
        return;
      }
    } catch {}
    setHistoryItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem("murmur_voice_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllHistory = async () => {
    const confirmed = await ask("Are you sure you want to clear all transcription history?", {
      title: "Clear Voice History",
      kind: "warning",
    });
    if (confirmed) {
      setHistoryItems([]);
      try {
        await invoke("clear_voice_history");
        localStorage.removeItem("murmur_voice_history");
      } catch {
        localStorage.removeItem("murmur_voice_history");
      }
    }
  };

  const handleCheckUpdates = async (isManual = true) => {
    setIsCheckingUpdates(true);
    try {
      const info = await checkForAppUpdates();
      setUpdateInfo(info);
      setLastCheckedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      if (info.hasUpdate && !isManual) {
        notifyUpdateAvailable(info);
      }
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveAndApply = async () => {
    setIsSaving(true);
    try {
      await invoke("save_settings", { settings: state.settings });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (settings.autoUpdateCheck ?? true) {
      handleCheckUpdates(false);
    }
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "notes", label: "Notes", icon: <FileText size={16} /> },
    { id: "skills", label: "Skills", icon: <Wrench size={16} /> },
    { id: "general", label: "General", icon: <Settings size={16} /> },
    { id: "model", label: "AI Model", icon: <Cpu size={16} /> },
    { id: "assistant", label: "Assistant", icon: <Bot size={16} /> },
    { id: "cloud", label: "Cloud APIs", icon: <Cloud size={16} /> },
    { id: "voxcoder", label: "VoxCoder", icon: <Code2 size={16} /> },
    { id: "history", label: "History", icon: <History size={16} /> },
    { id: "experimental", label: "Experimental", icon: <Beaker size={16} /> },
    { id: "about", label: "About", icon: <Mic size={16} /> },
  ];

  return (
    <div className="flex h-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <div
        className={`flex flex-col bg-zinc-950/90 border-r border-white/5 relative z-10 shadow-2xl transition-all duration-300 ease-in-out select-none flex-shrink-0 overflow-x-hidden ${
          isSidebarCollapsed ? "w-[72px]" : "w-60"
        }`}
      >
        {/* Header in sidebar */}
        <div className={`py-4 flex items-center mb-1 ${
          isSidebarCollapsed ? "flex-col gap-3 px-2" : "justify-between px-4"
        }`}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 min-w-0 pointer-events-none">
              <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-white/10 shadow-sm overflow-hidden">
                <img src={murmurIcon} alt="Murmur Icon" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-wide text-white leading-tight truncate">Murmur</h1>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Preferences</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-900 border border-white/10 shadow-sm overflow-hidden pointer-events-none">
              <img src={murmurIcon} alt="Murmur Icon" className="w-full h-full object-cover" />
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-2.5 py-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="relative group flex items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer w-full ${
                    isSidebarCollapsed
                      ? "justify-center h-10 w-10 mx-auto"
                      : "gap-3 px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>

                {/* Floating Hover Tooltip in Collapsed Mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-700/80 text-white shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 pointer-events-none transition-all duration-150 z-50">
                    {tab.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Top Header with Tab Label, Save & Apply Button, and Close Button */}
        <div data-tauri-drag-region className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndApply}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
                savedFeedback
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30"
              }`}
            >
              {savedFeedback ? (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>Applied & Synced</span>
                </>
              ) : isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save & Apply</span>
                </>
              )}
            </button>

            <button 
              onClick={() => getCurrentWindow().hide()}
              className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all focus:outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
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
                  <SettingRow label="Operating Mode" description="Choose how Murmur processes your voice">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.operatingMode}
                        onChange={(val) => updateSettings({ operatingMode: val as any })}
                        options={[
                          { value: "dictation", label: "Dictation (Type Anywhere)", description: "Auto-pastes transcribed speech directly into your active window" },
                          { value: "assistant", label: "Assistant (Chat UI)", description: "Opens interactive AI workspace" },
                          { value: "hybrid", label: "Hybrid (Contextual)", description: "Intelligently routes based on spoken intent" },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow label="Visualizer Style" description="Choose how Murmur appears when recording">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.widgetNotchEnabled ? "notch" : "overlay"}
                        onChange={(val) => {
                          updateSettings({
                            widgetPetEnabled: false,
                            widgetNotchEnabled: val === "notch",
                          });
                        }}
                        options={[
                          { value: "notch", label: "Top Notch (Dynamic Island)", description: "Ambient top-screen island with live voice visuals (Recommended)" },
                          { value: "overlay", label: "Minimal Overlay", description: "Subtle center-screen voice indicator" },
                          { value: "widget", label: "Desktop Widget / Pet (Coming Soon)", description: "Interactive draggable companion widget (In development)", disabled: true },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow label="Visibility Mode" description="Choose when the visualizer should be shown">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.visibilityMode}
                        onChange={(val) => updateSettings({ visibilityMode: val as any })}
                        options={[
                          { value: "alwayson", label: "Always Show", description: "Keep notch visible on screen" },
                          { value: "autohidden", label: "Show Only When Active", description: "Auto-hide when idle" },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  {settings.widgetNotchEnabled && (
                    <SettingRow label="Notch Style" description="Choose the appearance of the top notch">
                      <div className="w-full sm:w-64">
                        <ModernSelect
                          value={settings.notchStyle}
                          onChange={(val) => updateSettings({ notchStyle: val as any })}
                          options={[
                            { value: "macbook", label: "MacBook Style", description: "Classic MacBook top bezel attachment" },
                            { value: "dynamicisland", label: "Dynamic Island", description: "Floating pill with smooth fluid animations" },
                          ]}
                        />
                      </div>
                    </SettingRow>
                  )}

                  <SettingRow label="Activation Mode" description="Choose how your shortcut key triggers dictation">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.activationMode ?? "toggle"}
                        onChange={(val) => updateSettings({ activationMode: val as any })}
                        options={[
                          { value: "toggle", label: "Toggle Mode", description: "Press shortcut once to start, press again to stop & paste (Recommended)" },
                          { value: "hold", label: "Push-to-Talk (Hold)", description: "Hold shortcut down while speaking, release to transcribe & paste" },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow label="Visualizer Style" description="Choose the animated visualizer shown in the Notch">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.visualizerStyle ?? "bars"}
                        onChange={(val) => updateSettings({ visualizerStyle: val as any })}
                        options={[
                          { value: "bars", label: "📊 Equalizer Bars (Handy / Freeflow)", description: "Dynamic dancing multi-bar equalizer (Recommended)" },
                          { value: "wave", label: "🌊 Fluid AI Wave (Apple Intelligence)", description: "Glowing sinusoidal ribbon wave" },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow label="Global Hotkey" description="Custom 2-key or 3-key shortcut dropdown picker">
                    <ShortcutBuilder
                      hotkey={settings.hotkey}
                      onChange={(val) => updateSettings({ hotkey: val })}
                    />
                  </SettingRow>

                  <SettingRow label="Microphone Device" description="Select which microphone to use">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.inputDevice}
                        onChange={(val) => updateSettings({ inputDevice: val })}
                        options={[
                          { value: "default", label: "System Default Microphone", description: "Use macOS/Windows default input device" },
                        ]}
                      />
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
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.trayIconStyle || "color"}
                        onChange={(val) => updateSettings({ trayIconStyle: val as "color" | "flat" })}
                        options={[
                          { value: "color", label: "Color Icon", description: "Vibrant gradient microphone icon" },
                          { value: "flat", label: "Monochrome (Flat)", description: "Minimal monochrome menu bar icon" },
                        ]}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow label="Automatic Update Checks" description="Check for new Murmur releases on startup">
                    <Toggle enabled={settings.autoUpdateCheck ?? true} onChange={(v) => updateSettings({ autoUpdateCheck: v })} />
                  </SettingRow>

                  <SettingRow 
                    label="Software Updates" 
                    description={`Installed version: v${APP_VERSION}${lastCheckedTime ? ` • Checked at ${lastCheckedTime}` : ""}`}
                  >
                    <div className="flex flex-col items-end gap-2.5">
                      <div className="flex items-center gap-3">
                        {updateInfo && !updateInfo.hasUpdate && !isCheckingUpdates && (
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 size={13} />
                            Up to date
                          </span>
                        )}
                        <button
                          disabled={isCheckingUpdates}
                          onClick={() => handleCheckUpdates(true)}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-strong)] text-[var(--text-primary)] border border-[var(--border-strong)] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={`text-[var(--accent-primary)] ${isCheckingUpdates ? "animate-spin" : ""}`} />
                          {isCheckingUpdates ? "Checking..." : "Check for Updates"}
                        </button>
                      </div>

                      {updateInfo?.hasUpdate && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col gap-2 max-w-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                              🚀 New Release: v{updateInfo.latestVersion}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">Available Now</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 line-clamp-2">
                            {updateInfo.releaseName || "New features, bug fixes and performance improvements."}
                          </p>
                          <button
                            onClick={() => openReleasePage(updateInfo.releaseUrl)}
                            className="mt-1 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download size={13} />
                            Download & Install Update
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </SettingRow>
                </div>

                <SectionHeader icon={<Globe size={16} />} title="Language & Vocabulary" />
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Transcription Language" description="Language spoken during recording">
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.language}
                        onChange={(val) => updateSettings({ language: val })}
                        options={LANGUAGES.map((lang) => ({
                          value: lang.code,
                          label: lang.name,
                        }))}
                      />
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
                <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                  All models run 100% locally on your device with Whisper.cpp. No cloud or internet required during transcription.
                </p>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-fit">
                  <button
                    onClick={() => setModelFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      modelFilter === "all"
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    All Models (9)
                  </button>
                  <button
                    onClick={() => setModelFilter("multi")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      modelFilter === "multi"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-indigo-400"
                    }`}
                  >
                    🌍 99 Languages & Urdu (5)
                  </button>
                  <button
                    onClick={() => setModelFilter("en")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      modelFilter === "en"
                        ? "bg-zinc-700 text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    🇬🇧 English Only (4)
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {(
                    [
                      "base",
                      "base.en",
                      "large-v3-turbo",
                      "tiny",
                      "tiny.en",
                      "small",
                      "small.en",
                      "medium",
                      "medium.en",
                    ] as WhisperModel[]
                  )
                    .filter((m) => {
                      const isMulti = MODEL_INFO[m].isMultilingual;
                      if (modelFilter === "multi") return isMulti;
                      if (modelFilter === "en") return !isMulti;
                      return true;
                    })
                    .map((model) => {
                      const info = MODEL_INFO[model];
                      const downloaded = isModelDownloaded[model];
                      const isSelected = settings.model === model;
                      const isThisDownloading = isDownloading && downloadingModel === model;

                      return (
                        <motion.div
                          key={model}
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => downloaded && updateSettings({ model })}
                          className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-[var(--accent-primary)] shadow-md shadow-indigo-500/10 bg-[var(--bg-surface-elevated)]"
                              : "hover:border-[var(--border-strong)] bg-[var(--bg-surface)]"
                          }`}
                          style={{
                            border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
                                  {model}
                                </span>
                                {info.isMultilingual ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                                    🌍 99 Languages (Urdu / Roman Urdu)
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-zinc-700/40 text-zinc-300 border border-zinc-600/30">
                                    🇬🇧 English Only
                                  </span>
                                )}
                                {model === "base" && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    Recommended
                                  </span>
                                )}
                                {model === "large-v3-turbo" && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    Max Accuracy
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] mb-2.5 leading-relaxed">
                                {info.description}
                              </p>
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

                            <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                              {downloaded ? (
                                <>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const confirmed = await ask(
                                        `Are you sure you want to delete the ${model} model file from your disk?`,
                                        {
                                          title: "Delete Model",
                                          kind: "warning",
                                        }
                                      );
                                      if (confirmed) {
                                        deleteModel(model);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
                                    title="Delete Model"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      isSelected
                                        ? "bg-[var(--accent-primary)] text-white"
                                        : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]"
                                    }`}
                                  >
                                    <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-[var(--text-secondary)]"} />
                                  </div>
                                </>
                              ) : isThisDownloading ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Loader2 size={16} className="text-[var(--accent-primary)] animate-spin" />
                                  <span className="text-xs text-[var(--accent-primary)] font-mono">
                                    {downloadProgress.total > 0
                                      ? `${downloadProgress.progress}%`
                                      : `${(downloadProgress.downloaded / 1048576).toFixed(1)} MB`}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadModel(model);
                                  }}
                                  className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                                >
                                  <Download size={13} />
                                  Get
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Download progress bar */}
                          {isThisDownloading && downloadProgress.total > 0 && (
                            <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-zinc-800">
                              <motion.div
                                className="h-full rounded-full bg-[var(--accent-primary)]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${downloadProgress.progress}%` }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => invoke("open_models_directory")}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-surface-elevated)] px-4 py-2 rounded-lg border border-[var(--border-strong)] cursor-pointer"
                    >
                      <FolderOpen size={14} />
                      Open Models Directory
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "assistant" && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <SectionHeader icon={<Bot size={16} />} title="Screen Assistant" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  Configure the AI assistant that can see your screen and answer questions in the menu bar.
                </p>
                
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-10 shadow-sm">
                  <SettingRow label="Assistant Model" description="The model used for screen-aware answering.">
                    <input
                      type="text"
                      value={settings.localAssistantModel}
                      onChange={(e) => updateSettings({ localAssistantModel: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      placeholder="gemini-2.0-flash-lite-preview-02-05"
                    />
                  </SettingRow>

                  <SettingRow label="System Prompt" description="Instructions given to the assistant before answering.">
                    <textarea
                      value={settings.systemPrompt}
                      onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                      className="w-full sm:w-64 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50 shadow-sm resize-y border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]"
                      rows={5}
                      placeholder="You are a helpful screen-aware assistant..."
                    />
                  </SettingRow>
                </div>

                <SectionHeader icon={<Cpu size={16} />} title="Local Assistant Models (Gemma)" />
                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  Download local LLMs to run the screen assistant entirely on-device without using cloud APIs.
                </p>
                <div className="flex flex-col gap-4 mb-10">
                  {(["e2b", "e4b"] as GemmaModel[]).map((model) => {
                    const info = GEMMA_MODEL_INFO[model];
                    const downloaded = isGemmaModelDownloaded[model];
                    const isSelected = settings.gemmaModel === model;
                    const isThisDownloading = isDownloading && downloadingGemmaModel === model;

                    return (
                      <motion.div
                        key={model}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => downloaded && updateSettings({ gemmaModel: model })}
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
                              <span className="text-sm font-semibold text-[var(--text-primary)]">Gemma 4 {model.toUpperCase()} IT Assistant</span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mb-2">{info.description}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                              <span className="font-mono" title="Disk Size">💾 {info.size}</span>
                              <span>·</span>
                              <span className="font-mono text-[var(--text-primary)]" title="RAM Required">🧠 {info.ram} RAM</span>
                              <span>·</span>
                              <span title="Speed">⚡ {info.speed}</span>
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
                                    const confirmed = await ask(`Are you sure you want to delete the Gemma ${model} model file from your disk?`, {
                                      title: 'Delete Model',
                                      kind: 'warning',
                                    });
                                    if (confirmed) {
                                      deleteGemmaModel(model); 
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
                                onClick={(e) => { e.stopPropagation(); downloadGemmaModel(model); }}
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
                    <div className="w-full sm:w-64">
                      <ModernSelect
                        value={settings.cloudProvider}
                        onChange={(val) => updateSettings({ cloudProvider: val as any })}
                        options={[
                          { value: "local", label: "Local (Whisper.cpp)", description: "100% offline, zero cloud latency & private" },
                          { value: "gemini", label: "Google Gemini (Free Tier)", description: "Gemini 2.0 Flash cloud transcription" },
                          { value: "groq", label: "Groq Whisper (Free Tier)", description: "Ultra-fast LPU cloud inference" },
                          { value: "deepgram", label: "Deepgram (Live & Fast)", description: "Live real-time streaming audio transcription" },
                        ]}
                      />
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
                <div className="flex items-center justify-between mb-4">
                  <SectionHeader icon={<History size={16} />} title="Voice Transcription History" />
                  {historyItems.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Clear All ({historyItems.length})</span>
                    </button>
                  )}
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                  Every voice dictation is automatically saved locally to your device and persists across restarts.
                </p>

                {/* Search Bar */}
                {historyItems.length > 0 && (
                  <div className="relative mb-5">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search past voice notes and transcripts..."
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                )}

                {/* History List or Empty State */}
                {historyItems.length === 0 ? (
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-elevated)] flex items-center justify-center mb-5 border border-[var(--border-strong)]">
                      <History size={24} className="text-[var(--text-secondary)]" />
                    </div>
                    <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">No Voice History Yet</h4>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                      Your voice transcriptions and prompt dictations will automatically appear here once you speak.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {historyItems
                      .filter((item) => item.text.toLowerCase().includes(searchHistory.toLowerCase()))
                      .map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-zinc-900/70 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
                              {item.dateStr}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                                {item.model}
                              </span>
                              <button
                                onClick={() => handleCopyHistoryItem(item)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Copy to Clipboard"
                              >
                                {copiedHistoryId === item.id ? (
                                  <Check size={14} className="text-emerald-400" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteHistoryItem(item.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete from History"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[13px] text-zinc-200 leading-relaxed select-text font-normal whitespace-pre-wrap">
                            {item.text}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
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
                  
                  <SettingRow 
                    label="Wake Word (Experimental)" 
                    description="Continuously listen for a wake word (e.g. 'Hey Murmur' or loud noise) to start recording without a hotkey."
                  >
                    <Toggle enabled={settings.experimentalWakeWord} onChange={(v) => updateSettings({ experimentalWakeWord: v })} />
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
