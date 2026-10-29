"use client";

import { useState, useEffect, useCallback } from "react";

export type JukeboxMode = "expanded" | "minimized" | "closed";

export const JUKEBOX_STORAGE_KEY = "diyaverse_jukebox_state";
export const JUKEBOX_RESTORE_EVENT = "diyaverse-open-jukebox";

/**
 * Custom hook to manage the festive jukebox player's display state:
 * - 'expanded': full pill player with controls, title, disc, and window actions.
 * - 'minimized': compact ~48px circular floating disc button in the corner.
 * - 'closed': player completely hidden, audio paused; restorable via navbar/footer.
 *
 * Persistence & SSR Guarantees:
 * - Accesses window / localStorage ONLY inside useEffect to prevent hydration mismatches.
 * - Default on mobile (<768px): 'minimized'.
 * - Default on desktop (>=768px): 'expanded'.
 * - Synchronizes state changes to localStorage so choices persist across navigation and reloads.
 * - Restores to 'expanded' on 'diyaverse-open-jukebox' window events.
 */
export function useJukeboxState() {
  const [displayMode, setDisplayMode] = useState<JukeboxMode | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(JUKEBOX_STORAGE_KEY) as JukeboxMode | null;
      if (saved && (saved === "expanded" || saved === "minimized" || saved === "closed")) {
        setDisplayMode(saved);
      } else {
        const isMobile = window.innerWidth < 768;
        setDisplayMode(isMobile ? "minimized" : "expanded");
      }
    } catch {
      setDisplayMode("minimized");
    }
  }, []);

  const updateMode = useCallback((newMode: JukeboxMode) => {
    setDisplayMode(newMode);
    try {
      localStorage.setItem(JUKEBOX_STORAGE_KEY, newMode);
    } catch {}
  }, []);

  // Listen for restore events from navbar or footer
  useEffect(() => {
    const handleRestore = () => {
      updateMode("expanded");
    };

    window.addEventListener(JUKEBOX_RESTORE_EVENT, handleRestore);
    return () => {
      window.removeEventListener(JUKEBOX_RESTORE_EVENT, handleRestore);
    };
  }, [updateMode]);

  return {
    displayMode,
    updateMode,
    isClient,
  };
}
