import React from 'react';
import {
  X,
  Settings as SettingsIcon,
  Keyboard,
  Speaker,
  Layers,
  Database,
} from 'lucide-react';
import { useAppStore, OverlayStyle } from '../../stores/appStore';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settingsSection,
    setSettingsSection,
    hotkey,
    setHotkey,
    pushToTalk,
    setPushToTalk,
    autoPaste,
    setAutoPaste,
    soundEffects,
    setSoundEffects,
    overlayStyle,
    setOverlayStyle,
    typingWPM,
    setTypingWPM,
    inputDevices,
    selectedInputDevice,
    setSelectedInputDevice,
    clearHistory,
  } = useAppStore();

  if (!isSettingsOpen) return null;

  const SECTIONS = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'dictation', label: 'Dictation & Hotkeys', icon: Keyboard },
    { id: 'audio', label: 'Audio & Devices', icon: Speaker },
    { id: 'overlay', label: 'Overlay Style', icon: Layers },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 select-none animate-fade-in">
      <div className="w-full max-w-2xl h-[520px] bg-[#0a0a0a] rounded-xl flex flex-col overflow-hidden border border-[#222222] shadow-2xl text-[#ededed]">
        {/* Header */}
        <div className="h-12 border-b border-[#222222] flex items-center justify-between px-5 bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold text-[#ededed]">Liquid Voice Settings</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Section Sidebar */}
          <div className="w-48 border-r border-[#222222] p-2 space-y-0.5 bg-[#0a0a0a]">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = settingsSection === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSettingsSection(sec.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1a1a1a] text-[#ededed] border border-[#2e2e2e]'
                      : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#ededed]' : 'text-zinc-500'
                    }`}
                  />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content Pane */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#000000]">
            {settingsSection === 'general' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                  General Preferences
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Audio Feedback Cues</p>
                      <p className="text-[11px] text-zinc-400">
                        Play subtle audio chime when recording starts and ends.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Estimated Typing Speed (WPM)</p>
                      <p className="text-[11px] text-zinc-400">
                        Used to calculate hours saved in the productivity dashboard.
                      </p>
                    </div>
                    <input
                      type="number"
                      value={typingWPM}
                      onChange={(e) => setTypingWPM(Number(e.target.value))}
                      className="w-20 bg-[#0a0a0a] border border-[#262626] rounded px-2.5 py-1 text-xs text-white text-right font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {settingsSection === 'dictation' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                  Dictation & Hotkeys
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Primary Dictation Shortcut</p>
                      <p className="text-[11px] text-zinc-400">
                        Hold or tap to trigger speech recognition globally.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={hotkey}
                      onChange={(e) => setHotkey(e.target.value)}
                      className="w-32 bg-[#0a0a0a] border border-[#262626] rounded px-2.5 py-1 text-xs text-white text-center font-mono font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Push-to-Talk Mode</p>
                      <p className="text-[11px] text-zinc-400">
                        Hold key down while speaking; release to finish and paste.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushToTalk}
                      onChange={(e) => setPushToTalk(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Smart Auto-Paste</p>
                      <p className="text-[11px] text-zinc-400">
                        Immediately insert text into the active cursor upon completion.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPaste}
                      onChange={(e) => setAutoPaste(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {settingsSection === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                  Audio & Input Devices
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#ededed] mb-1.5">
                    Microphone Input Device
                  </label>
                  <select
                    value={selectedInputDevice}
                    onChange={(e) => setSelectedInputDevice(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#444444]"
                  >
                    {inputDevices.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {settingsSection === 'overlay' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                  Overlay & Visualizer Style
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'notch', title: 'Dynamic Island (Top Notch)', desc: 'Top-screen bezel dock with live equalizer & text' },
                    { id: 'minimal', title: 'Minimal Pill', desc: 'Compact floating recording indicator' },
                    { id: 'hidden', title: 'Hidden / Background', desc: 'No visual overlay, audio cue only' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setOverlayStyle(style.id as OverlayStyle)}
                      className={`p-3.5 rounded-lg text-left transition-all border ${
                        overlayStyle === style.id
                          ? 'bg-[#171717] border-[#444444]'
                          : 'bg-[#0f0f11] border-[#222222] hover:border-[#333333]'
                      }`}
                    >
                      <p className="text-xs font-medium text-white">{style.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {settingsSection === 'data' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                  Data & Storage Budget
                </h3>

                <div className="p-4 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#ededed] font-medium">Local Transcription & Audio Cache</span>
                    <button
                      onClick={clearHistory}
                      className="px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium border border-red-500/20 transition-colors"
                    >
                      Purge History & Audio Cache
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Audio clips are stored locally on your machine for playback and review. Never uploaded to the cloud.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
