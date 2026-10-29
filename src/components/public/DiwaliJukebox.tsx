"use client";

import React, { useState, useEffect, useRef } from "react";

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
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize random track on mount
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * PLAYLIST.length);
    setCurrentIdx(randomStart);
  }, []);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Update audio source when track changes
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

  // Audio event listeners (auto-play next on random loop)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Pick next track (random loop)
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

  // Draggable support (just like chai-baar)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Do not initiate drag if clicking buttons
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

      // Bound within viewport margins
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
      container.style.transition = "transform 0.2s ease, opacity 0.2s ease";
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const currentTrack = PLAYLIST[currentIdx];

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      {/* Floating Draggable Jukebox Pill Widget */}
      <div
        ref={containerRef}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none touch-none cursor-grab active:cursor-grabbing flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-[#140206]/90 backdrop-blur-md border border-flame-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_18px_rgba(255,159,28,0.2)] hover:border-flame-400/70 transition-colors duration-300"
        style={{
          maxWidth: "calc(100vw - 32px)",
        }}
        role="region"
        aria-label="Festive Diwali Jukebox"
      >
        {/* Controls: Skip & Play/Pause */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={nextTrack}
            title="Next Track (Random Loop)"
            aria-label="Next track"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-night-900/90 hover:bg-flame-500/20 text-flame-400 hover:text-flame-300 border border-night-750 transition-all duration-150 active:scale-90"
          >
            <span className="text-xs sm:text-sm">⏭️</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Pause Festive Music" : "Play Festive Music"}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-flame-400 hover:bg-flame-300 text-night-950 font-bold shadow-[0_0_12px_rgba(255,159,28,0.5)] transition-all duration-150 active:scale-90"
          >
            {isPlaying ? (
              <span className="text-xs font-bold leading-none">⏸</span>
            ) : (
              <span className="text-xs font-bold leading-none ml-0.5">▶</span>
            )}
          </button>
        </div>

        {/* Track Metadata */}
        <div className="flex flex-col min-w-0 pr-1 max-w-[140px] sm:max-w-[190px]">
          <span className="text-[9px] sm:text-[10px] tracking-widest font-bold uppercase text-flame-400 leading-tight">
            NOW PLAYING
          </span>
          <span className="text-xs sm:text-[13px] font-semibold text-ivory-50 truncate leading-snug">
            {currentTrack.title}
          </span>
        </div>

        {/* Spinning Vinyl CD Icon */}
        <div
          className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-lg sm:text-xl transition-transform ${
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
      </div>
    </>
  );
}
