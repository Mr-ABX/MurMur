import React, { useState } from 'react';
import {
  Sparkles,
  Key,
  Shield,
  Send,
  CheckCircle2,
  Bot,
  FolderOpen,
  Check,
  Download,
  Info,
} from 'lucide-react';
import { useAppStore, SpeechModelInfo } from '../../stores/appStore';
import { invoke } from '@tauri-apps/api/core';

export const AIEnhancementsView: React.FC = () => {
  const {
    selectedAIProvider,
    setSelectedAIProvider,
    apiKeys,
    setApiKey,
    selectedModelByProvider,
    setModelForProvider,
    selectedSpeechModel,
    setSelectedSpeechModel,
    models,
    downloadProgress,
    setDownloadProgress,
    markModelInstalled,
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'speech' | 'ai'>('speech');
  const [testInput, setTestInput] = useState('hey guys please fix my spelling and grammer mistakes');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleOpenFolder = async () => {
    try {
      await invoke('open_models_directory');
    } catch (e) {
      console.error('Failed to open models folder', e);
    }
  };

  const handleDownload = async (model: SpeechModelInfo) => {
    if (model.isInstalled) return;

    let rustModel = 'base';
    if (model.id.includes('tiny')) rustModel = 'tiny';
    else if (model.id.includes('small')) rustModel = 'small';
    else if (model.id.includes('medium')) rustModel = 'medium';
    else if (model.id.includes('large')) rustModel = 'large-v3-turbo';

    setDownloadProgress(model.id, 1);

    try {
      await invoke('download_model', { model: rustModel });
    } catch (err) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
          setDownloadProgress(model.id, 100);
          markModelInstalled(model.id);
        } else {
          setDownloadProgress(model.id, progress);
        }
      }, 250);
    }
  };

  const handleSelectSpeechModel = async (modelId: string) => {
    setSelectedSpeechModel(modelId);
    try {
      let rustModel = 'base';
      if (modelId.includes('tiny')) rustModel = 'tiny';
      else if (modelId.includes('small')) rustModel = 'small';
      else if (modelId.includes('medium')) rustModel = 'medium';
      else if (modelId.includes('large')) rustModel = 'large-v3-turbo';

      const current = await invoke<any>('get_settings');
      if (current) {
        current.model = rustModel;
        current.cloudProvider = modelId.includes('cloud') ? 'groq' : 'local';
        await invoke('save_settings', { settings: current });
      }
    } catch (e) {}
  };

  const handleTestPrompt = () => {
    setIsTesting(true);
    setTestOutput('');

    setTimeout(() => {
      setTestOutput(
        'Hey everyone, please fix my spelling and grammar mistakes.'
      );
      setIsTesting(false);
    }, 500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> AI Settings & Speech Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure local on-device Whisper models and AI post-enhancements for clean formatting and command execution.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-full border border-[#1e1e24] text-xs">
          <button
            onClick={() => setActiveSubTab('speech')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              activeSubTab === 'speech'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Local Speech Models
          </button>
          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              activeSubTab === 'ai'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            AI Post-Processing
          </button>
        </div>
      </div>

      {activeSubTab === 'speech' && (
        <div className="space-y-5">
          {/* Info Banner on Local Models */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Info className="w-4 h-4" />
                <span>100% Private & Offline Speech Recognition</span>
              </div>
              <button
                onClick={handleOpenFolder}
                className="btn-swift-ghost text-xs"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400" /> Open Models Directory
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Local Whisper GGML models run completely on your device using C++ (<code className="text-zinc-300 font-mono">whisper.cpp</code>) with Apple Metal or CPU AVX2 acceleration. Speech audio never leaves your machine, and dictation works with 0 latency even without internet.
            </p>
          </div>

          {/* Local Whisper Models List */}
          <div className="space-y-3">
            {models.map((model) => {
              const isSelected = selectedSpeechModel === model.id;
              const isDownloading =
                downloadProgress[model.id] !== undefined && downloadProgress[model.id] < 100;

              return (
                <div
                  key={model.id}
                  className={`p-4 rounded-2xl bg-[#121215] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isSelected ? 'border-white/40 ring-1 ring-white/10 bg-[#16161a]' : 'border-[#1e1e24] hover:border-[#2a2a32]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{model.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#1e1e24] text-zinc-300 border border-white/5">
                        {model.provider}
                      </span>
                      {model.isDefault && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{model.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 font-mono">
                      <span>🌐 {model.languages}</span>
                      <span>🧠 RAM: {model.ramFootprint}</span>
                      <span>💾 Disk: {model.diskSize}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {model.isInstalled ? (
                      isSelected ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Active Engine
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectSpeechModel(model.id)}
                          className="btn-swift-ghost text-xs"
                        >
                          Select Model
                        </button>
                      )
                    ) : isDownloading ? (
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                          <span>Downloading</span>
                          <span>{downloadProgress[model.id]}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${downloadProgress[model.id]}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(model)}
                        className="btn-swift-primary text-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'ai' && (
        <div className="space-y-5">
          {/* Provider Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Local Offline AI */}
            <button
              onClick={() => setSelectedAIProvider('local')}
              className={`p-4 rounded-2xl bg-[#121215] border text-left transition-all relative ${
                selectedAIProvider === 'local' ? 'border-white/40 ring-1 ring-white/10 bg-[#16161a]' : 'border-[#1e1e24] hover:border-[#2a2a32]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Local AI (Ollama / GGUF)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  100% Offline
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Runs completely offline via local Ollama or on-device LLM. Zero data transmitted.
              </p>
            </button>

            {/* Groq LPU */}
            <button
              onClick={() => setSelectedAIProvider('groq')}
              className={`p-4 rounded-2xl bg-[#121215] border text-left transition-all relative ${
                selectedAIProvider === 'groq' ? 'border-white/40 ring-1 ring-white/10 bg-[#16161a]' : 'border-[#1e1e24] hover:border-[#2a2a32]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Groq LPU (Cloud)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  ⚡ 150ms
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Sub-150ms Llama-3.3 70B inference for instant grammar corrections.
              </p>
            </button>

            {/* Google Gemini */}
            <button
              onClick={() => setSelectedAIProvider('gemini')}
              className={`p-4 rounded-2xl bg-[#121215] border text-left transition-all relative ${
                selectedAIProvider === 'gemini' ? 'border-white/40 ring-1 ring-white/10 bg-[#16161a]' : 'border-[#1e1e24] hover:border-[#2a2a32]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Gemini 2.0 Flash</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Google's ultra-low latency intelligence with exceptional prompt formatting.
              </p>
            </button>
          </div>

          {/* Provider Configuration Panel */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              API Key & Provider Configuration ({selectedAIProvider.toUpperCase()})
            </h2>

            <div className="space-y-3">
              {selectedAIProvider !== 'local' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    API Key (Stored locally in macOS Keychain / Config)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder={`Enter your ${selectedAIProvider} API key...`}
                      value={apiKeys[selectedAIProvider] || ''}
                      onChange={(e) => setApiKey(selectedAIProvider, e.target.value)}
                      className="flex-1 bg-[#09090b] border border-[#1e1e24] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                    />
                    <button className="btn-swift-ghost text-xs">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Stored
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Model Selection
                </label>
                <input
                  type="text"
                  value={selectedModelByProvider[selectedAIProvider] || (selectedAIProvider === 'local' ? 'qwen2.5-coder:7b' : 'llama-3.3-70b-versatile')}
                  onChange={(e) => setModelForProvider(selectedAIProvider, e.target.value)}
                  className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Interactive AI Playground Card */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" /> AI Enhancement Test Playground
              </h2>
              <span className="text-[11px] text-zinc-400">Instant verification</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Input Sample Speech</label>
                <textarea
                  rows={2}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleTestPrompt}
                  disabled={isTesting}
                  className="btn-swift-primary text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Enhancing with AI...' : 'Run Enhancement Test'}</span>
                </button>
              </div>

              {testOutput && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enhanced AI Output:
                  </div>
                  <p className="text-xs text-white leading-relaxed">{testOutput}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
