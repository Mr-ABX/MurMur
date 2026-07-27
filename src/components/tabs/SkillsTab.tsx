import { useState, useEffect } from "react";
import { AppState } from "../../hooks/useAppState";
import { Wrench, Plus, Terminal, Trash2 } from "lucide-react";

interface Props {
  state: AppState;
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

export default function SkillsTab({}: Props) {
  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem("murmur-skills");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load skills:", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("murmur-skills", JSON.stringify(skills));
  }, [skills]);

  const addSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "New Skill",
      description: "Description of the skill.",
    };
    setSkills([...skills, newSkill]);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Agent Skills</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure the capabilities of your AI Assistant</p>
        </div>
        <button 
          onClick={addSkill}
          className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="flex-1 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] overflow-hidden flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-[var(--bg-surface-elevated)] rounded-2xl flex items-center justify-center mb-4 text-[var(--accent-primary)] border border-[var(--border-subtle)] shadow-sm">
            <Wrench size={32} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No Skills configured</h3>
          <p className="text-[var(--text-secondary)] max-w-md text-sm leading-relaxed mb-6">
            Skills allow Gemma or your Cloud Assistant to execute terminal commands, edit code, or interact with other applications on your system.
          </p>
          <button 
            onClick={addSkill}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] transition-all font-medium text-sm"
          >
            <Terminal size={16} />
            <span>Setup Terminal Access</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {skills.map(skill => (
            <div key={skill.id} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2 relative group">
              <button 
                onClick={() => removeSkill(skill.id)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <input 
                value={skill.name}
                onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, name: e.target.value } : s))}
                className="bg-transparent font-bold text-lg text-[var(--text-primary)] focus:outline-none w-[90%]"
                placeholder="Skill Name"
              />
              <textarea
                value={skill.description}
                onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, description: e.target.value } : s))}
                className="bg-transparent text-sm text-[var(--text-secondary)] focus:outline-none resize-none w-full"
                placeholder="Skill Description"
                rows={2}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
