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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none animate-fade-in">
      <div className="w-full max-w-2xl h-[520px] bg-[#0c0c0e] rounded-3xl flex flex-col overflow-hidden border border-[#1e1e24] shadow-2xl text-[#ededed]">
        {/* Header */}
        <div className="h-14 border-b border-[#1e1e24] flex items-center justify-between px-6 bg-[#0a0a0c]">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider">Liquid Voice Preferences</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Section Sidebar */}
          <div className="w-48 border-r border-[#1e1e24] p-3 space-y-1 bg-[#0a0a0c]">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = settingsSection === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSettingsSection(sec.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-black' : 'text-zinc-400'
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  General Preferences
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121215] border border-[#1e1e24]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Audio Feedback Cues</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Play subtle audio chime on start and completion.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121215] border border-[#1e1e24]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Typing Speed Baseline</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Used to calculate time saved in minutes.
                      </p>
                    </div>
                    <input
                      type="number"
                      value={typingWPM}
                      onChange={(e) => setTypingWPM(Number(e.target.value))}
                      className="w-20 bg-[#09090b] border border-[#1e1e24] rounded-xl px-2.5 py-1 text-xs text-white text-right font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {settingsSection === 'dictation' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Dictation & Hotkeys
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121215] border border-[#1e1e24]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Global Shortcut</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Triggers voice dictation from any active application.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={hotkey}
                      onChange={(e) => setHotkey(e.target.value)}
                      className="w-36 bg-[#09090b] border border-[#1e1e24] rounded-xl px-2.5 py-1 text-xs text-white text-center font-mono font-semibold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121215] border border-[#1e1e24]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Push-to-Talk Activation</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Hold hotkey while speaking; release to finish.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushToTalk}
                      onChange={(e) => setPushToTalk(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121215] border border-[#1e1e24]">
                    <div>
                      <p className="text-xs font-medium text-[#ededed]">Auto-Paste</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Automatically paste transcribed text into the cursor.
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Microphone & Hardware Input
                </h3>

                <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Input Device
                  </label>
                  <select
                    value={selectedInputDevice}
                    onChange={(e) => setSelectedInputDevice(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Overlay & Visualizer Style
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'notch', title: 'Dynamic Notch', desc: 'Top-screen Apple cutout with live equalizer' },
                    { id: 'minimal', title: 'Minimal Pill', desc: 'Compact floating recording pill' },
                    { id: 'hidden', title: 'Hidden Mode', desc: 'Sound only, no overlay' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setOverlayStyle(style.id as OverlayStyle)}
                      className={`p-4 rounded-2xl text-left transition-all border ${
                        overlayStyle === style.id
                          ? 'bg-[#18181c] border-white/40 ring-1 ring-white/10'
                          : 'bg-[#121215] border-[#1e1e24] hover:border-[#2a2a32]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#ededed]">{style.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {settingsSection === 'data' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Data & Local Storage
                </h3>

                <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#ededed] font-medium">Local Voice History</span>
                    <button
                      onClick={clearHistory}
                      className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold border border-red-500/20 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Recordings remain strictly on-device in your local user directory.
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
