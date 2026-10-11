"use client";

import React from "react";
import {
  History, Calendar, MapPin, Satellite, ArrowRight,
  ShieldCheck, AlertTriangle, CloudRain, Droplets, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function HistoricalEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            <History className="w-4 h-4" />
            <span>Benchmark Historical Scenarios</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Historical Flood Inundation Archive</h1>
          <p className="text-xs text-slate-400 mt-1">
            Certified historical events with verified Copernicus Sentinel-1 SAR and OpenStreetMap telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
            HISTORICAL EVENT ANALYSIS
          </span>
        </div>
      </div>

      {/* Featured Assam 2022 Disaster Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
              PRIMARY HACKATHON BENCHMARK EVENT
            </div>

            <h2 className="text-2xl font-black text-white">
              Assam Brahmaputra Basin Catastrophic Flood (June 2022)
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              In June 2022, unseasonal pre-monsoon cloudbursts triggered severe flooding across 32 districts in Assam, affecting 5.4 million civilians. 
              The Brahmaputra and its tributaries submerged massive expanses of the Barpeta-Mandia riverine corridor, washing out highway culverts and isolating char communities for weeks.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Region</div>
                <div className="font-bold text-white mt-0.5">Barpeta, Assam</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Peak Date</div>
                <div className="font-bold text-cyan-400 mt-0.5">2022-06-20</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Inundation</div>
                <div className="font-bold text-white mt-0.5">412.8 km²</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Isolated</div>
                <div className="font-bold text-amber-400 mt-0.5">61,100 Civilians</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link
              href="/command"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer text-center"
            >
              <span>Load in Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/reports"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition text-center"
            >
              <span>Generate Audit Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Meteorological & Hydrological Context */}
      <div className="grid md:grid-cols-3 gap-6 text-xs">
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <CloudRain className="w-4 h-4" />
            <span>Monsoonal Rainfall Anomaly</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Rainfall in Cherrapunji and upper catchment basins reached <strong>972.0 mm in 24 hours</strong> on June 17, 2022—the highest June downpour since 1995.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Droplets className="w-4 h-4" />
            <span>River Stage Above Danger Level</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Central Water Commission (CWC) gauge at Beki River recorded water levels <strong>1.86 meters above danger mark</strong>, overtopping embankment walls.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Satellite className="w-4 h-4" />
            <span>Copernicus Constellation Capture</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            ESA Sentinel-1 SAR orbit pass Track 121 captured the critical inundated landscape on June 20 at 23:42 UTC, completely unhindered by cloud cover.
          </p>
        </div>
      </div>
    </div>
  );
}
