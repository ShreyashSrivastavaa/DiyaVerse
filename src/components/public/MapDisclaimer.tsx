import React from "react";

interface MapDisclaimerProps {
  className?: string;
}

/**
 * MapDisclaimer Component
 * Displays a small, unobtrusive and accessible reference caption directly below India map visualisations.
 */
export const MapDisclaimer: React.FC<MapDisclaimerProps> = ({ className = "" }) => {
  return (
    <figcaption
      aria-label="Map reference disclaimer"
      className={`text-center sm:text-left text-[11px] sm:text-[12px] text-ivory-300/60 leading-relaxed px-2 py-1.5 max-w-full break-words select-none ${className}`}
    >
      <span className="inline-block mr-1 opacity-70">ℹ️</span>
      <span>
        Map is for reference only and does not depict accurate international boundaries.
      </span>
    </figcaption>
  );
};
