"use client";

import React from "react";
import {
  MapPin, Calendar, PlayCircle, Satellite, CheckCircle2,
  Search, Activity, Database
} from "lucide-react";

interface TopNavProps {
  onLaunchDemo?: () => void;
  onOpenPalette?: () => void;
}

export default function TopNav({ onLaunchDemo, onOpenPalette }: TopNavProps) {
  return (
    <header className="h-14 bg-[#111827] border-b border-[#334155] px-4 sm:px-5 flex items-center justify-between z-20 sticky top-0 text-xs select-none">
      {/* Left: Region & Satellite Context */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none text-[#94A3B8]">
        {/* Event Selector Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155] text-[#F8FAFC] shrink-0">
          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-white">Barpeta & Lower Assam</span>
          <span className="text-[#64748B] font-mono text-[10px] hidden sm:inline">(26.32°N, 91.01°E)</span>
        </div>

        {/* Observation Date */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155] shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Observed: <strong className="text-white font-medium">June 20, 2022</strong> (Peak Deluge)</span>
        </div>

        {/* Sensor Source */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155] shrink-0">
          <Satellite className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Sensor: <strong className="text-white font-medium">Sentinel-1 C-SAR</strong> (10m VV/VH)</span>
        </div>
      </div>

      {/* Right: Controls, Search, and Demo Tour */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-slate-300 hover:text-white transition cursor-pointer text-xs"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-[11px]">Command Palette</span>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-[#0F172A] rounded border border-[#334155]">
            ⌘K
          </kbd>
        </button>

        {/* Launch Historical Flood Demo CTA */}
        <button
          onClick={onLaunchDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Launch Demo</span>
        </button>

        <div className="h-4 w-px bg-[#334155] hidden sm:block" />

        {/* Analysis Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#10B981] px-2 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Operational Synchronized</span>
        </div>
      </div>
    </header>
  );
}
