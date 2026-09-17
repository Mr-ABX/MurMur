import React from 'react';
import { BarChart3, Clock, Sparkles, Flame, Award } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const StatsView: React.FC = () => {
  const {
    wordsToday,
    timeSavedMinutesToday,
    currentStreakDays,
    totalWordsDictated,
    totalTranscriptions,
    activityHistory,
    typingWPM,
  } = useAppStore();

  const maxWords = Math.max(...activityHistory.map((a) => a.words), 100);

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 bg-[#000000] text-[#ededed]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#ededed] tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" /> Productivity Stats & Insights
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed metrics calculating your typing time saved, speaking speed, and dictation streaks.
        </p>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Words Today */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-1 hover:border-[#2a2a32] transition-colors">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
            <span>Words Today</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{wordsToday.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-medium">~{Math.round(wordsToday / 250)} pages written</p>
        </div>

        {/* Time Saved Today */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-1 hover:border-[#2a2a32] transition-colors">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
            <span>Time Saved</span>
            <Clock className="w-4 h-4 text-zinc-300" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{timeSavedMinutesToday.toFixed(1)}m</p>
          <p className="text-[11px] text-zinc-400 font-medium">vs {typingWPM} WPM typing</p>
        </div>

        {/* Day Streak */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-1 hover:border-[#2a2a32] transition-colors">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{currentStreakDays} Days</p>
          <p className="text-[11px] text-amber-400 font-medium">Personal Best: 14 Days</p>
        </div>

        {/* All-Time Words */}
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-1 hover:border-[#2a2a32] transition-colors">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
            <span>All-Time Total</span>
            <Award className="w-4 h-4 text-zinc-300" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalWordsDictated.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-400 font-medium">{totalTranscriptions} recordings</p>
        </div>
      </div>

      {/* 7-Day Activity Bar Chart */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-[#1e1e24] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
            7-Day Dictation Activity
          </h2>
          <span className="text-xs text-zinc-500">Daily words dictated</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
          {activityHistory.map((item, index) => {
            const heightPercent = Math.max((item.words / maxWords) * 100, 12);

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-200 transition-colors">
                  {item.words}
                </span>
                <div className="w-full max-w-[40px] bg-[#09090b] border border-[#1e1e24] rounded-xl h-32 flex items-end p-1.5 overflow-hidden">
                  <div
                    className="w-full bg-white rounded-lg transition-all duration-300 group-hover:bg-emerald-400"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-zinc-400">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
