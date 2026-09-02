import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from "@tauri-apps/api/event";

export type RecordingState = "idle" | "recording" | "transcribing" | "done" | "error";
export type WhisperModel =
  | "tiny.en"
  | "tiny"
  | "base.en"
  | "base"
  | "small.en"
  | "small"
  | "medium.en"
  | "medium"
  | "large-v3-turbo";
export type GemmaModel = "e2b" | "e4b";

export interface AppSettings {
  hotkey: string;
  model: WhisperModel;
  voxcoderMode: boolean;
  autoPaste: boolean;
  soundEffects: boolean;
  language: string;
  inputDevice: string;
  cloudProvider: "local" | "gemini" | "groq" | "deepgram";
  geminiApiKey: string;
  groqApiKey: string;
  deepgramApiKey: string;
  showDockIcon: boolean;
  trayIconStyle: "color" | "flat";
  liveStreaming: boolean;
  aiRewrite: boolean;
  customVocabulary: string;
  systemPrompt: string;
  localAssistantModel: string;
  experimentalWakeWord: boolean;
  operatingMode: "dictation" | "assistant" | "hybrid";
  assistantHotkey: string;
  wakeWord: string;
  widgetNotchEnabled: boolean;
  widgetPetEnabled: boolean;
  gemmaModel: "e2b" | "e4b" | null;
  autoUpdateCheck: boolean;
  visibilityMode: "alwayson" | "autohidden";
  notchStyle: "dynamicisland" | "macbook";
  activationMode: "toggle" | "hold";
  visualizerStyle?: "wave" | "bars";
}

export interface DownloadProgress {
  model?: string;
  progress: number;
  downloaded: number;
  total: number;
}

export interface AppState {
  recordingState: RecordingState;
  transcript: string;
  partialTranscript: string;
  settings: AppSettings;
  isModelDownloaded: Record<WhisperModel, boolean>;
  isGemmaModelDownloaded: Record<GemmaModel, boolean>;
  isDownloading: boolean;
  downloadingModel: WhisperModel | null;
  downloadingGemmaModel: GemmaModel | null;
  downloadProgress: DownloadProgress;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  downloadModel: (model: WhisperModel) => void;
  deleteModel: (model: WhisperModel) => void;
  downloadGemmaModel: (model: GemmaModel) => void;
  deleteGemmaModel: (model: GemmaModel) => void;
  refreshModelsStatus: () => Promise<void>;
  clearTranscript: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  hotkey: "CommandOrControl+Shift+Space",
  model: "base",
  voxcoderMode: false,
  autoPaste: true,
  soundEffects: true,
  language: "en",
  inputDevice: "default",
  cloudProvider: "local",
  geminiApiKey: "",
  groqApiKey: "",
  deepgramApiKey: "",
  showDockIcon: false,
  trayIconStyle: "color",
  liveStreaming: false,
  aiRewrite: false,
  customVocabulary: "",
  systemPrompt: "You are a helpful screen-aware assistant. Be extremely concise. Only answer what is asked. Do not output markdown unless required.",
  localAssistantModel: "gemini-2.0-flash-lite-preview-02-05",
  experimentalWakeWord: false,
  operatingMode: "dictation",
  assistantHotkey: "CommandOrControl+Shift+A",
  wakeWord: "hey murmur",
  widgetNotchEnabled: true,
  widgetPetEnabled: false,
  gemmaModel: null,
  autoUpdateCheck: true,
  visibilityMode: "autohidden",
  notchStyle: "dynamicisland",
  activationMode: "toggle",
  visualizerStyle: "wave",
};

export function useAppState(): AppState {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isModelDownloaded, setIsModelDownloaded] = useState<Record<WhisperModel, boolean>>({
    "tiny.en": false,
    tiny: false,
    "base.en": false,
    base: false,
    "small.en": false,
    small: false,
    "medium.en": false,
    medium: false,
    "large-v3-turbo": false,
  });
  const [isGemmaModelDownloaded, setIsGemmaModelDownloaded] = useState<Record<GemmaModel, boolean>>({
    e2b: false,
    e4b: false,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<WhisperModel | null>(null);
  const [downloadingGemmaModel, setDownloadingGemmaModel] = useState<GemmaModel | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ model: "", progress: 0, downloaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Listen to backend events
  useEffect(() => {
    const unlisten: Array<() => void> = [];

    const setupListeners = async () => {
      unlisten.push(
        await listen<string>("murmur://recording-started", () => {
          setRecordingState("recording");
          setError(null);
          setPartialTranscript("");
        }),
        await listen<string>("murmur://recording-stopped", () => {
          setRecordingState("transcribing");
        }),
        await listen<string>("murmur://transcript-partial", (e) => {
          setPartialTranscript(e.payload);
        }),
        await listen<string>("murmur://transcript-done", (e) => {
          const text = e.payload;
          setTranscript(text);
          setPartialTranscript("");
          setRecordingState("done");

          // Save directly to persistent history in localStorage across all windows
          if (text && text.trim()) {
            try {
              const existingHistory = JSON.parse(localStorage.getItem("murmur_voice_history") || "[]");
              const now = new Date();
              const newItem = {
                id: Date.now().toString(),
                text: text.trim(),
                timestamp: Date.now(),
                dateStr: now.toLocaleDateString([], { month: "short", day: "numeric" }) + " • " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                model: "Whisper",
              };
              const updated = [newItem, ...existingHistory.filter((i: any) => i.text !== text.trim())].slice(0, 100);
              localStorage.setItem("murmur_voice_history", JSON.stringify(updated));
              window.dispatchEvent(new Event("murmur-history-updated"));
            } catch (err) {
              console.error("Failed to auto-save voice history:", err);
            }
          }

          // Natural Language Voice Intent Router
          const noteMatch = text.match(/(?:hey murmur,?\s*)?(?:take (?:a )?note|note down|add (?:a )?note|create (?:a )?note|remember (?:that )?):?\s*(.+)/i);
          const taskMatch = text.match(/(?:hey murmur,?\s*)?(?:add task|new task|create task|remind me to|todo):?\s*(.+)/i);

          if (noteMatch && noteMatch[1]?.trim()) {
            const noteContent = noteMatch[1].trim();
            try {
              const existingNotes = JSON.parse(localStorage.getItem("murmur_notes") || "[]");
              existingNotes.unshift({
                id: Date.now(),
                text: noteContent,
                timestamp: new Date().toISOString(),
              });
              localStorage.setItem("murmur_notes", JSON.stringify(existingNotes));
            } catch (err) {
              console.error("Failed to auto-save voice note:", err);
            }
          } else if (taskMatch && taskMatch[1]?.trim()) {
            const taskContent = taskMatch[1].trim();
            try {
              const existingTasks = JSON.parse(localStorage.getItem("murmur_tasks") || "[]");
              existingTasks.unshift({
                id: Date.now(),
                text: taskContent,
                done: false,
                timestamp: new Date().toISOString(),
              });
              localStorage.setItem("murmur_tasks", JSON.stringify(existingTasks));
            } catch (err) {
              console.error("Failed to auto-save task:", err);
            }
          }

          // Reset to idle after showing result
          setTimeout(() => setRecordingState("idle"), 3000);
        }),
        await listen<string>("murmur://error", (e) => {
          setError(e.payload);
          setRecordingState("error");
          setIsDownloading(false);
          setDownloadingModel(null);
          setTimeout(() => setRecordingState("idle"), 3000);
        }),
        await listen<DownloadProgress>("murmur://download-progress", (e) => {
          setDownloadProgress(e.payload);
          setIsDownloading(true);
          if (e.payload.model) {
            setDownloadingModel(e.payload.model as WhisperModel);
          }
        }),
        await listen<WhisperModel>("murmur://model-downloaded", (e) => {
          setIsModelDownloaded((prev) => ({ ...prev, [e.payload]: true }));
          setIsDownloading(false);
          setDownloadingModel(null);
          setDownloadProgress({ model: "", progress: 0, downloaded: 0, total: 0 });
          setSettings((prev) => {
            const next = { ...prev, model: e.payload };
            invoke("save_settings", { settings: next }).catch(console.error);
            return next;
          });
        }),
        await listen<GemmaModel>("murmur://gemma-downloaded", (e) => {
          setIsGemmaModelDownloaded((prev) => ({ ...prev, [e.payload]: true }));
          setIsDownloading(false);
          setDownloadingGemmaModel(null);
          setDownloadProgress({ model: "", progress: 0, downloaded: 0, total: 0 });
        }),
        await listen<AppSettings>("murmur://settings-updated", (e) => {
          setSettings(e.payload);
        }),
      );
    };

    setupListeners();

    // Load initial state from backend
    invoke<AppSettings>("get_settings").then(setSettings).catch(console.error);
    invoke<Record<WhisperModel, boolean>>("get_downloaded_models").then(setIsModelDownloaded).catch(console.error);
    invoke<Record<GemmaModel, boolean>>("get_downloaded_gemma_models").then(setIsGemmaModelDownloaded).catch(console.error);

    return () => {
      unlisten.forEach((fn) => fn());
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await invoke("start_recording");
    } catch (err) {
      setError(String(err));
      setRecordingState("error");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await invoke("stop_recording");
    } catch (err) {
      setError(String(err));
      setRecordingState("error");
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      invoke("save_settings", { settings: merged }).catch((err) => {
        console.error("Failed to save settings:", err);
      });
      // Broadcast across all Tauri webviews immediately
      emit("murmur://settings-updated", merged).catch(() => {});
      return merged;
    });
  }, []);

  const refreshModelsStatus = useCallback(async () => {
    try {
      const models = await invoke<Record<WhisperModel, boolean>>("get_downloaded_models");
      if (models) setIsModelDownloaded(models);
      const gemma = await invoke<Record<GemmaModel, boolean>>("get_downloaded_gemma_models");
      if (gemma) setIsGemmaModelDownloaded(gemma);
    } catch (err) {
      console.error("Failed to refresh models status:", err);
    }
  }, []);

  const downloadModel = useCallback(async (model: WhisperModel) => {
    setIsDownloading(true);
    setDownloadingModel(model);
    setDownloadProgress({ progress: 0, downloaded: 0, total: 0 });
    try {
      await invoke("download_model", { model });
    } catch (err) {
      setError(String(err));
      setIsDownloading(false);
      setDownloadingModel(null);
    }
  }, []);

  const deleteModel = useCallback(async (model: WhisperModel) => {
    try {
      await invoke("delete_model_file", { model });
      setIsModelDownloaded((prev) => ({ ...prev, [model]: false }));
      // Optional: switch to base if deleted model was active
      if (settings.model === model && model !== "base") {
        updateSettings({ model: "base" });
      }
    } catch (err) {
      setError(String(err));
    }
  }, [settings.model, updateSettings]);

  const downloadGemmaModel = useCallback(async (model: GemmaModel) => {
    setIsDownloading(true);
    setDownloadingGemmaModel(model);
    setDownloadProgress({ progress: 0, downloaded: 0, total: 0 });
    try {
      await invoke("download_gemma_model_cmd", { model });
    } catch (err) {
      setError(String(err));
      setIsDownloading(false);
      setDownloadingGemmaModel(null);
    }
  }, []);

  const deleteGemmaModel = useCallback(async (model: GemmaModel) => {
    try {
      await invoke("delete_gemma_model", { model });
      setIsGemmaModelDownloaded((prev) => ({ ...prev, [model]: false }));
      if (settings.gemmaModel === model) {
        updateSettings({ gemmaModel: null });
      }
    } catch (err) {
      setError(String(err));
    }
  }, [settings.gemmaModel, updateSettings]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setPartialTranscript("");
  }, []);

  return {
    recordingState,
    transcript,
    partialTranscript,
    settings,
    isModelDownloaded,
    isGemmaModelDownloaded,
    isDownloading,
    downloadingModel,
    downloadingGemmaModel,
    downloadProgress,
    error,
    startRecording,
    stopRecording,
    updateSettings,
    downloadModel,
    deleteModel,
    downloadGemmaModel,
    deleteGemmaModel,
    refreshModelsStatus,
    clearTranscript,
  };
}
