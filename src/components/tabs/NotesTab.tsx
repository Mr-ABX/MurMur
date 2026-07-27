import React, { useState } from "react";
import { Plus, Trash2, Mic, FileText } from "lucide-react";
import { AppState } from "../../hooks/useAppState";

interface Props {
  state: AppState;
}

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function NotesTab({}: Props) {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("murmur-notes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load notes:", e);
    }
    return [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem("murmur-notes", JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      timestamp: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar for Notes List */}
      <div className="w-1/3 flex flex-col gap-4 border-r border-[var(--border-subtle)] pr-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Your Notes</h2>
          <button 
            onClick={createNote}
            className="p-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)]">
              <FileText className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">No notes yet.</p>
              <p className="text-xs mt-1">Create one to start writing or dictating.</p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`text-left p-3 rounded-xl transition-all border ${
                  activeNoteId === note.id
                    ? "bg-[var(--bg-surface-elevated)] border-[var(--accent-primary)]/50 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]"
                }`}
              >
                <div className="font-medium text-[var(--text-primary)] truncate">{note.title}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                  {note.content || "Empty note..."}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-elevated)]">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={(e) => {
                  setNotes(notes.map(n => n.id === activeNoteId ? { ...n, title: e.target.value } : n));
                }}
                className="bg-transparent text-lg font-bold text-[var(--text-primary)] focus:outline-none w-full"
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2">
                <button 
                  title="Dictate with Whisper"
                  className="p-2 rounded-lg text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
                >
                  <Mic size={18} />
                </button>
                <button 
                  onClick={() => {
                    setNotes(notes.filter(n => n.id !== activeNoteId));
                    setActiveNoteId(null);
                  }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => {
                setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content: e.target.value } : n));
              }}
              className="flex-1 w-full bg-transparent p-6 text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed"
              placeholder="Start typing or use the mic to dictate..."
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <FileText size={48} className="opacity-20 mb-4" />
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
