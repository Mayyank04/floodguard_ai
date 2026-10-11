"use client";

import React from "react";
import {
  MapPin, Calendar, CheckCircle2, PlayCircle, Bell, User, Sparkles
} from "lucide-react";

interface TopNavProps {
  onLaunchDemo?: () => void;
}

export default function TopNav({ onLaunchDemo }: TopNavProps) {
  return (
    <header className="h-16 bg-[#0B1728]/95 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Region & Observation Details */}
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
          <div>
            <span className="text-slate-400 font-medium">Region:</span>{" "}
            <span className="text-slate-200 font-bold">Barpeta & Brahmaputra Basin</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-slate-400 font-medium">Observed:</span>{" "}
            <span className="text-slate-200 font-bold">2022-06-20 (Peak Deluge)</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
          <span>Sensor: <strong>Sentinel-1 SAR (C-Band)</strong></span>
        </div>
      </div>

      {/* Right: Actions, Demo Button, Profile */}
      <div className="flex items-center gap-3">
        {/* Presentation Demo Mode CTA */}
        <button
          onClick={onLaunchDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 fill-slate-950 text-white" />
          <span>Launch Demo Mode</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-semibold">Analysis Verified</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
