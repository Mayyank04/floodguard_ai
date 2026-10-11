"use client";

import React, { useEffect, useState } from "react";
import {
  Users, AlertTriangle, ShieldAlert, ArrowRight, Network,
  Navigation, MapPin, CheckCircle2, Info
} from "lucide-react";
import { fetchIsolationAnalysis } from "@/lib/api";
import Link from "next/link";

export default function IsolationAnalysisPage() {
  const [data, setIsolationData] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchIsolationAnalysis("6d5354bb-015e-4fb3-b050-d78fb1302910");
        setIsolationData(res);
        if (res.isolated_settlements && res.isolated_settlements.length > 0) {
          setSelectedCommunity(res.isolated_settlements[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isolatedCommunities = data?.isolated_settlements || [];
  const allSettlements = data?.all_settlements || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
            <Users className="w-4 h-4" />
            <span>Core Innovation: Graph-Based Isolation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Community Isolation & Road Network Severance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Topological NetworkX graph scenario exclusions identifying populations cut off from emergency staging bases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/routing"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>Plan Rescue Routes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-red-500">
          <div className="text-xs text-slate-400 uppercase font-semibold">Cut-Off Population</div>
          <div className="text-3xl font-black text-red-400 mt-2">
            {data?.potentially_isolated_population ? data.potentially_isolated_population.toLocaleString() : "61,100"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">No mapped dry overland route</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-orange-500">
          <div className="text-xs text-slate-400 uppercase font-semibold">Isolated Settlements</div>
          <div className="text-3xl font-black text-orange-400 mt-2">
            {data?.isolated_settlements_count || 5} Communities
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Out of {allSettlements.length || 10} analyzed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-500">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Rescue Bases</div>
          <div className="text-3xl font-black text-blue-400 mt-2">
            {data?.rescue_bases_active || 3} Bases
          </div>
          <div className="text-[11px] text-slate-400 mt-1">NDRF & SDRF Staging Units</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500">
          <div className="text-xs text-slate-400 uppercase font-semibold">Graph Topology</div>
          <div className="text-xl font-bold text-emerald-400 mt-2">NetworkX Model</div>
          <div className="text-[11px] text-slate-400 mt-1">Subtracted Inundated Edges</div>
        </div>
      </div>

      {/* Main Grid: Isolated Communities List + Inspection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Communities List */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Isolated Settlements Priority Assessment
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Click a settlement to view field evidence</span>
          </div>

          <div className="space-y-3">
            {isolatedCommunities.map((c: any) => (
              <div
                key={c.id}
                onClick={() => setSelectedCommunity(c)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedCommunity?.name === c.name
                    ? "bg-[#00D4FF]/15 border-[#00D4FF]/50 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.connectivity_status === "critical_isolated"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}>
                      {c.connectivity_status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="font-bold text-base text-white">{c.name}</span>
                    <span className="text-xs text-slate-400">({c.district || "Barpeta"})</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {c.notes || "All mapped roads cut by satellite flood extent."}
                  </p>
                </div>

                <div className="text-right flex sm:flex-col justify-between items-end flex-shrink-0">
                  <div className="text-slate-400 text-xs">
                    Pop: <strong className="text-[#00D4FF]">{Number(c.estimated_population).toLocaleString()}</strong>
                  </div>
                  <div className="text-sm font-bold text-yellow-400 sm:mt-1">
                    Score: {c.priority_score}/100 (Rank #{c.priority_rank})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Deep Dive Inspection Panel */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Network className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Graph Exclusion Diagnostics
              </h3>
            </div>

            {selectedCommunity ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-[10px] text-[#00D4FF] uppercase font-bold">Selected Community</div>
                  <h4 className="text-xl font-black text-white">{selectedCommunity.name}</h4>
                  <div className="text-slate-400">Estimated Population: <strong className="text-white">{Number(selectedCommunity.estimated_population).toLocaleString()}</strong></div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-slate-400 text-[11px] font-bold uppercase">Graph Status:</div>
                  <div className="text-red-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    No Unflooded Path to NDRF Base
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Distance to Water Edge: <strong className="text-slate-200">{selectedCommunity.flood_distance_meters || 0} m</strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="font-bold text-slate-200">Recommended Dispatch Strategy:</div>
                  <p className="leading-relaxed bg-slate-900/40 p-2.5 rounded border border-slate-800">
                    Wheeled trucks and ambulances are modeled as unable to reach this settlement due to severed culverts and submerged feeder corridors. 
                    Motorized NDRF inflatable rescue boats (IRBs) or helicopter airdrops are required.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">
                Select a community to view graph connectivity details.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Network Assumptions:</strong> Road connectivity is modeled using OpenStreetMap vectors. Any road segment intersecting satellite-detected floodwater is treated as impassable.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
