import { create } from 'zustand';

export type SidebarTab =
  | 'welcome'
  | 'aiSettings'
  | 'voiceEngine'
  | 'aiEnhancements'
  | 'commandMode'
  | 'writeMode'
  | 'rewriteMode'
  | 'fileTranscription'
  | 'meetingTools'
  | 'cleanupStyles'
  | 'customDictionary'
  | 'stats'
  | 'history'
  | 'preferences'
  | 'changelog'
  | 'feedback';

export type OverlayStyle = 'notch' | 'minimal' | 'hidden';
export type RecordingMode = 'dictate' | 'prompt' | 'rewrite' | 'command';

export interface SpeechModelInfo {
  id: string;
  name: string;
  provider: 'Local Whisper' | 'OpenAI' | 'NVIDIA' | 'Apple' | 'Cloud';
  description: string;
  languages: string;
  languageCount: number;
  speedRating: number; // 1-5
  speedPercent: number; // 0.0 - 1.0
  accuracyPercent: number; // 0.0 - 1.0
  ramFootprint: string;
  diskSize: string;
  isInstalled: boolean;
  isStreaming: boolean;
  isDefault?: boolean;
}

export interface PromptRoutingRule {
  id: string;
  appName: string;
  appIdentifier: string;
  icon: string;
  styleName: string;
  prompt: string;
  isEnabled: boolean;
}

export interface CustomDictionaryEntry {
  id: string;
  trigger: string;
  replacement: string;
  category: 'word' | 'punctuation' | 'acronym';
  isEnabled: boolean;
}

export interface TranscriptionRecord {
  id: string;
  timestamp: string;
  durationSeconds: number;
  rawText: string;
  enhancedText?: string;
  appName: string;
  speakingWPM: number;
  latencyMs: number;
  modelUsed: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  words: number;
  transcriptions: number;
  minutesSaved: number;
}

interface AppState {
  // Navigation
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsSection: 'general' | 'dictation' | 'audio' | 'overlay' | 'data' | 'experimental';
  setSettingsSection: (section: 'general' | 'dictation' | 'audio' | 'overlay' | 'data' | 'experimental') => void;

  // General Preferences
  hotkey: string;
  secondaryHotkey: string;
  rewriteHotkey: string;
  commandHotkey: string;
  pushToTalk: boolean;
  autoPaste: boolean;
  soundEffects: boolean;
  launchAtStartup: boolean;
  overlayStyle: OverlayStyle;
  typingWPM: number;
  audioHistoryBudgetGB: number;

  setHotkey: (hotkey: string) => void;
  setSecondaryHotkey: (secondaryHotkey: string) => void;
  setPushToTalk: (ptt: boolean) => void;
  setAutoPaste: (auto: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setOverlayStyle: (style: OverlayStyle) => void;
  setTypingWPM: (wpm: number) => void;

  // Speech Models Catalog
  selectedSpeechModel: string;
  models: SpeechModelInfo[];
  downloadProgress: Record<string, number>;
  setSelectedSpeechModel: (modelId: string) => void;
  setDownloadProgress: (modelId: string, progress: number) => void;
  markModelInstalled: (modelId: string) => void;

  // AI Enhancement
  selectedAIProvider: 'groq' | 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'local';
  apiKeys: Record<string, string>;
  selectedModelByProvider: Record<string, string>;
  setSelectedAIProvider: (provider: 'groq' | 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'local') => void;
  setApiKey: (provider: string, key: string) => void;
  setModelForProvider: (provider: string, model: string) => void;

  // Per-App Prompt Routing
  promptRules: PromptRoutingRule[];
  addPromptRule: (rule: PromptRoutingRule) => void;
  updatePromptRule: (id: string, updates: Partial<PromptRoutingRule>) => void;
  deletePromptRule: (id: string) => void;

  // Custom Dictionary
  dictionaryEntries: CustomDictionaryEntry[];
  addDictionaryEntry: (entry: CustomDictionaryEntry) => void;
  updateDictionaryEntry: (id: string, updates: Partial<CustomDictionaryEntry>) => void;
  deleteDictionaryEntry: (id: string) => void;

  // Stats & History
  wordsToday: number;
  timeSavedMinutesToday: number;
  currentStreakDays: number;
  totalWordsDictated: number;
  totalTranscriptions: number;
  activityHistory: DailyActivity[];
  historyRecords: TranscriptionRecord[];
  addTranscriptionRecord: (record: TranscriptionRecord) => void;
  clearHistory: () => void;

  // Live Recording & Notch State
  isRecording: boolean;
  audioLevel: number;
  streamingText: string;
  recordingMode: RecordingMode;
  liveWPM: number;
  liveLatencyMs: number;
  setIsRecording: (recording: boolean) => void;
  setAudioLevel: (level: number) => void;
  setStreamingText: (text: string) => void;
  setRecordingMode: (mode: RecordingMode) => void;
  setLiveMetrics: (wpm: number, latencyMs: number) => void;

  // Audio Devices
  inputDevices: Array<{ id: string; name: string }>;
  selectedInputDevice: string;
  setInputDevices: (devices: Array<{ id: string; name: string }>) => void;
  setSelectedInputDevice: (id: string) => void;
}

const INITIAL_MODELS: SpeechModelInfo[] = [
  {
    id: 'whisper-base',
    name: 'Whisper Base (Local GGML)',
    provider: 'Local Whisper',
    description: 'Default on-device Whisper engine. Sub-90ms latency, 100% offline, zero API keys required.',
    languages: '99 Languages (Auto-Detect)',
    languageCount: 99,
    speedRating: 5,
    speedPercent: 0.95,
    accuracyPercent: 0.93,
    ramFootprint: '~180 MB',
    diskSize: '142 MB',
    isInstalled: true,
    isStreaming: false,
    isDefault: true,
  },
  {
    id: 'whisper-small',
    name: 'Whisper Small (High Precision)',
    provider: 'Local Whisper',
    description: 'High accuracy local model with superior handling of technical jargon and accents.',
    languages: '99 Languages (Auto-Detect)',
    languageCount: 99,
    speedRating: 4,
    speedPercent: 0.85,
    accuracyPercent: 0.97,
    ramFootprint: '~450 MB',
    diskSize: '466 MB',
    isInstalled: true,
    isStreaming: false,
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large v3 Turbo (Studio)',
    provider: 'Local Whisper',
    description: 'State-of-the-art local transcription precision with Metal and CPU vectorization.',
    languages: '99 Languages (Auto-Detect)',
    languageCount: 99,
    speedRating: 4,
    speedPercent: 0.82,
    accuracyPercent: 0.99,
    ramFootprint: '~1.1 GB',
    diskSize: '1.5 GB',
    isInstalled: false,
    isStreaming: false,
  },
  {
    id: 'whisper-tiny',
    name: 'Whisper Tiny (Lightweight)',
    provider: 'Local Whisper',
    description: 'Extremely fast footprint for quick speech dictation on battery saver.',
    languages: '99 Languages (Auto-Detect)',
    languageCount: 99,
    speedRating: 5,
    speedPercent: 0.99,
    accuracyPercent: 0.88,
    ramFootprint: '~90 MB',
    diskSize: '75 MB',
    isInstalled: false,
    isStreaming: false,
  },
  {
    id: 'whisper-medium',
    name: 'Whisper Medium (Deep Multilingual)',
    provider: 'Local Whisper',
    description: 'Heavyweight local recognition engine optimized for complex multi-speaker audio.',
    languages: '99 Languages (Auto-Detect)',
    languageCount: 99,
    speedRating: 3,
    speedPercent: 0.70,
    accuracyPercent: 0.98,
    ramFootprint: '~1.2 GB',
    diskSize: '1.5 GB',
    isInstalled: false,
    isStreaming: false,
  },
  {
    id: 'cloud-turbo',
    name: 'Cloud Turbo (Groq Whisper)',
    provider: 'Cloud',
    description: 'Sub-180ms cloud fallback transcription via Groq LPU with zero local RAM footprint.',
    languages: '99 Languages supported',
    languageCount: 99,
    speedRating: 5,
    speedPercent: 0.98,
    accuracyPercent: 0.96,
    ramFootprint: '0 MB',
    diskSize: '0 MB',
    isInstalled: true,
    isStreaming: true,
  },
  {
    id: 'apple-speech',
    name: 'Apple Speech Recognition',
    provider: 'Apple',
    description: 'Zero-download macOS native speech engine leveraging Apple Neural Engine.',
    languages: 'System Languages',
    languageCount: 30,
    speedRating: 4,
    speedPercent: 0.88,
    accuracyPercent: 0.90,
    ramFootprint: 'Built-in',
    diskSize: '0 MB',
    isInstalled: true,
    isStreaming: true,
  },
];

const INITIAL_PROMPT_RULES: PromptRoutingRule[] = [
  {
    id: 'slack',
    appName: 'Slack',
    appIdentifier: 'com.tinyspeck.slackmacgap',
    icon: 'MessageSquare',
    styleName: 'Casual & Direct',
    prompt: 'Clean up transcription. Keep it natural, casual, concise, and friendly. No greetings or fluff.',
    isEnabled: true,
  },
  {
    id: 'mail',
    appName: 'Mail / Outlook',
    appIdentifier: 'com.apple.mail',
    icon: 'Mail',
    styleName: 'Professional Email',
    prompt: 'Format as polite, polished professional email text. Fix grammar, proper capitalization, and punctuation.',
    isEnabled: true,
  },
  {
    id: 'vscode',
    appName: 'VS Code / Cursor',
    appIdentifier: 'com.microsoft.VSCode',
    icon: 'Code',
    styleName: 'Code & Technical',
    prompt: 'Format for programming. Use exact variable casing (camelCase, snake_case) and clean markdown when relevant.',
    isEnabled: true,
  },
  {
    id: 'notion',
    appName: 'Notion / Notes',
    appIdentifier: 'notion.id',
    icon: 'FileText',
    styleName: 'Structured Markdown',
    prompt: 'Format transcription into structured bullet points with clear bold headers and clean Markdown formatting.',
    isEnabled: true,
  },
];

const INITIAL_DICTIONARY: CustomDictionaryEntry[] = [
  { id: '1', trigger: 'comma', replacement: ',', category: 'punctuation', isEnabled: true },
  { id: '2', trigger: 'period', replacement: '.', category: 'punctuation', isEnabled: true },
  { id: '3', trigger: 'new line', replacement: '\n', category: 'punctuation', isEnabled: true },
  { id: '4', trigger: 'new paragraph', replacement: '\n\n', category: 'punctuation', isEnabled: true },
  { id: '5', trigger: 'question mark', replacement: '?', category: 'punctuation', isEnabled: true },
  { id: '6', trigger: 'exclamation mark', replacement: '!', category: 'punctuation', isEnabled: true },
  { id: '7', trigger: 'colon', replacement: ':', category: 'punctuation', isEnabled: true },
  { id: '8', trigger: 'semicolon', replacement: ';', category: 'punctuation', isEnabled: true },
  { id: '9', trigger: 'k8s', replacement: 'Kubernetes', category: 'acronym', isEnabled: true },
  { id: '10', trigger: 'tauri', replacement: 'Tauri', category: 'word', isEnabled: true },
];

const INITIAL_HISTORY: TranscriptionRecord[] = [
  {
    id: 'rec-1',
    timestamp: 'Just now',
    durationSeconds: 4.2,
    rawText: 'hello everyone welcome to liquid voice the fastest dictation app',
    enhancedText: 'Hello everyone! Welcome to Liquid Voice, the fastest dictation app.',
    appName: 'Cursor',
    speakingWPM: 148,
    latencyMs: 82,
    modelUsed: 'Parakeet Flash',
  },
  {
    id: 'rec-2',
    timestamp: '10 mins ago',
    durationSeconds: 8.5,
    rawText: 'make sure to test the speech engine on both mac and windows',
    enhancedText: 'Make sure to test the speech engine on both Mac and Windows.',
    appName: 'Slack',
    speakingWPM: 152,
    latencyMs: 95,
    modelUsed: 'Whisper Base',
  }
];

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeTab: 'welcome',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSettingsOpen: false,
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  settingsSection: 'general',
  setSettingsSection: (section) => set({ settingsSection: section }),

  // General Preferences
  hotkey: 'Control+Option',
  secondaryHotkey: 'Option+Space',
  rewriteHotkey: 'Option+R',
  commandHotkey: 'Option+C',
  pushToTalk: true,
  autoPaste: true,
  soundEffects: true,
  launchAtStartup: false,
  overlayStyle: 'notch',
  typingWPM: 45,
  audioHistoryBudgetGB: 2.0,

  setHotkey: (hotkey) => set({ hotkey }),
  setSecondaryHotkey: (secondaryHotkey) => set({ secondaryHotkey }),
  setPushToTalk: (pushToTalk) => set({ pushToTalk }),
  setAutoPaste: (autoPaste) => set({ autoPaste }),
  setSoundEffects: (soundEffects) => set({ soundEffects }),
  setOverlayStyle: (overlayStyle) => set({ overlayStyle }),
  setTypingWPM: (typingWPM) => set({ typingWPM }),

  // Speech Models Catalog (Default to Local Whisper Base)
  selectedSpeechModel: 'whisper-base',
  models: INITIAL_MODELS,
  downloadProgress: {},
  setSelectedSpeechModel: (modelId) => set({ selectedSpeechModel: modelId }),
  setDownloadProgress: (modelId, progress) =>
    set((state) => ({ downloadProgress: { ...state.downloadProgress, [modelId]: progress } })),
  markModelInstalled: (modelId) =>
    set((state) => ({
      models: state.models.map((m) => (m.id === modelId ? { ...m, isInstalled: true } : m)),
    })),

  // AI Enhancement
  selectedAIProvider: 'local',
  apiKeys: {
    groq: '',
    gemini: '',
    openai: '',
  },
  selectedModelByProvider: {
    local: 'qwen2.5-coder:7b',
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4o-mini',
  },
  setSelectedAIProvider: (provider) => set({ selectedAIProvider: provider }),
  setApiKey: (provider, key) =>
    set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
  setModelForProvider: (provider, model) =>
    set((state) => ({ selectedModelByProvider: { ...state.selectedModelByProvider, [provider]: model } })),

  // Prompt Rules
  promptRules: INITIAL_PROMPT_RULES,
  addPromptRule: (rule) => set((state) => ({ promptRules: [...state.promptRules, rule] })),
  updatePromptRule: (id, updates) =>
    set((state) => ({
      promptRules: state.promptRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  deletePromptRule: (id) =>
    set((state) => ({ promptRules: state.promptRules.filter((r) => r.id !== id) })),

  // Custom Dictionary
  dictionaryEntries: INITIAL_DICTIONARY,
  addDictionaryEntry: (entry) =>
    set((state) => ({ dictionaryEntries: [...state.dictionaryEntries, entry] })),
  updateDictionaryEntry: (id, updates) =>
    set((state) => ({
      dictionaryEntries: state.dictionaryEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteDictionaryEntry: (id) =>
    set((state) => ({ dictionaryEntries: state.dictionaryEntries.filter((e) => e.id !== id) })),

  // Stats & History
  wordsToday: 842,
  timeSavedMinutesToday: 14.5,
  currentStreakDays: 5,
  totalWordsDictated: 12450,
  totalTranscriptions: 184,
  activityHistory: [
    { date: 'Mon', words: 420, transcriptions: 22, minutesSaved: 7.2 },
    { date: 'Tue', words: 680, transcriptions: 34, minutesSaved: 11.5 },
    { date: 'Wed', words: 950, transcriptions: 48, minutesSaved: 16.2 },
    { date: 'Thu', words: 1120, transcriptions: 55, minutesSaved: 19.1 },
    { date: 'Fri', words: 890, transcriptions: 41, minutesSaved: 15.0 },
    { date: 'Sat', words: 510, transcriptions: 26, minutesSaved: 8.8 },
    { date: 'Sun', words: 842, transcriptions: 38, minutesSaved: 14.5 },
  ],
  historyRecords: INITIAL_HISTORY,
  addTranscriptionRecord: (record) =>
    set((state) => ({
      historyRecords: [record, ...state.historyRecords],
      wordsToday: state.wordsToday + record.rawText.split(/\s+/).filter(Boolean).length,
      totalWordsDictated: state.totalWordsDictated + record.rawText.split(/\s+/).filter(Boolean).length,
      totalTranscriptions: state.totalTranscriptions + 1,
    })),
  clearHistory: () => set({ historyRecords: [] }),

  // Live Recording & Notch
  isRecording: false,
  audioLevel: 0,
  streamingText: '',
  recordingMode: 'dictate',
  liveWPM: 150,
  liveLatencyMs: 65,
  setIsRecording: (isRecording) => set({ isRecording }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setStreamingText: (streamingText) => set({ streamingText }),
  setRecordingMode: (recordingMode) => set({ recordingMode }),
  setLiveMetrics: (liveWPM, liveLatencyMs) => set({ liveWPM, liveLatencyMs }),

  // Audio Devices
  inputDevices: [
    { id: 'default', name: 'System Default Microphone' },
    { id: 'macbook-mic', name: 'Built-in Microphone (CoreAudio)' },
  ],
  selectedInputDevice: 'default',
  setInputDevices: (inputDevices) => set({ inputDevices }),
  setSelectedInputDevice: (selectedInputDevice) => set({ selectedInputDevice }),
}));
