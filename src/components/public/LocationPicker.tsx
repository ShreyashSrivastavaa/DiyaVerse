"use client";

import React from "react";
import { INDIA_STATES } from "@/lib/geo/indiaStates";

interface LocationPickerProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedState,
  onStateChange,
  city,
  onCityChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3 bg-night-900/60 border border-night-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor="state-select"
            className="block text-xs font-bold uppercase tracking-wider text-flame-400"
          >
            Location on India Map • आपका स्थान 📍
          </label>
          <p className="text-[11px] text-ivory-300/60 mt-0.5">
            Your diya will glow over your state on the nationwide map.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* State Dropdown */}
        <div>
          <label htmlFor="state-select" className="block text-[11px] font-medium text-ivory-200 mb-1">
            State / Union Territory *
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3.5 py-2.5 bg-night-950 border border-night-750 focus:border-flame-400 rounded-xl text-base text-ivory-100 outline-none transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            <option value="">Select your state (राज्य चुनें)...</option>
            {INDIA_STATES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.hindiName})
              </option>
            ))}
          </select>
        </div>

        {/* City Input */}
        <div>
          <label htmlFor="city-input" className="block text-xs font-medium text-ivory-200 mb-1">
            City / Town (Optional)
          </label>
          <input
            id="city-input"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
            maxLength={50}
            autoComplete="address-level2"
            inputMode="text"
            placeholder="e.g. Ayodhya, Varanasi, Mumbai"
            className="w-full px-3.5 py-2.5 bg-night-950 border border-night-750 focus:border-flame-400 rounded-xl text-base text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors disabled:opacity-50 min-h-[44px]"
          />
        </div>
      </div>
    </div>
  );
};
