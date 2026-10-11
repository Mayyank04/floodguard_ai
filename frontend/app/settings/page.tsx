"use client";

import React, { useState } from "react";
import {
  Settings, Sliders, CheckCircle2, RefreshCw, Key,
  ShieldCheck, AlertTriangle, Save
} from "lucide-react";

export default function SettingsPage() {
  const [popWeight, setPopWeight] = useState(30);
  const [isoWeight, setIsoWeight] = useState(30);
  const [floodWeight, setFloodWeight] = useState(20);
  const [infraWeight, setInfraWeight] = useState(15);
  const [uncWeight, setUncWeight] = useState(5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const total = popWeight + isoWeight + floodWeight + infraWeight + uncWeight;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setPopWeight(30);
    setIsoWeight(30);
    setFloodWeight(20);
    setInfraWeight(15);
    setUncWeight(5);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <Settings className="w-4 h-4" />
            <span>Algorithm Calibration</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Multi-Criteria Weights & System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure prioritization factors, sensitivity thresholds, and backend API credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? "Saved!" : "Save Weights"}</span>
          </button>
        </div>
      </div>

      {/* Priority Engine Weights Configuration */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Settlement Priority Scoring Weights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Normalized multi-criteria composite formula. Total sum must equal 100%.
            </p>
          </div>
          <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
            total === 100 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            Sum: {total}%
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-200">1. Civilian Population Exposure</span>
              <span className="text-[#00D4FF] font-mono">{popWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={popWeight}
              onChange={(e) => setPopWeight(parseInt(e.target.value))}
              className="w-full accent-[#00D4FF] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Weight assigned to estimated civilian headcount trapped in settlement</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-200">2. Potential Network Isolation</span>
              <span className="text-amber-400 font-mono">{isoWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={isoWeight}
              onChange={(e) => setIsoWeight(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Weight assigned to severance of all mapped overland dry routes</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-200">3. Flood Inundation Proximity & Severity</span>
              <span className="text-blue-400 font-mono">{floodWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={floodWeight}
              onChange={(e) => setFloodWeight(parseInt(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Weight assigned to direct water ingress (&lt; 100m to flood edge)</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-200">4. Critical Infrastructure Vulnerability</span>
              <span className="text-purple-400 font-mono">{infraWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={infraWeight}
              onChange={(e) => setInfraWeight(parseInt(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Weight assigned to nearby flooded hospitals, schools, and relief shelters</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-200">5. Observation Uncertainty Factor</span>
              <span className="text-slate-400 font-mono">{uncWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={uncWeight}
              onChange={(e) => setUncWeight(parseInt(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Cautionary escalation for unmapped trails or partial sensor coverage</span>
          </div>
        </div>
      </div>

      {/* API Credentials & Integration Status */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-[#00D4FF]" />
          API & Cloud Services Integration
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Google Gemini API</div>
            <div className="text-slate-400 text-[11px]">Server-side tool calling and evidence reasoning engine</div>
            <div className="text-emerald-400 text-[10px] font-mono mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              CONFIGURED IN BACKEND
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-bold text-white">ESA Copernicus Data Space</div>
            <div className="text-slate-400 text-[11px]">Sentinel-1 SAR C-Band Level-1 GRD imagery catalog</div>
            <div className="text-emerald-400 text-[10px] font-mono mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              ACTIVE CATALOG CONNECTOR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
