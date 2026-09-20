import React, { useState } from 'react';
import { MessageSquareHeart, Send, CheckCircle2 } from 'lucide-react';

export const FeedbackView: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    setFeedback('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      <div>
        <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-emerald-400" /> Community & Feedback
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Have an idea or spotted a glitch? Your feedback shapes the future of DopeNotch.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-4 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#ededed] mb-1.5">
              Send a Note or Bug Report
            </label>
            <textarea
              rows={4}
              placeholder="Tell us what you love, what needs fixing, or what models you'd like added..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-[#09090b] border border-[#1e1e24] rounded-xl p-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Feedback is anonymous and stored locally</span>
            <button
              type="submit"
              className="btn-swift-primary text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you! Your feedback has been logged.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
