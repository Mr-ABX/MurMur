import React from 'react';
import { Mic, Sliders, Power, Copy } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';

interface Props {
  onOpenSettings?: () => void;
}

export const TrayMenu: React.FC<Props> = () => {
  const { isRecording, hotkey, setSuperNotchMode } = useAppStore();

  const handleToggleRecord = async () => {
    try {
      if (isRecording) {
        await invoke('stop_recording');
      } else {
        await invoke('start_recording');
      }
    } catch (err) {
      console.error('Failed to toggle recording from tray:', err);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      await invoke('open_settings');
    } catch (err) {
      console.error('Failed to open dashboard:', err);
    }
  };

  const handleOpenShelf = async () => {
    try {
      await invoke('preview_notch');
      setSuperNotchMode('shelf');
    } catch (err) {
      console.error('Failed to open shelf:', err);
    }
  };

  const handleQuit = async () => {
    await invoke('quit_app');
  };

  // Format hotkey for display (e.g., Control+Option -> ⌃ ⌥)
  const hotkeyParts = (hotkey || 'Control+Option')
    .replace(/CommandOrControl|Control/g, '⌃')
    .replace(/Option|Alt/g, '⌥')
    .replace(/Shift/g, '⇧')
    .replace(/Space/g, 'Space')
    .split('+')
    .filter(Boolean);

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-2 rounded-2xl overflow-hidden select-none"
      style={{
        background: '#0a0a0a',
        border: '1px solid #222222',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 1px #333333',
      }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center shadow-inner">
              <span className="text-[11px] font-black text-white tracking-tighter">DN</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#ededed] leading-none">DopeNotch</p>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#1e1e1e] text-zinc-400 border border-[#333333]">
                  TOP-NOTCH
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <p className="text-[10px] text-zinc-400">{isRecording ? 'Dictating...' : 'Ready on-device'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hotkeyParts.map((k, i) => (
              <kbd key={i} className="px-1.5 py-0.5 text-[10px] rounded font-mono bg-[#171717] text-zinc-300 border border-[#2e2e2e]">
                {k}
              </kbd>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="py-1.5 space-y-1">
        <button
          onClick={handleToggleRecord}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isRecording
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-[#161616]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Mic size={14} className={isRecording ? 'text-red-400 animate-pulse' : 'text-zinc-400'} />
            <span>{isRecording ? 'Stop Dictation' : 'Start Dictation'}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Press & Speak</span>
        </button>

        <button
          onClick={handleOpenShelf}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#161616] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Copy size={14} className="text-zinc-400" />
            <span>Clipboard Shelf</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">SuPaste Notch</span>
        </button>

        <button
          onClick={handleOpenDashboard}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#161616] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sliders size={14} className="text-zinc-400" />
            <span>Open Dashboard</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Models & Rules</span>
        </button>
      </div>

      {/* Footer / Quit */}
      <div className="pt-1.5 border-t border-[#1f1f1f]">
        <button
          onClick={handleQuit}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Power size={13} />
            <span>Quit DopeNotch</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">⌘Q</span>
        </button>
      </div>
    </div>
  );
};

export default TrayMenu;
