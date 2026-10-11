"use client";

import React, { useState, useEffect } from "react";
import {
  Settings, Sliders, CheckCircle2, RefreshCw,
  ShieldCheck, AlertTriangle, Save, RotateCcw,
  Eye, Info, Flame
} from "lucide-react";
import { fetchPriorities, getPrimaryEventId } from "@/lib/api";

export default function SettingsPage() {
  const [popWeight, setPopWeight] = useState(30);
  const [isoWeight, setIsoWeight] = useState(30);
  const [floodWeight, setFloodWeight] = useState(20);
  const [infraWeight, setInfraWeight] = useState(15);
  const [uncWeight, setUncWeight] = useState(5);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewRankings, setPreviewRankings] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const total = popWeight + isoWeight + floodWeight + infraWeight + uncWeight;
  const isValid = total === 100;

  // Load preview data
  const handlePreview = async () => {
    try {
      const eventId = await getPrimaryEventId();
      const res = await fetchPriorities(eventId, {
        pop: popWeight / 100,
        iso: isoWeight / 100,
        flood: floodWeight / 100,
        infra: infraWeight / 100,
        unc: uncWeight / 100
      });
      setPreviewRankings(res.priorities || []);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      const eventId = await getPrimaryEventId();
      const res = await fetchPriorities(eventId, {
        pop: popWeight / 100,
        iso: isoWeight / 100,
        flood: floodWeight / 100,
        infra: infraWeight / 100,
        unc: uncWeight / 100
      });
      setPreviewRankings(res.priorities || []);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving weights to API:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setPopWeight(30);
    setIsoWeight(30);
    setFloodWeight(20);
    setInfraWeight(15);
    setUncWeight(5);
    setShowPreview(false);
  };

  const applyPreset = (preset: "balanced" | "lifeSafety" | "infra") => {
    if (preset === "balanced") {
      setPopWeight(30); setIsoWeight(30); setFloodWeight(20); setInfraWeight(15); setUncWeight(5);
    } else if (preset === "lifeSafety") {
      setPopWeight(40); setIsoWeight(35); setFloodWeight(15); setInfraWeight(5); setUncWeight(5);
    } else if (preset === "infra") {
      setPopWeight(20); setIsoWeight(20); setFloodWeight(20); setInfraWeight(35); setUncWeight(5);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
            <Settings className="w-4 h-4" />
            <span>Multi-Criteria Decision Analysis (MCDA)</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Priority Weight Calibration</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Customize weighting parameters to recompute rescue urgency scores across cut-off communities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Weights</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-lg text-xs text-[#10B981] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>New weights successfully persisted to backend. Priority rankings recalculated.</span>
        </div>
      )}

      {/* Preset Profiles */}
      <div className="surface-card p-4 space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">Preset Operational Profiles</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => applyPreset("balanced")}
            className="p-2.5 rounded-lg border border-[#334155] bg-[#0B1220] hover:bg-[#1E293B] text-left transition cursor-pointer"
          >
            <div className="font-semibold text-white">Default Balanced</div>
            <div className="text-[10px] text-slate-400 mt-0.5">30% Pop, 30% Iso, 20% Flood, 15% Infra, 5% Unc</div>
          </button>
          <button
            onClick={() => applyPreset("lifeSafety")}
            className="p-2.5 rounded-lg border border-[#334155] bg-[#0B1220] hover:bg-[#1E293B] text-left transition cursor-pointer"
          >
            <div className="font-semibold text-white">Life Safety First</div>
            <div className="text-[10px] text-slate-400 mt-0.5">40% Pop, 35% Iso, 15% Flood, 5% Infra, 5% Unc</div>
          </button>
          <button
            onClick={() => applyPreset("infra")}
            className="p-2.5 rounded-lg border border-[#334155] bg-[#0B1220] hover:bg-[#1E293B] text-left transition cursor-pointer"
          >
            <div className="font-semibold text-white">Infrastructure Focused</div>
            <div className="text-[10px] text-slate-400 mt-0.5">20% Pop, 20% Iso, 20% Flood, 35% Infra, 5% Unc</div>
          </button>
        </div>
      </div>

      {/* Interactive Weight Sliders */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Factor Weight Distribution
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Total Sum:</span>
            <span className={`font-mono font-bold text-sm ${isValid ? "text-[#10B981]" : "text-red-400"}`}>
              {total}%
            </span>
            {!isValid && (
              <span className="text-[11px] text-red-400 font-medium">
                (Must equal exactly 100%)
              </span>
            )}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Population */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="font-medium text-white">1. Civilian Population Exposure</span>
              <span className="font-mono text-[#2563EB] font-bold">{popWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={popWeight}
              onChange={(e) => setPopWeight(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Normalized based on estimated civilian count in affected settlements.
            </p>
          </div>

          {/* Isolation */}
          <div className="space-y-1.5 pt-2 border-t border-[#334155]/60">
            <div className="flex justify-between">
              <span className="font-medium text-white">2. Community Isolation Factor</span>
              <span className="font-mono text-[#2563EB] font-bold">{isoWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={isoWeight}
              onChange={(e) => setIsoWeight(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Evaluates complete road severance to emergency staging bases via NetworkX graph analysis.
            </p>
          </div>

          {/* Flood Severity */}
          <div className="space-y-1.5 pt-2 border-t border-[#334155]/60">
            <div className="flex justify-between">
              <span className="font-medium text-white">3. Flood Proximity & Perimeter Inundation</span>
              <span className="font-mono text-[#2563EB] font-bold">{floodWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={floodWeight}
              onChange={(e) => setFloodWeight(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Direct intersection distance from Sentinel-1 SAR water boundary.
            </p>
          </div>

          {/* Infrastructure */}
          <div className="space-y-1.5 pt-2 border-t border-[#334155]/60">
            <div className="flex justify-between">
              <span className="font-medium text-white">4. Critical Healthcare & Lifeline Proximity</span>
              <span className="font-mono text-[#2563EB] font-bold">{infraWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={infraWeight}
              onChange={(e) => setInfraWeight(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Considers compromise of nearby hospitals, primary health centers, and emergency shelters.
            </p>
          </div>

          {/* Uncertainty */}
          <div className="space-y-1.5 pt-2 border-t border-[#334155]/60">
            <div className="flex justify-between">
              <span className="font-medium text-white">5. Sensor & Observation Uncertainty</span>
              <span className="font-mono text-[#2563EB] font-bold">{uncWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={uncWeight}
              onChange={(e) => setUncWeight(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Penalizes stale observation passes and radar speckle uncertainty.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#334155] flex items-center justify-between">
          <button
            onClick={handlePreview}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Ranking Impact</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save & Apply Weights</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      {showPreview && previewRankings.length > 0 && (
        <div className="surface-card p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Simulated Urgency Rankings Under New Calibration</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="py-2 px-3">New Rank</th>
                  <th className="py-2 px-3">Settlement Name</th>
                  <th className="py-2 px-3">Estimated Population</th>
                  <th className="py-2 px-3">Connectivity Status</th>
                  <th className="py-2 px-3 text-right">Recalculated Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                {previewRankings.slice(0, 5).map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#1E293B]/50">
                    <td className="py-2 px-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-white">{r.settlement_name || r.name}</td>
                    <td className="py-2 px-3">{Number(r.population || r.estimated_population || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.connectivity_status === "critical_isolated" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {r.connectivity_status?.replace(/_/g, " ") || "Evaluated"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      {r.score ? r.score.toFixed(1) : "N/A"}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-[#0B1220] border border-[#334155] text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Decision Support Notice:</strong> Multi-criteria priority rankings are computational planning aids designed to support dispatch logistics under resource constraints. Scores do not constitute an empirical certification of individual life-safety hazard.
        </p>
      </div>
    </div>
  );
}
