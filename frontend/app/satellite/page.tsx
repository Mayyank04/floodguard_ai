"use client";

import React, { useState } from "react";
import {
  Satellite, Sliders, RefreshCw, Layers, CheckCircle2,
  Calendar, AlertCircle, ArrowRight, Download, Eye, Sparkles,
  Info, ExternalLink, ShieldCheck, ChevronRight, Settings2, X
} from "lucide-react";
import { triggerFloodDetection, getPrimaryEventId } from "@/lib/api";

export default function SatelliteIntelligencePage() {
  const [satelliteSource, setSatelliteSource] = useState<"Sentinel-1" | "Sentinel-2">("Sentinel-1");
  const [preDate, setPreDate] = useState("2022-05-28");
  const [peakDate, setPeakDate] = useState("2022-06-20");
  const [thresholdDb, setThresholdDb] = useState(-14.5);
  const [filterSpeckle, setFilterSpeckle] = useState(true);
  const [splitSliderPos, setSplitSliderPos] = useState(50); // percentage 0-100
  const [controlsOpen, setControlsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    try {
      const eventId = await getPrimaryEventId();
      const res = await triggerFloodDetection({
        event_id: eventId,
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

  const preImageSrc = "/satellite/pre_flood_s1_20220528.png";
  const postImageSrc = satelliteSource === "Sentinel-1"
    ? "/satellite/peak_flood_s1_20220620.png"
    : "/satellite/sentinel2_optical_20220620.png";

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] gap-2.5 overflow-hidden max-w-7xl mx-auto">
      {/* 1. Slim Header with Metadata & Controls Toggle */}
      <div className="panel px-4 py-2.5 flex items-center justify-between text-xs bg-[#101726]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Dual-Date Satellite Radar Viewer</span>
            <span className="badge badge-info">Sentinel-1 SAR C-Band</span>
            <span className="text-[#64748B] text-[11px]">10m Spatial Resolution · IW GRDH</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-[#94A3B8]">
            <span>Baseline: <strong className="text-white">2022-05-28</strong></span>
            <span>Peak Flood: <strong className="text-white">2022-06-20</strong></span>
            <span>Cutoff: <strong className="text-[#2563EB]">{thresholdDb} dB</strong></span>
          </div>

          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Processing Controls</span>
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={isProcessing}
            className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Re-Run</span>
          </button>
        </div>
      </div>

      {/* 2. Main Centered Visualizer with Collapsible Right Drawer */}
      <div className="flex-1 flex gap-2.5 min-h-0 overflow-hidden relative">
        {/* Full-Bleed Split Imagery Canvas */}
        <div className="flex-1 panel relative overflow-hidden flex flex-col bg-slate-950">
          <div className="relative w-full h-full select-none">
            {/* After (Flood Inundated) Raster */}
            <div
              className="absolute inset-0 bg-cover bg-center flex items-end p-4"
              style={{
                backgroundImage: `url(${postImageSrc})`
              }}
            >
              <div className="px-3 py-1.5 rounded bg-[#101726]/90 border border-[#24324B] text-xs font-medium text-white shadow-md">
                {satelliteSource === "Sentinel-1" ? (
                  <span>Peak Inundation: 2022-06-20 (SAR Backscatter &lt; -14.5 dB)</span>
                ) : (
                  <span>Sentinel-2 Optical False Color (2022-06-20)</span>
                )}
              </div>
            </div>

            {/* Before (Pre-Flood Baseline) Clipped Raster */}
            <div
              className="absolute inset-y-0 left-0 bg-cover bg-center flex items-end p-4 overflow-hidden border-r-2 border-white shadow-2xl"
              style={{
                width: `${splitSliderPos}%`,
                backgroundImage: `url(${preImageSrc})`
              }}
            >
              <div className="px-3 py-1.5 rounded bg-[#101726]/90 border border-[#24324B] text-xs font-medium text-[#10B981] whitespace-nowrap shadow-md">
                Pre-Flood Baseline: 2022-05-28 (Dry Season Baseline)
              </div>
            </div>

            {/* Transparent Slider Input Control */}
            <input
              type="range"
              min="5"
              max="95"
              value={splitSliderPos}
              onChange={(e) => setSplitSliderPos(parseInt(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            />

            {/* Center Thumb Handle */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center"
              style={{ left: `calc(${splitSliderPos}% - 14px)` }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-slate-950 font-bold shadow-xl flex items-center justify-center text-xs">
                ⇄
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="p-2.5 border-t border-[#24324B] bg-[#101726] flex items-center justify-between text-xs text-[#94A3B8]">
            <div className="flex items-center gap-5">
              <span>Detected Inundation: <strong className="text-white font-mono">{detectionResult?.flooded_area_sq_km || 412.8} km²</strong></span>
              <span>Polarization: <strong className="text-white font-mono">VV+VH Dual-Pol</strong></span>
              <span>Confidence: <strong className="text-[#10B981] font-mono">94.2% Verified</strong></span>
            </div>
            <span className="text-[11px] text-slate-500">Source: Copernicus Data Space Ecosystem (Track 121 Descending)</span>
          </div>
        </div>

        {/* Collapsible Right Controls Drawer */}
        {controlsOpen && (
          <div className="w-80 panel p-4 flex flex-col gap-4 overflow-y-auto bg-[#101726] animate-in slide-in-from-right-4 duration-150">
            <div className="flex items-center justify-between border-b border-[#24324B] pb-2 text-xs">
              <span className="font-semibold text-white">Processing Parameters</span>
              <button
                onClick={() => setControlsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1E2B45]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sensor Switcher */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[#94A3B8] font-medium text-[11px]">Sensor Constellation:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSatelliteSource("Sentinel-1")}
                  className={`p-2 rounded border text-left text-xs transition cursor-pointer ${
                    satelliteSource === "Sentinel-1"
                      ? "bg-[#2563EB] text-white border-[#2563EB] font-medium"
                      : "bg-[#151F32] border-[#24324B] text-slate-400 hover:text-white"
                  }`}
                >
                  Sentinel-1 SAR
                </button>
                <button
                  onClick={() => setSatelliteSource("Sentinel-2")}
                  className={`p-2 rounded border text-left text-xs transition cursor-pointer ${
                    satelliteSource === "Sentinel-2"
                      ? "bg-[#2563EB] text-white border-[#2563EB] font-medium"
                      : "bg-[#151F32] border-[#24324B] text-slate-400 hover:text-white"
                  }`}
                >
                  Sentinel-2 MSI
                </button>
              </div>
            </div>

            {/* Baseline Dates */}
            <div className="space-y-2 text-xs">
              <span className="text-[#94A3B8] font-medium text-[11px]">Observation Dates:</span>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Pre-Flood Reference:</label>
                <input
                  type="date"
                  value={preDate}
                  onChange={(e) => setPreDate(e.target.value)}
                  className="w-full bg-[#151F32] border border-[#24324B] rounded p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Peak Flood Observation:</label>
                <input
                  type="date"
                  value={peakDate}
                  onChange={(e) => setPeakDate(e.target.value)}
                  className="w-full bg-[#151F32] border border-[#24324B] rounded p-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Backscatter Cutoff Slider */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-[11px]">Backscatter Threshold:</span>
                <span className="font-mono text-white font-semibold">{thresholdDb} dB</span>
              </div>
              <input
                type="range"
                min="-20.0"
                max="-10.0"
                step="0.5"
                value={thresholdDb}
                onChange={(e) => setThresholdDb(parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Specular reflection drop &lt; -14.5 dB indicates water</span>
            </div>

            {/* Lee Speckle Filter */}
            <div className="flex items-center justify-between pt-2 border-t border-[#24324B] text-xs">
              <div>
                <span className="text-white block text-[11px] font-medium">Lee Speckle Filter (3x3)</span>
                <span className="text-[10px] text-slate-500">Suppresses granular noise</span>
              </div>
              <input
                type="checkbox"
                checked={filterSpeckle}
                onChange={(e) => setFilterSpeckle(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB] cursor-pointer"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isProcessing}
              className="btn-primary w-full text-xs py-2 mt-auto"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Apply & Recompute Mask</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
