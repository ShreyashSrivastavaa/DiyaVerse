"use client";

import React from "react";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";

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
  return (
    <div className="w-full">
      <label id="style-picker-label" className="block text-sm font-medium text-ivory-300 mb-3">
        1. Choose Diya Style / दीया का प्रकार चुनें
      </label>
      <div
        role="radiogroup"
        aria-labelledby="style-picker-label"
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {STYLES.map((style) => {
          const isSelected = selected === style.id;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(style.id)}
              className={`min-h-[110px] p-3 rounded-xl border flex flex-col items-center justify-between transition-all duration-200 outline-none focus:ring-2 focus:ring-flame-400 ${
                isSelected
                  ? "bg-night-800/90 border-flame-400 shadow-[0_0_15px_rgba(255,159,28,0.3)] scale-[1.02]"
                  : "bg-night-900/60 border-night-800 hover:border-night-700 hover:bg-night-850 opacity-80 hover:opacity-100"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div className="w-16 h-12 flex items-center justify-center pointer-events-none">
                <DiyaSprite style={style.id} size="sm" isLit={true} />
              </div>
              <div className="text-center mt-2">
                <span className={`block text-xs font-semibold ${isSelected ? "text-flame-300" : "text-ivory-100"}`}>
                  {style.name}
                </span>
                <span className="block text-[10px] text-ivory-300/70 font-hindi">
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
