import React, { useState } from 'react';
import {
  Users,
  Upload,
  FileText,
  Download,
  Copy,
  Check,
} from 'lucide-react';

export const MeetingTranscriptionView: React.FC = () => {
  const [meetingNotes, setMeetingNotes] = useState(
    '# Product Strategy Review — 2026 Q3\n\n' +
      '**Attendees:** Product Lead, Lead Architect, Frontend Lead\n\n' +
      '### Key Discussion Points:\n' +
      '1. **DopeNotch Architecture**: Migration to Tauri v2 + React complete. Achieved sub-80ms streaming latency.\n' +
      '2. **Dynamic Island Top Notch**: Implemented sleek bezel dock with audio visualizer and live text.\n' +
      '3. **Hardware Acceleration**: Confirmed Intel AVX2 and Apple Metal acceleration for zero-lag CPU/GPU inference.\n\n' +
      '### Action Items:\n' +
      '- [ ] Finalize custom dictionary boosting terms\n' +
      '- [ ] Run beta verification across macOS and Windows 11'
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'txt' | 'md' | 'json') => {
    const element = document.createElement('a');
    let content = meetingNotes;
    let mime = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify({ title: 'Meeting Transcription', text: meetingNotes }, null, 2);
      mime = 'application/json';
    }

    const file = new Blob([content], { type: mime });
    element.href = URL.createObjectURL(file);
    element.download = `Meeting_Transcription_${Date.now()}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Meeting Tools & File Transcription
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Transcribe audio/video files (.mp3, .wav, .m4a, .mp4) or record long-form meetings with automatic Markdown formatting.
          </p>
        </div>
      </div>

      {/* File Dropzone */}
      <div className="p-8 rounded-2xl bg-[#121215] border-dashed border border-[#2a2a32] hover:border-amber-400/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-[#18181c] border border-[#2a2a32] text-zinc-300 flex items-center justify-center mb-3 group-hover:text-white transition-colors">
          <Upload className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-xs font-semibold text-[#ededed]">Drag & drop audio or video file</h3>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
          Supports MP3, WAV, M4A, AAC, MP4, and MOV files up to 2 GB for batch offline transcription.
        </p>
      </div>

      {/* Live Meeting Notes Editor Card */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
              Meeting Notes & Transcript
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-swift-ghost text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => handleExport('md')}
              className="btn-swift-primary text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl p-4 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-white/30 resize-none"
        />
      </div>
    </div>
  );
};
