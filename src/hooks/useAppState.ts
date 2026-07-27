import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type RecordingState = "idle" | "recording" | "transcribing" | "done" | "error";
export type WhisperModel = "tiny" | "base" | "small" | "medium";

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
}

export interface AppState {
  recordingState: RecordingState;
  transcript: string;
  partialTranscript: string;
  settings: AppSettings;
  isModelDownloaded: Record<WhisperModel, boolean>;
  isDownloading: boolean;
  downloadingModel: WhisperModel | null;
  downloadProgress: { progress: number, downloaded: number, total: number };
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  downloadModel: (model: WhisperModel) => void;
  deleteModel: (model: WhisperModel) => void;
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
};

export function useAppState(): AppState {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isModelDownloaded, setIsModelDownloaded] = useState<Record<WhisperModel, boolean>>({
    tiny: false,
    base: false,
    small: false,
    medium: false,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<WhisperModel | null>(null);
  const [downloadProgress, setDownloadProgress] = useState({ progress: 0, downloaded: 0, total: 0 });
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
          setTranscript(e.payload);
          setPartialTranscript("");
          setRecordingState("done");
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
        await listen<{ progress: number, downloaded: number, total: number }>("murmur://download-progress", (e) => {
          setDownloadProgress(e.payload);
        }),
        await listen<WhisperModel>("murmur://model-downloaded", (e) => {
          setIsModelDownloaded((prev) => ({ ...prev, [e.payload]: true }));
          setIsDownloading(false);
          setDownloadingModel(null);
          setDownloadProgress({ progress: 0, downloaded: 0, total: 0 });
          setSettings((prev) => {
            const next = { ...prev, model: e.payload };
            invoke("save_settings", { settings: next }).catch(console.error);
            return next;
          });
        }),
      );
    };

    setupListeners();

    // Load initial state from backend
    invoke<AppSettings>("get_settings").then(setSettings).catch(console.error);
    invoke<Record<WhisperModel, boolean>>("get_downloaded_models").then(setIsModelDownloaded).catch(console.error);

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
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await invoke("save_settings", { settings: merged });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, [settings]);

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
    isDownloading,
    downloadingModel,
    downloadProgress,
    error,
    startRecording,
    stopRecording,
    updateSettings,
    downloadModel,
    deleteModel,
    clearTranscript,
  };
}
