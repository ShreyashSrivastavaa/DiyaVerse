"use client";

import React, { useState, useEffect, useRef } from "react";
import { useJukeboxState } from "@/hooks/useJukeboxState";

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

const PLAYLIST: Track[] = [
  {
    id: "happy-diwali",
    title: "Happy Diwali",
    artist: "Vishal-Shekhar",
    src: "/audio/happy-diwali.mp3",
  },
  {
    id: "jethalal-remix",
    title: "Happy Diwali (Jethalal Remix)",
    artist: "Shivam",
    src: "/audio/happy-diwali-jethalal-remix.mp3",
  },
];

export function DiwaliJukebox() {
  const { displayMode, updateMode, isClient } = useJukeboxState();

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Select initial random track on client mount (no autoplay)
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * PLAYLIST.length);
    setCurrentIdx(randomStart);
  }, []);

  // Update audio source when track changes; only play if already playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = PLAYLIST[currentIdx].src;
    audio.load();

    if (isPlayingRef.current) {
      audio.play().catch((err) => {
        console.warn("Autoplay was prevented:", err);
        setIsPlaying(false);
      });
    }
  }, [currentIdx]);

  // Audio event listeners for playback state and track progression
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentIdx((prev) => {
        if (PLAYLIST.length <= 1) return 0;
        let next = Math.floor(Math.random() * PLAYLIST.length);
        if (next === prev) {
          next = (prev + 1) % PLAYLIST.length;
        }
        return next;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Playback error:", err);
      });
    }
  };

  const nextTrack = () => {
    setCurrentIdx((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateMode("minimized");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    updateMode("closed");
  };

  // Draggable support on pointer events
  useEffect(() => {
    const container = containerRef.current;
    if (!container || displayMode === "closed") return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      container.style.right = "auto";
      container.style.bottom = "auto";
      container.style.left = `${initialLeft}px`;
      container.style.top = `${initialTop}px`;
      container.style.transition = "none";
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxLeft = window.innerWidth - container.offsetWidth - 10;
      const maxTop = window.innerHeight - container.offsetHeight - 10;

      const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
      const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));

      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
      container.style.transition = "all 0.28s ease-out";
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
    };
  }, [displayMode]);

  const currentTrack = PLAYLIST[currentIdx];

  // Hidden during SSR or when user explicitly closed the player
  if (!isClient || displayMode === "closed" || displayMode === null) {
    return <audio ref={audioRef} preload="metadata" />;
  }

  const isMinimized = displayMode === "minimized";

  return (
    <>
      {/* Audio element stays continuously mounted so playback is uninterrupted across minimize/expand */}
      <audio ref={audioRef} preload="metadata" />

      {/* Floating Player Shell with smooth transition */}
      <div
        ref={containerRef}
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6 z-50 select-none touch-none transition-all duration-300 ease-out motion-reduce:transition-none ${
          isMinimized
            ? "w-10 h-10 rounded-full bg-[#140206]/95 backdrop-blur-md border border-flame-400/50 shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_12px_rgba(255,159,28,0.3)] hover:border-flame-400 flex items-center justify-center p-0"
            : "max-w-[92vw] w-auto rounded-full bg-[#140206]/95 backdrop-blur-md border border-flame-400/40 shadow-[0_6px_25px_rgba(0,0,0,0.7),0_0_14px_rgba(255,159,28,0.2)] hover:border-flame-400/70 py-1 pl-1.5 pr-2 flex items-center gap-1.5 sm:gap-2 cursor-grab active:cursor-grabbing"
        }`}
        role="region"
        aria-label="Festive Diwali Jukebox"
      >
        {isMinimized ? (
          /* Minimized State: Sleek Circular Floating Button (~40px) showing spinning disc */
          <button
            type="button"
            onClick={() => updateMode("expanded")}
            aria-label="Expand player"
            title="Expand Festive Music Player"
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-flame-400 outline-none cursor-pointer relative"
          >
            <span
              className={`inline-block transition-transform motion-reduce:animate-none ${
                isPlaying ? "animate-spin" : "opacity-85"
              }`}
              style={{
                animationDuration: "3.5s",
                animationTimingFunction: "linear",
              }}
              aria-hidden="true"
            >
              💿
            </span>
            {isPlaying && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-flame-400 rounded-full animate-ping pointer-events-none" />
            )}
          </button>
        ) : (
          /* Expanded State: Compact, Sleek Pill Player */
          <>
            {/* Skip Next & Play/Pause Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={nextTrack}
                title="Next Track"
                aria-label="Next track"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-night-900/90 hover:bg-flame-500/20 text-flame-400 hover:text-flame-300 border border-night-750 transition-all duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-flame-400 outline-none cursor-pointer"
              >
                <span className="text-xs">⏭️</span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-flame-400 hover:bg-flame-300 text-night-950 font-bold shadow-[0_0_10px_rgba(255,159,28,0.4)] transition-all duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-flame-400 outline-none cursor-pointer"
              >
                {isPlaying ? (
                  <span className="text-xs font-bold leading-none">⏸</span>
                ) : (
                  <span className="text-xs font-bold leading-none ml-0.5">▶</span>
                )}
              </button>
            </div>

            {/* Track Info: "NOW PLAYING" + Song Title */}
            <div className="flex flex-col min-w-0 px-1 max-w-[90px] xs:max-w-[120px] sm:max-w-[160px]">
              <span className="text-[8px] sm:text-[9px] tracking-wider font-bold uppercase text-flame-400 leading-tight">
                NOW PLAYING
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-ivory-50 truncate leading-tight">
                {currentTrack.title}
              </span>
            </div>

            {/* Spinning Disc Icon */}
            <div
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm motion-reduce:animate-none ${
                isPlaying ? "animate-spin" : "opacity-80"
              }`}
              style={{
                animationDuration: "3.5s",
                animationTimingFunction: "linear",
              }}
              aria-hidden="true"
            >
              💿
            </div>

            {/* Window Controls: Minimize ("–") & Close ("×") */}
            <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-night-800">
              <button
                type="button"
                onClick={handleMinimize}
                title="Minimize player"
                aria-label="Minimize player"
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-ivory-400 hover:text-flame-300 hover:bg-night-850/80 rounded transition-colors focus-visible:ring-2 focus-visible:ring-flame-400 outline-none cursor-pointer font-bold text-xs"
              >
                –
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Close player"
                aria-label="Close player"
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-ivory-400 hover:text-red-400 hover:bg-night-850/80 rounded transition-colors focus-visible:ring-2 focus-visible:ring-flame-400 outline-none cursor-pointer text-xs"
              >
                ×
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
