"use client";

import React, { useEffect, useState } from "react";
import {
  Navigation, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, MapPin, ArrowRight, RefreshCw, Compass
} from "lucide-react";
import { fetchSettlements, fetchIsolationAnalysis, analyzeRoute } from "@/lib/api";
import FloodMap from "@/components/FloodMap";
import Link from "next/link";

export default function RescuePlanningPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [selectedSettlementId, setSelectedSettlementId] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<string>("dijkstra");

  const [routeResult, setRouteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [stl, iso] = await Promise.all([
          fetchSettlements("6d5354bb-015e-4fb3-b050-d78fb1302910"),
          fetchIsolationAnalysis("6d5354bb-015e-4fb3-b050-d78fb1302910")
        ]);
        setSettlements(stl);
        setBases(iso.rescue_bases || []);
        if (iso.rescue_bases?.length > 0) {
          setSelectedBaseId(iso.rescue_bases[0].id);
        }
        if (stl.length > 0) {
          setSelectedSettlementId(stl[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleComputeRoute = async () => {
    if (!selectedBaseId || !selectedSettlementId) return;
    setIsCalculating(true);
    try {
      const res = await analyzeRoute({
        event_id: "6d5354bb-015e-4fb3-b050-d78fb1302910",
        base_id: selectedBaseId,
        settlement_id: selectedSettlementId,
        algorithm: algorithm
      });
      setRouteResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <Navigation className="w-4 h-4" />
            <span>Tactical Evacuation & Access Logistics</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Rescue Route Assessment & Path Planning</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dijkstra & A* shortest-path algorithms evaluating road corridors against satellite flood intersections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/command"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            Command Dashboard
          </Link>
        </div>
      </div>

      {/* Main Grid: Selector Controls on Left, Route Result & Visualizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Route Parameters
            </h3>

            {/* Select Rescue Staging Base */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Origin Rescue Base:</label>
              <select
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00D4FF]"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.personnel_count} personnel, {b.boats_count} boats)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Destination Settlement */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Destination Settlement:</label>
              <select
                value={selectedSettlementId}
                onChange={(e) => setSelectedSettlementId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00D4FF]"
              >
                {settlements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Pop: {Number(s.estimated_population).toLocaleString()} | {s.connectivity_status?.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Routing Algorithm */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Optimization Algorithm:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlgorithm("dijkstra")}
                  className={`p-2.5 rounded-lg border text-center transition ${
                    algorithm === "dijkstra" ? "bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF] font-bold" : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  Dijkstra Search
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithm("a_star")}
                  className={`p-2.5 rounded-lg border text-center transition ${
                    algorithm === "a_star" ? "bg-[#00D4FF]/20 border-[#00D4FF] text-[#00D4FF] font-bold" : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  A* Heuristic Search
                </button>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleComputeRoute}
              disabled={isCalculating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>Compute Candidate Route</span>
            </button>
          </div>

          {/* Critical Operational Safety Box */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-amber-500 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>SAFETY REQUIREMENT</span>
            </div>
            <p className="leading-relaxed">
              Never label a route as guaranteed safe. Satellite imagery indicates surface water extent at the moment of capture, but cannot certify that road foundations, culverts, or bridges remain structurally sound.
            </p>
          </div>
        </div>

        {/* Route Assessment Results Column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {routeResult ? (
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    routeResult.route_classification === "unexposed_candidate_route"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : routeResult.route_classification === "flood_exposed_candidate_route"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {routeResult.route_classification.replace(/_/g, " ")}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    Route: {routeResult.base_name} → {routeResult.settlement_name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono">Algorithm: {routeResult.algorithm_used}</span>
                </div>
              </div>

              {/* Stats Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Transit Distance</div>
                  <div className="text-2xl font-black text-[#00D4FF] mt-1">{routeResult.distance_km} km</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Transit Time</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{routeResult.estimated_time_minutes} min</div>
                  <div className="text-[10px] text-slate-500">Convoy pace</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Verification Status</div>
                  <div className="text-xs font-bold text-slate-200 mt-2">Preliminary Aid (Unverified)</div>
                </div>
              </div>

              {/* Exposure Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <strong>Flood Exposure Assessment:</strong> {routeResult.flood_exposure_summary}
              </div>

              {/* Bold Disclaimer Box */}
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 text-[11px] text-red-200 leading-relaxed">
                {routeResult.safety_disclaimer}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
              <Compass className="w-12 h-12 text-slate-600 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">No Route Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an origin rescue base and target destination community on the left to compute candidate routing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
