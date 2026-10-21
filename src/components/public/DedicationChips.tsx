"use client";

import React from "react";

export type DedicationType = "family" | "friends" | "loved_ones" | "world" | "custom" | null;

interface DedicationChipsProps {
  dedication: DedicationType;
  dedicationText: string;
  onDedicationChange: (dedication: DedicationType) => void;
  onDedicationTextChange: (text: string) => void;
  disabled?: boolean;
}

const CHIPS: { id: DedicationType; label: string; hindiLabel: string }[] = [
  { id: "family", label: "For my family", hindiLabel: "परिवार के लिए" },
  { id: "friends", label: "For my friends", hindiLabel: "दोस्तों के लिए" },
  { id: "loved_ones", label: "For someone I love", hindiLabel: "प्रियजनों के लिए" },
  { id: "world", label: "For the world", hindiLabel: "विश्व शांति के लिए" },
  { id: "custom", label: "Someone else...", hindiLabel: "अन्य कोई..." },
];

export const DedicationChips: React.FC<DedicationChipsProps> = ({
  dedication,
  dedicationText,
  onDedicationChange,
  onDedicationTextChange,
  disabled,
}) => {
  const handleChipClick = (id: DedicationType) => {
    if (disabled) return;
    if (dedication === id) {
      onDedicationChange(null);
      onDedicationTextChange("");
    } else {
      onDedicationChange(id);
      if (id !== "custom") {
        onDedicationTextChange("");
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ivory-300">
          3. Dedicate Diya / समर्पण (वैकल्पिक)
        </label>
        {dedication && (
          <button
            type="button"
            onClick={() => {
              onDedicationChange(null);
              onDedicationTextChange("");
            }}
            disabled={disabled}
            className="text-xs text-flame-400/80 hover:text-flame-300 underline cursor-pointer"
          >
            Clear / हटाएं
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const isSelected = dedication === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              disabled={disabled}
              onClick={() => handleChipClick(chip.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-flame-400 flex flex-col justify-center items-center ${
                isSelected
                  ? "bg-flame-500 text-night-950 font-semibold shadow-[0_0_12px_rgba(255,159,28,0.4)]"
                  : "bg-night-900/70 border border-night-800 text-ivory-300 hover:border-night-700 hover:text-ivory-100 hover:bg-night-850"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span>{chip.label}</span>
              <span className="text-[10px] opacity-75 font-hindi">{chip.hindiLabel}</span>
            </button>
          );
        })}
      </div>

      {dedication === "custom" && (
        <div className="pt-1 space-y-1.5 animate-fade-in">
          <div className="relative">
            <input
              type="text"
              value={dedicationText}
              onChange={(e) => onDedicationTextChange(e.target.value.slice(0, 30))}
              disabled={disabled}
              maxLength={30}
              placeholder="e.g. For Maa, For Dadi, For Teachers..."
              className="w-full px-4 py-2.5 bg-night-900/80 border border-night-800 rounded-xl text-ivory-50 placeholder-ivory-300/40 text-sm focus:border-flame-400 focus:ring-1 focus:ring-flame-400 outline-none transition-all disabled:opacity-50"
            />
            <span className="absolute right-3 top-2.5 text-xs text-ivory-300/50 font-mono">
              {dedicationText.length}/30
            </span>
          </div>
          <p className="text-[11px] text-ivory-300/60">
            Avoid full names and phone numbers to protect your privacy.
          </p>
        </div>
      )}
    </div>
  );
};
