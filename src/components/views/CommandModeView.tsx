import React, { useState } from 'react';
import { Zap, Terminal, Play, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const CommandModeView: React.FC = () => {
  const { secondaryHotkey } = useAppStore();

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
          <Zap className="w-5 h-5 text-amber-400" /> Command Mode & Prompt Injection
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Control your computer hands-free. Press <kbd className="px-2 py-0.5 rounded-md bg-[#18181c] text-amber-400 font-mono border border-[#2a2a32] font-semibold">{secondaryHotkey || '⌃⌥Space'}</kbd> and speak system commands, app launches, or custom workflows.
        </p>
      </div>

      {/* Interactive Command Execution Box */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" /> Test Voice Command Execution
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={testCommand}
            onChange={(e) => setTestCommand(e.target.value)}
            placeholder="Type or speak a command (e.g. Launch Cursor, Lock Screen)..."
            className="flex-1 bg-[#09090b] border border-[#1e1e24] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
          />
          <button
            onClick={handleRunCommand}
            className="btn-swift-primary text-xs"
          >
            <Play className="w-3.5 h-3.5" /> Execute
          </button>
        </div>

        {/* Execution Log */}
        {executedLog.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#1e1e24] space-y-1 font-mono text-[11px]">
            {executedLog.map((log, i) => (
              <div key={i} className="text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Built-in Voice Command Reference List */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Built-in Spoken Commands Reference
        </h2>

        <div className="space-y-2">
          {SAMPLE_COMMANDS.map((cmd, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#09090b] border border-[#1e1e24] flex items-center justify-between hover:border-[#2a2a32] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white font-mono">"{cmd.voice}"</span>
                <span className="text-zinc-500">→</span>
                <span className="text-xs text-zinc-300">{cmd.action}</span>
              </div>
              <button
                onClick={() => setTestCommand(cmd.voice)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-2 py-1 rounded-md hover:bg-amber-500/10 transition-colors"
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
