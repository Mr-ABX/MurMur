import React, { useState } from 'react';
import { BookA, Plus, Trash2 } from 'lucide-react';
import { useAppStore, CustomDictionaryEntry } from '../../stores/appStore';

export const CustomDictionaryView: React.FC = () => {
  const { dictionaryEntries, addDictionaryEntry, updateDictionaryEntry, deleteDictionaryEntry } =
    useAppStore();

  const [trigger, setTrigger] = useState('');
  const [replacement, setReplacement] = useState('');
  const [category, setCategory] = useState<'word' | 'punctuation' | 'acronym'>('word');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!trigger.trim() || !replacement.trim()) return;

    const newEntry: CustomDictionaryEntry = {
      id: `dict-${Date.now()}`,
      trigger: trigger.trim().toLowerCase(),
      replacement: replacement.trim(),
      category,
      isEnabled: true,
    };

    addDictionaryEntry(newEntry);
    setTrigger('');
    setReplacement('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
            <BookA className="w-5 h-5 text-emerald-400" /> Custom Dictionary & Vocabulary Boosting
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ensure proper names, specialized jargon, and spoken punctuation commands (like "period" → ".") are transcribed with 100% accuracy.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-liquid-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Dictionary Entry</span>
        </button>
      </div>

      {/* Add Entry Form */}
      {isAdding && (
        <div className="p-5 rounded-lg bg-[#0f0f11] border border-[#333333] space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
            New Dictionary Rule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-medium">When you say (Spoken Trigger)</label>
              <input
                type="text"
                placeholder="e.g. k8s, new line, postgres"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Type this (Exact Replacement)</label>
              <input
                type="text"
                placeholder="e.g. Kubernetes, \n, PostgreSQL"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#444444]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Rule Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#444444]"
              >
                <option value="word">Technical Word</option>
                <option value="punctuation">Spoken Punctuation</option>
                <option value="acronym">Acronym / Abbreviation</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="btn-liquid-ghost px-3.5 py-1.5 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="btn-liquid-primary px-4 py-1.5 text-xs font-semibold"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Dictionary Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dictionaryEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-3.5 rounded-lg bg-[#0f0f11] border border-[#222222] flex items-center justify-between gap-3 hover:border-[#333333] transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">"{entry.trigger}"</span>
                <span className="text-zinc-500">→</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {entry.replacement === '\n'
                    ? '[New Line]'
                    : entry.replacement === '\n\n'
                    ? '[New Paragraph]'
                    : entry.replacement}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 capitalize font-medium">
                {entry.category} rule
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={entry.isEnabled}
                onChange={(e) =>
                  updateDictionaryEntry(entry.id, { isEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <button
                onClick={() => deleteDictionaryEntry(entry.id)}
                className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
