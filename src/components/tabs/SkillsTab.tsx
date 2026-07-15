import React from "react";
import { AppState } from "../../hooks/useAppState";
import { Wrench, Plus, Terminal } from "lucide-react";

interface Props {
  state: AppState;
}

export default function SkillsTab({ state }: Props) {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Agent Skills</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure the capabilities of your AI Assistant</p>
        </div>
        <button className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="flex-1 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-[var(--bg-surface-elevated)] rounded-2xl flex items-center justify-center mb-4 text-[var(--accent-primary)] border border-[var(--border-subtle)] shadow-sm">
          <Wrench size={32} />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No Skills configured</h3>
        <p className="text-[var(--text-secondary)] max-w-md text-sm leading-relaxed mb-6">
          Skills allow Gemma or your Cloud Assistant to execute terminal commands, edit code, or interact with other applications on your system.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] transition-all font-medium text-sm">
          <Terminal size={16} />
          <span>Setup Terminal Access</span>
        </button>
      </div>
    </div>
  );
}
