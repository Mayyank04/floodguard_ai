"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { FloodGuardMapProps } from "./maps/FloodGuardMap";

const FloodGuardMap = dynamic(() => import("./maps/FloodGuardMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-[#07111F] text-slate-400 p-6 rounded-xl border border-slate-800">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs font-mono text-cyan-400 font-medium">Initializing MapLibre GL Engine...</span>
      <span className="text-[11px] text-slate-500 mt-1">Loading CARTO Voyager &amp; Sentinel-1 Inundation Vectors</span>
    </div>
  )
});

export default function FloodMap(props: FloodGuardMapProps) {
  return <FloodGuardMap {...props} />;
}
