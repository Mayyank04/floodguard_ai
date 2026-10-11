"use client";

import React from "react";
import {
  MapPin, Calendar, CheckCircle2, PlayCircle, Radio,
  ShieldAlert, Sparkles, Navigation, Layers, Satellite,
  BellRing, HelpCircle
} from "lucide-react";

interface TopNavProps {
  onLaunchDemo?: () => void;
}

export default function TopNav({ onLaunchDemo }: TopNavProps) {
  return (
    <header className="h-16 bg-[#07111F]/90 backdrop-blur-xl border-b border-slate-800/80 px-5 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Tactical Mission Header & Telemetry */}
      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto py-1 scrollbar-none">
        {/* Mission Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 font-bold text-xs shadow-sm shadow-red-500/10 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="tracking-wide font-mono text-[11px]">DISASTER CODE RED</span>
        </div>

        {/* Region & Coordinates */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
          <div>
            <span className="text-slate-400 font-medium">AOI:</span>{" "}
            <span className="text-slate-200 font-bold">Barpeta & Brahmaputra Basin</span>{" "}
            <span className="text-slate-500 font-mono text-[10px]">(26.32°N, 91.01°E)</span>
          </div>
        </div>

        {/* Observation Timestamp */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-slate-400 font-medium">Observation:</span>{" "}
            <span className="text-slate-200 font-bold">2022-06-20 (Peak Deluge)</span>
          </div>
        </div>

        {/* Sensor & Swath */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 px-2.5 py-1 rounded bg-slate-900/40 border border-slate-800/50">
          <Satellite className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Sensor: <strong className="text-slate-200 font-mono">Sentinel-1 C-SAR IW</strong> (VV+VH)</span>
        </div>
      </div>

      {/* Right: Interactive Demo Mode Trigger & Tactical Indicators */}
      <div className="flex items-center gap-3">
        {/* Launch Interactive Guided Walkthrough */}
        <button
          onClick={onLaunchDemo}
          className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] via-cyan-400 to-blue-600 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 fill-slate-950 text-white animate-pulse" />
          <span className="tracking-wide">Interactive Demo</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-950/20 text-[9px] font-mono uppercase">
            5-Step Tour
          </span>
        </button>

        <div className="h-6 w-px bg-slate-800" />

        {/* Verification Status */}
        <div className="hidden lg:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">COPERNICUS VERIFIED</span>
        </div>
      </div>
    </header>
  );
}
