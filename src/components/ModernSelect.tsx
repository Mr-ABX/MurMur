import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ModernSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = "Select option...",
  className = "",
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isSmall = size === "sm";

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl transition-all duration-200 cursor-pointer outline-none border ${
          isOpen
            ? "border-indigo-500/60 ring-2 ring-indigo-500/20 bg-[var(--bg-surface-elevated)] shadow-lg"
            : "border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] shadow-sm"
        } ${isSmall ? "px-2.5 py-1 text-xs" : "px-3.5 py-2.5 text-sm"} text-[var(--text-primary)]`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="text-[var(--accent-primary)] shrink-0">{selectedOption.icon}</span>
          )}
          <span className="font-medium truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-[var(--text-secondary)] shrink-0"
        >
          <ChevronDown size={isSmall ? 12 : 15} />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 max-h-60 overflow-y-auto rounded-xl p-1.5 backdrop-blur-2xl bg-[var(--bg-surface-elevated)]/95 border border-[var(--border-strong)] shadow-2xl no-scrollbar ring-1 ring-black/10"
            style={{
              boxShadow: "0 16px 40px -8px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.05)",
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const isDisabled = option.disabled;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed text-[var(--text-secondary)]"
                      : "cursor-pointer"
                  } ${
                    isSmall ? "text-xs py-1.5" : "text-sm"
                  } ${
                    isSelected
                      ? "bg-indigo-500/15 text-indigo-400 font-semibold"
                      : isDisabled
                      ? ""
                      : "text-[var(--text-primary)] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span
                        className={`shrink-0 ${
                          isSelected ? "text-indigo-400" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[11px] text-[var(--text-secondary)] font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-indigo-400 shrink-0"
                    >
                      <Check size={isSmall ? 12 : 14} />
                    </motion.span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
