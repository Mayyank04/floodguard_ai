"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Navigation, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, MapPin, ArrowRight, RefreshCw, Compass,
  Layers, ChevronRight, ShieldCheck, Info, X, AlertOctagon,
  Sparkles, FileText, Activity
} from "lucide-react";
import {
  fetchSettlements, fetchIsolationAnalysis, analyzeRoute,
  fetchMapLayers, getPrimaryEventId
} from "@/lib/api";
import FloodGuardMap from "@/components/maps/FloodGuardMap";
import Link from "next/link";

export default function RescuePlanningPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [selectedSettlementId, setSelectedSettlementId] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<string>("dijkstra");

  const [layersData, setLayersData] = useState<any>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"params" | "comparison" | "inspection">("params");

  const loadData = useCallback(async () => {
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
      if (iso.rescue_bases?.length > 0 && !selectedBaseId) {
        setSelectedBaseId(iso.rescue_bases[0].id);
      }
      if (stl.length > 0 && !selectedSettlementId) {
        setSelectedSettlementId(stl[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedBaseId, selectedSettlementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setActiveTab("comparison");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("No overland path accessible under current dry road assumptions. Approach corridor is inundated.");
      setRouteResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRoadStatusUpdated = async () => {
    await loadData();
    if (selectedBaseId && selectedSettlementId) {
      handleComputeRoute();
    }
  };

  const selectedBase = bases.find(b => b.id === selectedBaseId);
  const selectedSettlement = settlements.find(s => s.id === selectedSettlementId);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] gap-2.5 overflow-hidden max-w-7xl mx-auto p-2 sm:p-4">
      {/* 1. Header Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Dynamic Rescue Route Planning</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                NetworkX {algorithm === "dijkstra" ? "Dijkstra" : "A* Heuristic"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Topological graph pathfinding with flood exclusion scenarios & field road overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/command"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-xs border border-slate-700"
          >
            Command Briefing
          </Link>
          <Link
            href="/incidents"
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition text-xs"
          >
            Field Intelligence
          </Link>
        </div>
      </div>

      {/* 2. Map-First Workspace with Floating Route Configuration Card */}
      <div className="flex-1 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col bg-[#0B1220]">
        {/* Full Viewport Map */}
        <FloodGuardMap
          layersData={layersData}
          candidateRoute={routeResult}
          selectedSettlement={selectedSettlement}
          onRoadStatusUpdated={handleRoadStatusUpdated}
          floodOpacity={0.65}
          className="rounded-none border-none"
        />

        {/* Floating Route Configuration & Verification Panel (Left Overlay) */}
        <div className="absolute top-3 left-3 z-30 w-80 sm:w-96 bg-[#111827]/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl text-xs space-y-4 max-h-[calc(100%-1.5rem)] overflow-y-auto shadow-2xl">
          {/* Panel Tabs */}
          <div className="flex items-center border-b border-slate-800 pb-2 gap-2">
            <button
              onClick={() => setActiveTab("params")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                activeTab === "params"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Route Parameters
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              disabled={!routeResult}
              className={`px-2.5 py-1 rounded text-xs font-medium transition disabled:opacity-40 ${
                activeTab === "comparison"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Candidate Analysis
            </button>
          </div>

          {activeTab === "params" && (
            <div className="space-y-3.5">
              {/* Origin Selector */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-medium block">
                  Origin Rescue Staging Base:
                </label>
                <select
                  value={selectedBaseId}
                  onChange={(e) => setSelectedBaseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.personnel_count} staff, {b.boats_count} boats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Selector */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-medium block">
                  Target Community / Settlement:
                </label>
                <select
                  value={selectedSettlementId}
                  onChange={(e) => setSelectedSettlementId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {settlements.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Pop: {Number(s.estimated_population).toLocaleString()} · {s.connectivity_status?.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Algorithm Toggle */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-medium block">
                  Topological Graph Algorithm:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlgorithm("dijkstra")}
                    className={`p-2 rounded-lg border text-center text-xs transition cursor-pointer ${
                      algorithm === "dijkstra"
                        ? "bg-cyan-950/80 text-cyan-300 border-cyan-700 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Dijkstra (Shortest)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlgorithm("a_star")}
                    className={`p-2 rounded-lg border text-center text-xs transition cursor-pointer ${
                      algorithm === "a_star"
                        ? "bg-cyan-950/80 text-cyan-300 border-cyan-700 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    A* (Euclidean H.)
                  </button>
                </div>
              </div>

              {/* Compute Action */}
              <button
                onClick={handleComputeRoute}
                disabled={isCalculating}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-sm"
              >
                {isCalculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span>Calculate Candidate Route</span>
              </button>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                    <span>Inaccessible via Mapped Roads</span>
                  </div>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "comparison" && routeResult && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-white text-xs">Route Calculation</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  routeResult.route_classification === "unexposed_candidate_route"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}>
                  {routeResult.route_classification?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Distance</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {routeResult.distance_km} km
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Estimated Convoy Time</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    ~{Math.round(routeResult.estimated_time_minutes)} min
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] text-slate-400 font-medium block">Corridor Summary:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {routeResult.flood_exposure_summary}
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Waypoints: {routeResult.waypoints_geojson?.coordinates?.length || 0} nodes</span>
                  <span>Algorithm: {routeResult.algorithm_used || algorithm.toUpperCase()}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("params")}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
              >
                Modify Parameters
              </button>
            </div>
          )}

          {/* Operational Safety Notice - MANDATORY REQUIREMENT */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 text-[11px] text-amber-200/90 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Candidate route requiring field verification</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-amber-100/75">
              Candidate routes are computational planning aids derived from satellite observations and OpenStreetMap geometries. Spaceborne radar cannot certify road subgrade stability, washed-out culverts, or bridge structural integrity. Tactical UAV or ground scout reconnaissance is strictly required before dispatch.
            </p>
          </div>

          {/* Interactive Road Override Guide */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10.5px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Road Status Override:</span>
            <p className="leading-relaxed">
              Click any road segment on the map to inspect its flood intersection and manually update its operational status to <span className="text-emerald-400">Reported Open</span> or <span className="text-red-400">Reported Blocked</span>. The graph will recalculate instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
