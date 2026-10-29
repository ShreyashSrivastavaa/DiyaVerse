"use client";

import React, { useRef, useState } from "react";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";
import { MatchstickIgniter } from "./MatchstickIgniter";

interface StylePickerProps {
  selected: DiyaStyle;
  onChange: (style: DiyaStyle) => void;
  disabled?: boolean;
}

const STYLES: { id: DiyaStyle; name: string; hindiName: string; desc: string }[] = [
  { id: "clay", name: "Classic Clay", hindiName: "मिट्टी का दीया", desc: "Traditional terracotta diya" },
  { id: "marigold", name: "Marigold", hindiName: "गेंदा दीया", desc: "Ringed with sacred marigold petals" },
  { id: "rangoli", name: "Rangoli", hindiName: "रंगोली दीया", desc: "Adorned on a festive floor pattern" },
  { id: "golden", name: "Golden Brass", hindiName: "पीतल दीया", desc: "Reflective metallic brass glow" },
  { id: "lotus", name: "Sacred Lotus", hindiName: "कमल दीया", desc: "Floating on a radiant lotus blossom" },
];

export const StylePicker: React.FC<StylePickerProps> = ({ selected, onChange, disabled }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [strikePos, setStrikePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isIgniting, setIsIgniting] = useState(false);
  const [justIgnited, setJustIgnited] = useState<string | null>(null);

  const handleSelectStyle = (styleId: DiyaStyle) => {
    if (disabled) return;

    // Trigger matchstick animation if choosing a new style or tapping
    const btn = buttonRefs.current[styleId];
    const container = containerRef.current;

    if (btn && container) {
      const bRect = btn.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      setStrikePos({
        x: bRect.left - cRect.left + bRect.width / 2,
        y: bRect.top - cRect.top + 26, // touches the wick
      });
      setIsIgniting(true);
      setJustIgnited(styleId);
    }

    onChange(styleId);
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-visible select-none">
      {/* Flying & Striking Matchstick with Festive Golden Sparks */}
      <MatchstickIgniter
        targetX={strikePos.x}
        targetY={strikePos.y}
        isIgniting={isIgniting}
        onIgnitionComplete={() => {
          setIsIgniting(false);
          setJustIgnited(null);
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
        <label id="style-picker-label" className="block text-sm font-semibold text-ivory-200">
          1. Choose Diya Style / दीया का प्रकार चुनें
        </label>
        <span className="text-[11px] text-flame-400 font-hindi flex items-center gap-1.5 animate-pulse">
          <span>🔥</span>
          <span>दीया चुनने पर तीली से प्रज्वलित होगा</span>
        </span>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="style-picker-label"
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3"
      >
        {STYLES.map((style) => {
          const isSelected = selected === style.id;
          const isIgnitedNow = justIgnited === style.id;

          return (
            <button
              key={style.id}
              ref={(el) => {
                buttonRefs.current[style.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleSelectStyle(style.id)}
              className={`relative min-h-[114px] p-3 rounded-2xl border flex flex-col items-center justify-between transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-flame-400 group overflow-hidden last:col-span-2 xs:last:col-span-1 ${
                isSelected
                  ? "bg-night-800/95 border-flame-400 shadow-[0_0_22px_rgba(255,159,28,0.35)] scale-[1.03]"
                  : "bg-night-900/60 border-night-800 hover:border-flame-400/40 hover:bg-night-850/80 opacity-75 hover:opacity-95"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {/* Ignition Flash Ring */}
              {isIgnitedNow && (
                <span className="absolute inset-0 rounded-2xl bg-flame-400/20 animate-ping pointer-events-none" />
              )}

              {/* Ambient warmth underneath lit diya */}
              {isSelected && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-flame-400/20 blur-xl pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Diya Sprite: Lit when selected, unlit awaiting matchstick when unselected */}
              <div
                className={`w-16 h-12 flex items-center justify-center pointer-events-none transition-transform duration-300 ${
                  isIgnitedNow ? "scale-125" : isSelected ? "scale-105" : "scale-95 group-hover:scale-100"
                }`}
              >
                <DiyaSprite style={style.id} size="sm" isLit={isSelected} />
              </div>

              <div className="text-center mt-2 relative z-10">
                <span
                  className={`block text-xs font-semibold transition-colors ${
                    isSelected ? "text-flame-300" : "text-ivory-100 group-hover:text-flame-200"
                  }`}
                >
                  {style.name}
                </span>
                <span className="block text-[10px] text-ivory-300/70 font-hindi mt-0.5">
                  {style.hindiName}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
