"use client";

import React, { useEffect, useState } from "react";
import {
  Navigation, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, MapPin, ArrowRight, RefreshCw, Compass,
  Layers, ChevronRight, ShieldCheck, Info
} from "lucide-react";
import { fetchSettlements, fetchIsolationAnalysis, analyzeRoute, fetchMapLayers, getPrimaryEventId } from "@/lib/api";
import FloodGuardMap from "@/components/maps/FloodGuardMap";
import Link from "next/link";

export default function RescuePlanningPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [selectedSettlementId, setSelectedSettlementId] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<string>("dijkstra");
  const [avoidanceMode, setAvoidanceMode] = useState<"strict_dry" | "allow_shallow">("allow_shallow");

  const [layersData, setLayersData] = useState<any>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const eventId = await getPrimaryEventId();
        const [stl, iso, mapLayers] = await Promise.all([
          fetchSettlements(eventId),
          fetchIsolationAnalysis(eventId),
          fetchMapLayers(eventId)
        ]);
        setSettlements(stl);
        setBases(iso.rescue_bases || []);
        setLayersData(mapLayers.layers);
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
    setErrorMessage(null);
    try {
      const eventId = await getPrimaryEventId();
      const res = await analyzeRoute({
        event_id: eventId,
        base_id: selectedBaseId,
        settlement_id: selectedSettlementId,
        algorithm: algorithm
      });
      setRouteResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("No mapped route is available under the selected flood-exposure assumptions. All approach road corridors are submerged.");
      setRouteResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const selectedBase = bases.find(b => b.id === selectedBaseId);
  const selectedSettlement = settlements.find(s => s.id === selectedSettlementId);

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
            <Navigation className="w-4 h-4" />
            <span>Tactical Evacuation & Access Logistics</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Rescue Route Assessment & Path Planning</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Dijkstra & A* shortest-path algorithms evaluating overland corridors against satellite flood extents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/command"
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>Command Center</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Map & Route Diagnostic on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left 4 Cols: Routing Parameters Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="surface-card p-4 space-y-4 text-xs">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              1. Routing Configuration
            </h3>

            {/* Origin Staging Base */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Origin Rescue Base:</label>
              <select
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.personnel_count} staff, {b.boats_count} boats)
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Settlement */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Target Settlement:</label>
              <select
                value={selectedSettlementId}
                onChange={(e) => setSelectedSettlementId(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
              >
                {settlements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Pop: {Number(s.estimated_population).toLocaleString()} · {s.connectivity_status?.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Algorithm:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlgorithm("dijkstra")}
                  className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                    algorithm === "dijkstra"
                      ? "bg-[#2563EB] text-white border-[#2563EB] font-semibold"
                      : "bg-[#0B1220] border-[#334155] text-slate-400 hover:text-white"
                  }`}
                >
                  Dijkstra Search
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithm("a_star")}
                  className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                    algorithm === "a_star"
                      ? "bg-[#2563EB] text-white border-[#2563EB] font-semibold"
                      : "bg-[#0B1220] border-[#334155] text-slate-400 hover:text-white"
                  }`}
                >
                  A* Heuristic
                </button>
              </div>
            </div>

            {/* Execute Calculation */}
            <button
              onClick={handleComputeRoute}
              disabled={isCalculating}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Compute Candidate Route</span>
            </button>
          </div>

          {/* Operational Safety Notice */}
          <div className="surface-card p-4 border-l-2 border-l-amber-500 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>MANDATORY SAFETY REQUIREMENT</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Never label a route as guaranteed safe. Satellite imagery captures surface water at pass time, but cannot certify that subgrade gravel, culverts, or bridge abutments remain structurally intact. Ground or UAV reconnaissance is required before dispatch.
            </p>
          </div>
        </div>

        {/* Right 8 Cols: Map & Route Assessment Results */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Interactive Map */}
          <div className="surface-card p-3 flex flex-col gap-2 min-h-[380px]">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2563EB]" />
                Candidate Route Geospatial Visualizer
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                {routeResult ? `Calculated Distance: ${routeResult.distance_km} km` : "Select base and target to compute"}
              </span>
            </div>

            <div className="w-full h-[340px] rounded-lg overflow-hidden">
              <FloodGuardMap
                layersData={layersData}
                candidateRoute={routeResult}
                selectedSettlement={selectedSettlement}
                floodOpacity={0.65}
              />
            </div>
          </div>

          {/* Error Message if disconnected */}
          {errorMessage && (
            <div className="surface-card p-4 border-l-2 border-l-red-500 text-xs text-red-300">
              <div className="font-semibold mb-1 flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>No Mapped Route Available</span>
              </div>
              <p className="leading-relaxed text-slate-400">{errorMessage}</p>
            </div>
          )}

          {/* Route Assessment Summary */}
          {routeResult && (
            <div className="surface-card p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-2.5">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    routeResult.route_classification === "unexposed_candidate_route"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}>
                    {routeResult.route_classification?.replace(/_/g, " ")}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">
                    Transit: {routeResult.base_name} → {routeResult.settlement_name}
                  </h3>
                </div>

                <div className="text-right font-mono text-[11px] text-[#94A3B8]">
                  Algorithm: {routeResult.algorithm_used}
                </div>
              </div>

              {/* Transit Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[#0B1220] rounded border border-[#334155]">
                  <span className="text-[#94A3B8] text-[10px] block">Transit Distance</span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-mono">
                    {routeResult.distance_km} km
                  </span>
                </div>

                <div className="p-2.5 bg-[#0B1220] rounded border border-[#334155]">
                  <span className="text-[#94A3B8] text-[10px] block">Estimated Duration</span>
                  <span className="text-lg font-bold text-amber-400 mt-0.5 block font-mono">
                    ~{Math.round(routeResult.estimated_time_minutes)} min
                  </span>
                </div>

                <div className="p-2.5 bg-[#0B1220] rounded border border-[#334155]">
                  <span className="text-[#94A3B8] text-[10px] block">Verification Status</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block">
                    Computational Planning Aid
                  </span>
                </div>
              </div>

              {/* Exposure Detail Note */}
              <div className="p-2.5 bg-[#0B1220] rounded border border-[#334155] text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Exposure Assessment:</span>
                <p className="leading-relaxed text-slate-400 text-[10px]">
                  {routeResult.flood_exposure_summary || "Route intersects SAR flood extent. Boat or amphibious transport required for submerged segments."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
