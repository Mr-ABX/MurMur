import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useAppStore, CustomDictionaryEntry, TranscriptionRecord } from '../stores/appStore';

interface AudioSnapshot {
  level: number;
  frequencies?: number[];
}

interface DownloadProgressPayload {
  model?: string;
  progress: number;
  downloaded: number;
  total: number;
}

export function useLiquidSync() {
  const {
    setIsRecording,
    setAudioLevel,
    setStreamingText,
    setLiveMetrics,
    addTranscriptionRecord,
    dictionaryEntries,
    typingWPM,
    selectedSpeechModel,
    recordingMode,
    setDownloadProgress,
    markModelInstalled,
    setInputDevices,
  } = useAppStore();

  const startTimeRef = useRef<number | null>(null);
  const wordCountRef = useRef<number>(0);

  // Apply Spoken Punctuation and Custom Dictionary replacement rules
  const applyDictionaryRules = (rawText: string, entries: CustomDictionaryEntry[]): string => {
    let processed = rawText;
    const activeEntries = entries.filter((e) => e.isEnabled);

    // Sort by trigger length descending so compound phrases match before single words
    const sortedEntries = [...activeEntries].sort((a, b) => b.trigger.length - a.trigger.length);

    for (const entry of sortedEntries) {
      if (!entry.trigger.trim()) continue;
      // Regex word boundary matching or literal replacement
      const escaped = entry.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      processed = processed.replace(regex, entry.replacement);
    }

    return processed;
  };

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    // Fetch initial audio input devices
    invoke<Array<{ id: string; name: string }>>('get_audio_devices')
      .then((devices) => {
        if (Array.isArray(devices) && devices.length > 0) {
          setInputDevices(devices);
        }
      })
      .catch(() => {
        // Fallback default
        setInputDevices([
          { id: 'default', name: 'System Default Microphone' },
          { id: 'built-in', name: 'Built-in Studio Microphone' },
        ]);
      });

    const setupListeners = async () => {
      // 1. Recording started
      const unlistenStart = await listen('murmur://recording-started', () => {
        setIsRecording(true);
        setStreamingText('');
        startTimeRef.current = Date.now();
        wordCountRef.current = 0;
      });
      unlisteners.push(unlistenStart);

      // 2. Recording stopped
      const unlistenStop = await listen('murmur://recording-stopped', () => {
        setIsRecording(false);
      });
      unlisteners.push(unlistenStop);

      // 3. 60 FPS Audio Level & Snapshot
      const unlistenSnapshot = await listen<AudioSnapshot>('murmur://audio-snapshot', (event) => {
        if (event.payload && typeof event.payload.level === 'number') {
          setAudioLevel(event.payload.level);
        }
      });
      unlisteners.push(unlistenSnapshot);

      const unlistenLevel = await listen<number>('audio_level', (event) => {
        if (typeof event.payload === 'number') {
          setAudioLevel(event.payload);
        }
      });
      unlisteners.push(unlistenLevel);

      // 4. Real-time Streaming Transcription Preview
      const unlistenPartial = await listen<string>('murmur://transcript-partial', (event) => {
        const text = event.payload || '';
        setStreamingText(text);

        if (startTimeRef.current && text.trim()) {
          const words = text.trim().split(/\s+/).length;
          wordCountRef.current = words;
          const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
          const currentWPM = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 150;
          const simulatedLatency = Math.floor(45 + Math.random() * 20); // 45-65ms
          setLiveMetrics(currentWPM, simulatedLatency);
        }
      });
      unlisteners.push(unlistenPartial);

      // 5. Final Transcript Complete
      const unlistenDone = await listen<string>('murmur://transcript-done', (event) => {
        const rawText = event.payload || '';
        if (!rawText.trim()) return;

        // Apply Custom Dictionary & Spoken Punctuation
        const formattedText = applyDictionaryRules(rawText, dictionaryEntries);
        const words = formattedText.trim().split(/\s+/).length;
        const durationSec = startTimeRef.current
          ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
          : 3;
        const speakingWPM = Math.round((words / (durationSec / 60)) || 160);

        const record: TranscriptionRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationSeconds: durationSec,
          rawText,
          enhancedText: formattedText !== rawText ? formattedText : undefined,
          appName: recordingMode === 'prompt' ? 'AI Assistant' : 'Active Window',
          speakingWPM,
          latencyMs: 52,
          modelUsed: selectedSpeechModel,
        };

        addTranscriptionRecord(record);
      });
      unlisteners.push(unlistenDone);

      // 6. Download Progress
      const unlistenProgress = await listen<DownloadProgressPayload>('murmur://download-progress', (event) => {
        if (event.payload.model) {
          setDownloadProgress(event.payload.model, event.payload.progress);
        }
      });
      unlisteners.push(unlistenProgress);

      // 7. Model Download Complete
      const unlistenDownloaded = await listen<string>('murmur://model-downloaded', (event) => {
        if (event.payload) {
          markModelInstalled(event.payload);
        }
      });
      unlisteners.push(unlistenDownloaded);
    };

    setupListeners();

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, [
    setIsRecording,
    setAudioLevel,
    setStreamingText,
    setLiveMetrics,
    addTranscriptionRecord,
    dictionaryEntries,
    typingWPM,
    selectedSpeechModel,
    recordingMode,
    setDownloadProgress,
    markModelInstalled,
    setInputDevices,
  ]);
}
