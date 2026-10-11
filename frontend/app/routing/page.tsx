"use client";

import React, { useEffect, useState } from "react";
import {
  Navigation, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, MapPin, ArrowRight, RefreshCw, Compass,
  Layers, ChevronRight, ShieldCheck, Info, X
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
      setErrorMessage("No mapped route available under strict dry road constraints. Overland approach road segments are submerged.");
      setRouteResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const selectedBase = bases.find(b => b.id === selectedBaseId);
  const selectedSettlement = settlements.find(s => s.id === selectedSettlementId);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] gap-2.5 overflow-hidden max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <div className="panel px-4 py-2.5 flex items-center justify-between text-xs bg-[#101726]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">Rescue Route Planning & Corridor Assessment</span>
          <span className="badge badge-info font-mono">Dijkstra / A* Graph Pathfinder</span>
        </div>

        <Link href="/command" className="btn-secondary text-xs py-1 px-2.5">
          <span>Command Center</span>
        </Link>
      </div>

      {/* 2. Map-First Workspace with Floating Route Configuration Card */}
      <div className="flex-1 panel relative overflow-hidden flex flex-col">
        {/* Full Viewport Map */}
        <FloodGuardMap
          layersData={layersData}
          candidateRoute={routeResult}
          selectedSettlement={selectedSettlement}
          floodOpacity={0.65}
          className="rounded-none border-none"
        />

        {/* Floating Route Configuration & Comparison Panel (Left Overlay) */}
        <div className="absolute top-3 left-3 z-30 w-80 sm:w-96 floating-hud p-4 rounded-xl text-xs space-y-3.5 max-h-[calc(100%-1.5rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#24324B] pb-2">
            <span className="font-semibold text-white text-xs">Route Parameters</span>
            <span className="text-[11px] text-[#94A3B8]">OSM Road Graph</span>
          </div>

          {/* Base Selector */}
          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px]">Origin Rescue Staging Base:</label>
            <select
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              className="w-full bg-[#101726] border border-[#24324B] rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#2563EB]"
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
            <label className="text-[#94A3B8] text-[11px]">Destination Target Community:</label>
            <select
              value={selectedSettlementId}
              onChange={(e) => setSelectedSettlementId(e.target.value)}
              className="w-full bg-[#101726] border border-[#24324B] rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#2563EB]"
            >
              {settlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Pop: {Number(s.estimated_population).toLocaleString()} · {s.connectivity_status?.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>

          {/* Algorithm Toggle */}
          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px]">Graph Search Algorithm:</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAlgorithm("dijkstra")}
                className={`p-1.5 rounded border text-center text-xs transition cursor-pointer ${
                  algorithm === "dijkstra"
                    ? "bg-[#2563EB] text-white border-[#2563EB] font-medium"
                    : "bg-[#101726] border-[#24324B] text-slate-400 hover:text-white"
                }`}
              >
                Dijkstra Shortest Path
              </button>
              <button
                type="button"
                onClick={() => setAlgorithm("a_star")}
                className={`p-1.5 rounded border text-center text-xs transition cursor-pointer ${
                  algorithm === "a_star"
                    ? "bg-[#2563EB] text-white border-[#2563EB] font-medium"
                    : "bg-[#101726] border-[#24324B] text-slate-400 hover:text-white"
                }`}
              >
                A* Heuristic Search
              </button>
            </div>
          </div>

          {/* Compute Action */}
          <button
            onClick={handleComputeRoute}
            disabled={isCalculating}
            className="btn-primary w-full text-xs py-2 disabled:opacity-40"
          >
            {isCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>Calculate Candidate Path</span>
          </button>

          {/* Route Comparison / Results Card */}
          {routeResult && (
            <div className="p-3 rounded-lg bg-[#101726] border border-[#24324B] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#24324B] pb-1.5">
                <span className="font-semibold text-white">Route Result</span>
                <span className={`badge ${
                  routeResult.route_classification === "unexposed_candidate_route" ? "badge-success" : "badge-danger"
                }`}>
                  {routeResult.route_classification?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 bg-[#151F32] rounded">
                  <span className="text-[#94A3B8] block text-[10px]">Distance</span>
                  <span className="font-mono font-semibold text-white">{routeResult.distance_km} km</span>
                </div>
                <div className="p-1.5 bg-[#151F32] rounded">
                  <span className="text-[#94A3B8] block text-[10px]">Estimated Transit</span>
                  <span className="font-mono font-semibold text-amber-400">~{Math.round(routeResult.estimated_time_minutes)} min</span>
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed pt-1">
                {routeResult.flood_exposure_summary || "Route intersects water extent. Requires boat / amphibious evacuation."}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30 text-red-300 text-[11px]">
              {errorMessage}
            </div>
          )}

          {/* Operational Safety Notice */}
          <div className="p-2.5 rounded bg-[#101726] border border-[#24324B] text-[10px] text-slate-400 space-y-1">
            <span className="font-semibold text-amber-400 block">Reconnaissance Notice:</span>
            <p className="leading-relaxed">
              Candidate routes are computational planning aids. Satellite radar cannot certify road subgrade stability or culvert integrity. Tactical UAV or ground scout verification required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
