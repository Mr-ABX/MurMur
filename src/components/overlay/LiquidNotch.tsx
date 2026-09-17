import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/appStore';

export const LiquidNotch: React.FC = () => {
  const {
    isRecording,
    audioLevel,
    streamingText,
    recordingMode,
  } = useAppStore();

  const isCommand = recordingMode === 'command';

  // 7 Equalizer Bars calculation based on live audio level
  const bars = [0.3, 0.6, 0.9, 1.0, 0.85, 0.5, 0.35];

  if (!isRecording) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 450 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-none"
      >
        <div className="rounded-b-2xl px-4 py-2.5 w-[330px] max-w-[90vw] flex flex-col items-center gap-1.5 bg-[#0a0a0a] border-x border-b border-[#262626] shadow-2xl backdrop-blur-xl">
          {/* Top Row: Equalizer Bars + Mode Badge */}
          <div className="flex items-center gap-2">
            {/* 7 Vertical Equalizer Bars */}
            <div className="flex items-center gap-[2.5px] h-3">
              {bars.map((mult, i) => {
                const heightPercent = Math.max(20, Math.min(100, audioLevel * 100 * mult * 2.5));
                return (
                  <div
                    key={i}
                    className={`w-[2.5px] rounded-full transition-all duration-75 ${
                      isCommand ? 'bg-red-500' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Mode Name */}
            <span
              className={`text-[11px] font-semibold tracking-wide ${
                isCommand ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isCommand ? 'Command' : 'Dictate'}
            </span>
          </div>

          {/* Bottom Row: Streaming Speech Preview */}
          <div className="w-full text-center px-1">
            <p className="text-xs text-[#ededed] font-medium leading-tight line-clamp-2">
              {streamingText ? (
                <>
                  <span>{streamingText}</span>
                  <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse align-middle" />
                </>
              ) : (
                <span className="text-zinc-500 text-[11px]">Listening to your voice...</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
