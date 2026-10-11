"use client";

import React from "react";
import {
  MapPin, Calendar, PlayCircle, Satellite, CheckCircle2,
  ChevronRight, Info
} from "lucide-react";

interface TopNavProps {
  onLaunchDemo?: () => void;
}

export default function TopNav({ onLaunchDemo }: TopNavProps) {
  return (
    <header className="h-14 bg-[#111827] border-b border-[#334155] px-5 flex items-center justify-between z-20 sticky top-0 text-xs">
      {/* Left: Region & Satellite Context */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none text-[#94A3B8]">
        {/* Event Selector Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155] text-[#F8FAFC]">
          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-white">Barpeta & Brahmaputra Corridor</span>
          <span className="text-[#64748B] font-mono text-[10px]">(26.32°N, 91.01°E)</span>
        </div>

        {/* Observation Date */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155]">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Observed: <strong className="text-white font-medium">June 20, 2022</strong> (Peak Flood)</span>
        </div>

        {/* Sensor Source */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172033] border border-[#334155]">
          <Satellite className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Sensor: <strong className="text-white font-medium">Sentinel-1 SAR C-Band</strong></span>
        </div>
      </div>

      {/* Right: Actions & Demo Tour */}
      <div className="flex items-center gap-3">
        {/* Launch Historical Flood Demo CTA */}
        <button
          onClick={onLaunchDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Historical Flood Demo</span>
        </button>

        <div className="h-4 w-px bg-[#334155]" />

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#10B981] px-2 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Precomputed Analysis Verified</span>
        </div>
      </div>
    </header>
  );
}
