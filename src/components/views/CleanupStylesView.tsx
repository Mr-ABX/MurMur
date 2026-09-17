import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  Sliders,
  MessageSquare,
  Mail,
  Code,
  FileText,
  Layers,
} from 'lucide-react';
import { useAppStore, PromptRoutingRule } from '../../stores/appStore';

export const CleanupStylesView: React.FC = () => {
  const { promptRules, addPromptRule, updatePromptRule, deletePromptRule } = useAppStore();

  const [newAppName, setNewAppName] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateRule = () => {
    if (!newAppName.trim() || !newPrompt.trim()) return;

    const newRule: PromptRoutingRule = {
      id: `rule-${Date.now()}`,
      appName: newAppName.trim(),
      appIdentifier: newAppName.toLowerCase().replace(/\s+/g, '.'),
      icon: 'Layers',
      styleName: newStyleName.trim() || 'Custom Tone',
      prompt: newPrompt.trim(),
      isEnabled: true,
    };

    addPromptRule(newRule);
    setNewAppName('');
    setNewStyleName('');
    setNewPrompt('');
    setIsAdding(false);
  };

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return MessageSquare;
      case 'Mail':
        return Mail;
      case 'Code':
        return Code;
      case 'FileText':
        return FileText;
      default:
        return Layers;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" /> Cleanup Styles & Per-App Rules
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Automatically adapt your voice dictation tone, formatting, and structure based on the active application.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-liquid-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add App Rule</span>
        </button>
      </div>

      {/* Add Rule Form */}
      {isAdding && (
        <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#333333] space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> New Per-App Prompt Rule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Application Name</label>
              <input
                type="text"
                placeholder="e.g. Discord, Telegram, Linear"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Tone / Style Name</label>
              <input
                type="text"
                placeholder="e.g. Concise Bullet Points, Punchy Casual"
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1 font-medium">AI System Prompt Instruction</label>
            <textarea
              rows={2}
              placeholder="e.g. Clean up transcription. Make it direct, friendly, and format any tasks as markdown checkboxes."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="btn-liquid-ghost px-3.5 py-1.5 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRule}
              className="btn-liquid-primary px-4 py-1.5 text-xs font-semibold"
            >
              Save Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {promptRules.map((rule) => {
          const Icon = getAppIcon(rule.icon);

          return (
            <div key={rule.id} className="p-4 rounded-lg bg-[#0f0f11] border border-[#222222] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-zinc-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-[#ededed]">{rule.appName}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {rule.styleName}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">{rule.appIdentifier}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rule.isEnabled}
                    onChange={(e) => updatePromptRule(rule.id, { isEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <button
                    onClick={() => deletePromptRule(rule.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#0a0a0a] border border-[#1f1f1f]">
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  "{rule.prompt}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
