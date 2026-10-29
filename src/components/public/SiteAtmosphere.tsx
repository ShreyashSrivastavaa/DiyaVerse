"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SmokeOverlay = dynamic(
  () => import("./SmokeOverlay").then((mod) => mod.SmokeOverlay),
  { ssr: false }
);

const DiwaliJukebox = dynamic(
  () => import("./DiwaliJukebox").then((mod) => mod.DiwaliJukebox),
  { ssr: false }
);

export function SiteAtmosphere() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Dense cinematic smoke across the entire website */}
      <SmokeOverlay />
      {/* Festive floating jukebox audio player */}
      <DiwaliJukebox />
    </>
  );
}
