"use client";

import React, { useState } from "react";
import {
  Satellite, Sliders, RefreshCw, Layers, CheckCircle2,
  Calendar, AlertCircle, ArrowRight, Download, Eye, Sparkles
} from "lucide-react";
import { triggerFloodDetection } from "@/lib/api";

export default function SatelliteIntelligencePage() {
  const [satelliteSource, setSatelliteSource] = useState<"Sentinel-1" | "Sentinel-2">("Sentinel-1");
  const [preDate, setPreDate] = useState("2022-05-28");
  const [peakDate, setPeakDate] = useState("2022-06-20");
  const [thresholdDb, setThresholdDb] = useState(-14.5);
  const [filterSpeckle, setFilterSpeckle] = useState(true);
  const [splitSliderPos, setSplitSliderPos] = useState(50); // percentage 0-100
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    try {
      const res = await triggerFloodDetection({
        event_id: "6d5354bb-015e-4fb3-b050-d78fb1302910",
        satellite_source: satelliteSource,
        sensitivity_threshold_db: thresholdDb,
        filter_speckle: filterSpeckle
      });
      setDetectionResult(res);
    } catch (err) {
      console.error("Error triggering satellite analysis:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <Satellite className="w-4 h-4" />
            <span>Earth Observation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Satellite Intelligence & Change Detection</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare dual-date synthetic aperture radar (SAR) backscatter and optical multispectral water indices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Re-Run SAR Detection</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Before/After Visualizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="flex flex-col gap-5">
          {/* Sensor Selector */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">1. Satellite Constellation</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSatelliteSource("Sentinel-1")}
                className={`p-3 rounded-xl border text-left transition ${
                  satelliteSource === "Sentinel-1"
                    ? "bg-[#00D4FF]/15 border-[#00D4FF] text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold">Sentinel-1 C-SAR</div>
                <div className="text-[10px] text-slate-400 mt-1">Microwave Radar (Cloud Penetrating)</div>
                <div className="text-[9px] text-[#00D4FF] font-mono mt-2">RECOMMENDED</div>
              </button>

              <button
                onClick={() => setSatelliteSource("Sentinel-2")}
                className={`p-3 rounded-xl border text-left transition ${
                  satelliteSource === "Sentinel-2"
                    ? "bg-[#00D4FF]/15 border-[#00D4FF] text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold">Sentinel-2 MSI</div>
                <div className="text-[10px] text-slate-400 mt-1">Optical NDWI / MNDWI</div>
                <div className="text-[9px] text-amber-400 font-mono mt-2">CLOUDS EXP.</div>
              </button>
            </div>
          </div>

          {/* Acquisition Dates */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">2. Dual Observation Baseline</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Pre-Flood Reference Date</label>
                <input
                  type="date"
                  value={preDate}
                  onChange={(e) => setPreDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Peak Deluge Observation Date</label>
                <input
                  type="date"
                  value={peakDate}
                  onChange={(e) => setPeakDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>
          </div>

          {/* SAR Processing Parameters */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">3. SAR Detection Thresholds</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Backscatter Cutoff (Sigma0):</span>
                  <span className="text-[#00D4FF] font-mono font-bold">{thresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-20.0"
                  max="-10.0"
                  step="0.5"
                  value={thresholdDb}
                  onChange={(e) => setThresholdDb(parseFloat(e.target.value))}
                  className="w-full accent-[#00D4FF] cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-1">Calm water causes specular scattering &lt; -14.0 dB</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Lee Sigma Speckle Filter</div>
                  <div className="text-[10px] text-slate-400">Reduces granular radar speckle noise</div>
                </div>
                <input
                  type="checkbox"
                  checked={filterSpeckle}
                  onChange={(e) => setFilterSpeckle(e.target.checked)}
                  className="w-4 h-4 accent-[#00D4FF] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Before/After Split Viewer Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Interactive Before / After Observation Split
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Slide to compare change detection</span>
            </div>

            {/* Split Screen Slider Simulation */}
            <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 select-none bg-slate-950">
              {/* After (Flood Inundated) Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center flex items-end p-6"
                style={{
                  backgroundImage: `radial-gradient(circle at 60% 60%, rgba(0, 212, 255, 0.45) 0%, rgba(2, 132, 199, 0.3) 40%, rgba(11, 23, 40, 0.95) 80%), repeating-linear-gradient(45deg, #07111F 0px, #07111F 20px, #0B1728 20px, #0B1728 40px)`
                }}
              >
                <div className="glass-panel px-3 py-1.5 rounded-lg text-xs font-bold text-[#00D4FF] border border-[#00D4FF]/40">
                  PEAK INUNDATION: 2022-06-20 (SAR Backscatter Drop &lt; -14.5 dB)
                </div>
              </div>

              {/* Before (Pre-Flood) Clipped Image */}
              <div
                className="absolute inset-y-0 left-0 bg-cover bg-center flex items-end p-6 overflow-hidden border-r-2 border-white shadow-2xl"
                style={{
                  width: `${splitSliderPos}%`,
                  backgroundImage: `radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.25) 0%, rgba(15, 23, 42, 0.9) 70%), repeating-linear-gradient(-45deg, #07111F 0px, #07111F 20px, #0B1728 20px, #0B1728 40px)`
                }}
              >
                <div className="glass-panel px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/40 whitespace-nowrap">
                  PRE-FLOOD BASELINE: 2022-05-28 (Dry Season Baseline)
                </div>
              </div>

              {/* Slider Control Line */}
              <input
                type="range"
                min="5"
                max="95"
                value={splitSliderPos}
                onChange={(e) => setSplitSliderPos(parseInt(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
              />

              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center"
                style={{ left: `calc(${splitSliderPos}% - 14px)` }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-slate-950 font-bold shadow-xl flex items-center justify-center text-[10px]">
                  ⇄
                </div>
              </div>
            </div>

            {/* Inundation Detection Result Banner */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Detected Inundation</div>
                <div className="text-xl font-black text-[#00D4FF] mt-0.5">
                  {detectionResult?.flooded_area_sq_km || 412.8} km²
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sensor Mode</div>
                <div className="text-sm font-bold text-slate-200 mt-1">IW GRDH (10m)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Confidence Rating</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">94% High</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
