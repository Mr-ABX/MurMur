import React, { useState } from 'react';
import { Zap, Terminal, Play, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const CommandModeView: React.FC = () => {
  const { commandHotkey } = useAppStore();

  const [testCommand, setTestCommand] = useState('Open Cursor and mute volume');
  const [executedLog, setExecutedLog] = useState<string[]>([]);

  const SAMPLE_COMMANDS = [
    { voice: 'Open Cursor', action: 'Launch /Applications/Cursor.app' },
    { voice: 'Lock computer', action: 'Trigger macOS Screen Lock' },
    { voice: 'Set volume to 50%', action: 'Set System Output Volume to 50%' },
    { voice: 'Empty trash', action: 'Execute Finder Empty Trash' },
    { voice: 'Open GitHub', action: 'Navigate to https://github.com in default browser' },
  ];

  const handleRunCommand = () => {
    if (!testCommand.trim()) return;

    setExecutedLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Executed voice command: "${testCommand}"`,
      ...prev,
    ]);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" /> Command Mode
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Control your computer hands-free. Press <kbd className="px-2 py-0.5 rounded bg-[#1a1a1a] text-white font-mono border border-[#2e2e2e] font-semibold">{commandHotkey}</kbd> and speak system commands, app launches, or custom workflows.
        </p>
      </div>

      {/* Interactive Command Execution Box */}
      <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> Test Voice Command Execution
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={testCommand}
            onChange={(e) => setTestCommand(e.target.value)}
            placeholder="Type or speak a command (e.g. Launch Cursor, Lock Screen)..."
            className="flex-1 bg-[#0a0a0a] border border-[#222222] rounded-md px-3.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
          />
          <button
            onClick={handleRunCommand}
            className="btn-liquid-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Execute
          </button>
        </div>

        {/* Execution Log */}
        {executedLog.length > 0 && (
          <div className="p-3 rounded-md bg-[#0a0a0a] border border-[#222222] space-y-1 font-mono text-[11px]">
            {executedLog.map((log, i) => (
              <div key={i} className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Built-in Voice Command Reference List */}
      <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
          Built-in Spoken Commands Reference
        </h2>

        <div className="space-y-2">
          {SAMPLE_COMMANDS.map((cmd, i) => (
            <div
              key={i}
              className="p-3 rounded-md bg-[#0a0a0a] border border-[#222222] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white font-mono">"{cmd.voice}"</span>
                <span className="text-zinc-500">→</span>
                <span className="text-xs text-zinc-300">{cmd.action}</span>
              </div>
              <button
                onClick={() => setTestCommand(cmd.voice)}
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                Try It
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
