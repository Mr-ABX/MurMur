import React, { useState, useEffect } from "react";
import { Plus, Trash2, Mic, FileText, Eye, Edit3, Copy, Check } from "lucide-react";
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

// Fast, responsive Markdown renderer
function MarkdownRenderer({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-zinc-500 italic">Empty note. Type or speak to add content...</p>;
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-xs border border-white/5">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-zinc-200">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className="p-3 my-2 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={idx} className="text-lg font-bold text-white mt-3 mb-1.5">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={idx} className="text-base font-semibold text-white mt-2.5 mb-1">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-zinc-300 my-0.5 leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={idx} className="border-l-2 border-indigo-500 pl-3 my-2 text-zinc-400 italic text-sm">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(<p key={idx} className="text-zinc-300 my-1 leading-relaxed break-words">{renderInline(line)}</p>);
    }
  });

  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <pre key="code-final" className="p-3 my-2 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto">
        <code>{codeBlockLines.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function NotesTab({ state }: Props) {
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
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("murmur-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Dictation append integration
  useEffect(() => {
    if (state.recordingState === "done" && state.transcript && activeNoteId) {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === activeNoteId) {
            const separator = n.content.trim() ? " " : "";
            return { ...n, content: n.content + separator + state.transcript };
          }
          return n;
        })
      );
    }
  }, [state.recordingState, state.transcript, activeNoteId]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      timestamp: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setViewMode("edit");
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      {/* Sidebar for Notes List */}
      <div className="w-64 sm:w-72 flex-shrink-0 flex flex-col gap-3 border-r border-[var(--border-subtle)] pr-4 overflow-hidden">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Notes</h2>
            <p className="text-xs text-[var(--text-secondary)]">{notes.length} {notes.length === 1 ? "note" : "notes"}</p>
          </div>
          <button
            onClick={createNote}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar">
          {notes.length === 0 ? (
            <div className="text-center py-12 px-2 text-[var(--text-secondary)]">
              <FileText className="mx-auto mb-2.5 opacity-30 text-zinc-400" size={32} />
              <p className="text-xs font-medium text-zinc-300">No notes yet</p>
              <p className="text-[11px] text-zinc-500 mt-1">Click New or use voice to capture thoughts instantly.</p>
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = activeNoteId === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`text-left p-3 rounded-xl transition-all border w-full min-w-0 ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/40 shadow-sm"
                      : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/50 hover:border-white/10"
                  }`}
                >
                  <div className="font-semibold text-xs text-white truncate break-words">
                    {note.title || "Untitled Note"}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2 break-words leading-snug">
                    {note.content.trim() || "Empty note..."}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeNote ? (
          <div className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            {/* Note Header Bar */}
            <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--bg-surface-elevated)] flex-shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => {
                  setNotes(notes.map((n) => (n.id === activeNoteId ? { ...n, title: e.target.value } : n)));
                }}
                className="bg-transparent text-sm font-bold text-[var(--text-primary)] focus:outline-none flex-1 min-w-0 truncate"
                placeholder="Note Title"
              />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-zinc-900/90 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("edit")}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      viewMode === "edit"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="Edit Markdown"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      viewMode === "preview"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="Preview Rendered Markdown"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Voice Dictation Button */}
                <button
                  onClick={() => {
                    if (state.recordingState === "recording") {
                      state.stopRecording();
                    } else {
                      state.startRecording();
                    }
                  }}
                  title={state.recordingState === "recording" ? "Stop Dictation" : "Dictate with Whisper"}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    state.recordingState === "recording"
                      ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                      : "bg-zinc-900/80 border-white/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300"
                  }`}
                >
                  <Mic size={14} />
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopyNote}
                  title="Copy note content"
                  className="p-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    setNotes(notes.filter((n) => n.id !== activeNoteId));
                    setActiveNoteId(null);
                  }}
                  title="Delete note"
                  className="p-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Note Content (Edit or Preview) */}
            <div className="flex-1 overflow-y-auto p-5 min-w-0">
              {viewMode === "edit" ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => {
                    setNotes(notes.map((n) => (n.id === activeNoteId ? { ...n, content: e.target.value } : n)));
                  }}
                  className="w-full h-full bg-transparent text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed font-sans text-sm placeholder-zinc-500"
                  placeholder="Start typing or click the mic button above to dictate with Whisper... Supports Markdown (# heading, **bold**, - lists, `code`)."
                />
              ) : (
                <div className="w-full min-w-0">
                  <MarkdownRenderer content={activeNote.content} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] border border-dashed border-white/10 rounded-2xl p-8 text-center">
            <FileText size={42} className="opacity-20 mb-3 text-zinc-400" />
            <p className="text-sm font-semibold text-zinc-300">Select a note or create a new one</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">Capture quick ideas, meeting memos, or voice dictations in one place.</p>
          </div>
        )}
      </div>
    </div>
  );
}
