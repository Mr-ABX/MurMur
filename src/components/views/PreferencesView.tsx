import React from 'react';
import {
  Settings as SettingsIcon,
  Keyboard,
  Speaker,
  Layers,
  Database,
  Sliders,
} from 'lucide-react';
import { useAppStore, OverlayStyle } from '../../stores/appStore';

export const PreferencesView: React.FC = () => {
  const {
    settingsSection,
    setSettingsSection,
    hotkey,
    setHotkey,
    secondaryHotkey,
    setSecondaryHotkey,
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

  const SECTIONS = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'dictation', label: 'Dictation & Hotkeys', icon: Keyboard },
    { id: 'audio', label: 'Audio & Devices', icon: Speaker },
    { id: 'overlay', label: 'Overlay Style', icon: Layers },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ] as const;

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden select-none bg-[#000000] text-[#ededed]">
      {/* Settings Section Sidebar */}
      <div className="w-full md:w-56 h-full border-r border-[#222222] p-3 space-y-0.5 bg-[#0a0a0a]">
        <div className="px-3 py-2 mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Preferences
          </h2>
        </div>

        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = settingsSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => setSettingsSection(sec.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1a1a1a] text-[#ededed] border border-[#2e2e2e]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#ededed]' : 'text-zinc-500'
                }`}
              />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content Pane */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#000000]">
        {settingsSection === 'general' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">General Preferences</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Customize startup and interaction behavior.</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Audio Feedback Cues</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
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

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Estimated Typing Speed (WPM)</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
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
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">Dictation & Hotkeys</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Configure push-to-talk and global triggers.</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Primary Dictation Shortcut</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Hold or press to activate voice dictation in any app.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hotkey}
                    onChange={(e) => setHotkey(e.target.value)}
                    className="w-36 bg-[#0a0a0a] border border-[#262626] rounded px-2.5 py-1 text-xs text-white text-center font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Secondary Command Shortcut</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Hold to ask AI, edit selected text, or run voice commands.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={secondaryHotkey}
                    onChange={(e) => setSecondaryHotkey(e.target.value)}
                    className="w-36 bg-[#0a0a0a] border border-[#262626] rounded px-2.5 py-1 text-xs text-white text-center font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Push-to-Talk Mode</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
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

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f0f11] border border-[#222222]">
                <div>
                  <p className="text-xs font-medium text-[#ededed]">Smart Auto-Paste</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Immediately insert transcribed text into the active cursor.
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
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">Audio & Input Devices</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Select and calibrate your recording microphone.</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-3">
              <label className="block text-xs font-medium text-zinc-300">
                Microphone Input Device
              </label>
              <select
                value={selectedInputDevice}
                onChange={(e) => setSelectedInputDevice(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#444444]"
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
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">Overlay & Visualizer Style</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Choose your preferred on-screen visualizer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'notch', title: 'Dynamic Notch (Top)', desc: 'Top-screen dock hugging the bezel with live audio waveform' },
                { id: 'minimal', title: 'Minimal Pill', desc: 'Compact floating recording indicator' },
                { id: 'hidden', title: 'Hidden Mode', desc: 'No visual overlay, audio feedback only' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setOverlayStyle(style.id as OverlayStyle)}
                  className={`p-4 rounded-lg text-left transition-colors border ${
                    overlayStyle === style.id
                      ? 'bg-[#141414] border-[#ededed]'
                      : 'bg-[#0f0f11] border-[#222222] hover:border-[#333333]'
                  }`}
                >
                  <p className="text-xs font-medium text-[#ededed]">{style.title}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {settingsSection === 'data' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">Data & Local Storage</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Manage local transcription history and audio files.</p>
            </div>

            <div className="p-4 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#ededed] font-medium">Local Dictation Cache</span>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium border border-red-500/20 transition-colors"
                >
                  Clear Audio Cache
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                All voice recordings and transcripts remain 100% on your local disk.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
