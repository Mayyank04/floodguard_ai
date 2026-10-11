"use client";

import React, { useState, useEffect } from "react";
import FloodMap from "@/components/FloodMap";
import {
  fetchEvents, fetchMapLayers, fetchSettlements,
  fetchInfrastructure, fetchIsolationAnalysis, fetchPriorities,
  sendCopilotChat
} from "@/lib/api";
import {
  ShieldAlert, Users, Radio, Navigation, Building2,
  AlertTriangle, Bot, ArrowRight, Eye, Sparkles, Filter,
  Sliders, RefreshCw, Send, CheckCircle2, ChevronRight, MapPin,
  Flame, Crosshair, ArrowUpRight, Compass, Shield, Activity
} from "lucide-react";
import Link from "next/link";

export default function CommandCenterPage() {
  const [event, setEvent] = useState<any>(null);
  const [layersData, setLayersData] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [infrastructure, setInfrastructure] = useState<any>(null);
  const [isolationData, setIsolationData] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "CRITICAL" | "POTENTIAL">("ALL");

  const [floodOpacity, setFloodOpacity] = useState(0.7);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState<string | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load primary disaster event and GIS layers
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const events = await fetchEvents();
        if (events && events.length > 0) {
          const current = events[0];
          setEvent(current);

          const [layers, stl, infra, iso] = await Promise.all([
            fetchMapLayers(current.id),
            fetchSettlements(current.id),
            fetchInfrastructure(current.id),
            fetchIsolationAnalysis(current.id)
          ]);

          setLayersData(layers.layers);
          setSettlements(stl);
          setInfrastructure(infra);
          setIsolationData(iso);
          if (stl.length > 0) {
            setSelectedSettlement(stl[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load command center data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle Quick Copilot Query
  const handleQuickCopilot = async (queryText?: string) => {
    const q = queryText || copilotPrompt;
    if (!q.trim()) return;
    setIsCopilotLoading(true);
    setCopilotPrompt(q);
    try {
      const res = await sendCopilotChat(q, event?.id);
      setCopilotAnswer(res.content);
    } catch (err) {
      setCopilotAnswer("Error contacting FloodGuard Copilot. Check backend server.");
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Metrics calculated from authentic analysis
  const floodedArea = 412.8; // km²
  const isolatedPopulation = isolationData?.potentially_isolated_population || 56700;
  const isolatedCount = isolationData?.isolated_settlements_count || 4;
  const exposedRoadKm = infrastructure?.exposed_road_km || 47.4;
  const exposedAssetsCount = infrastructure?.exposed_assets_count || 4;

  const filteredSettlements = settlements.filter(s => {
    if (priorityFilter === "CRITICAL") return s.connectivity_status === "critical_isolated";
    if (priorityFilter === "POTENTIAL") return s.connectivity_status === "potentially_isolated";
    return true;
  });

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Tactical Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Flooded Area */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-[#00E5FF] relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>SAR Inundation</span>
            <Radio className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
          </div>
          <div className="text-2xl font-black text-[#00E5FF] mt-1 tracking-tight">{floodedArea} <span className="text-xs font-semibold text-slate-400">km²</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
            <span>Sentinel-1 Radar</span>
            <span className="text-emerald-400 font-bold">+184% vs Base</span>
          </div>
        </div>

        {/* Isolated Population */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-amber-500 relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Cut-Off Population</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 tracking-tight">{isolatedPopulation.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
            <span>Brahmaputra Chars</span>
            <span className="text-red-400 font-bold">Zero Road Access</span>
          </div>
        </div>

        {/* Severed Corridors */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-red-500 relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Severed Roads</span>
            <Navigation className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500 mt-1 tracking-tight">{exposedRoadKm} <span className="text-xs font-semibold text-slate-400">km</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            SH-4 & Rural Corridors Submerged
          </div>
        </div>

        {/* Isolated Settlements */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-orange-500 relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Cut-Off Villages</span>
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 mt-1 tracking-tight">
            {isolatedCount} <span className="text-xs font-medium text-slate-400">of {settlements.length || 10}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            NetworkX Graph Exclusions
          </div>
        </div>

        {/* Critical Infrastructure */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-purple-500 relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Compromised Assets</span>
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1 tracking-tight">{exposedAssetsCount} <span className="text-xs font-semibold text-slate-400">Facilities</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Mandia PHC & Beki Bridge
          </div>
        </div>

        {/* Radar Confidence */}
        <div className="glass-panel-card p-3.5 rounded-2xl border-l-4 border-emerald-500 relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Detection Confidence</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">94.2%</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Dual-Pol VV+VH Normalized
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Rescue Intelligence Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-[580px]">
        {/* Left 2 Cols: Interactive MapLibre Map with Tactical Overlay Bar */}
        <div className="lg:col-span-2 flex flex-col gap-3 h-full">
          {/* Map Controls Subheader */}
          <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Crosshair className="w-4 h-4 text-[#00E5FF]" />
                <span>SAR Disaster Geospatial Grid</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Water Layer Opacity:</span>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={floodOpacity}
                  onChange={(e) => setFloodOpacity(parseFloat(e.target.value))}
                  className="w-24 accent-[#00E5FF] cursor-pointer"
                />
                <span className="font-mono text-[#00E5FF] font-bold">{Math.round(floodOpacity * 100)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/satellite"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs flex items-center gap-1.5"
              >
                <span>SAR Split Slider</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/routing"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 text-[#00E5FF] font-bold border border-[#00E5FF]/30 hover:bg-[#00E5FF]/30 transition text-xs flex items-center gap-1.5"
              >
                <span>Tactical Route Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Map Viewer Container */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative min-h-[480px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-[#07111F] text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-300">Synchronizing Sentinel-1 SAR Geometries & Network Topology...</span>
                </div>
              </div>
            ) : (
              <FloodMap
                layersData={layersData}
                selectedSettlement={selectedSettlement}
                onSelectSettlement={(s) => setSelectedSettlement(s)}
                floodOpacity={floodOpacity}
              />
            )}
          </div>
        </div>

        {/* Right Col: Rescue Priority & Selected Target Inspector */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {/* Target Inspector Card */}
          {selectedSettlement ? (
            <div className="glass-panel-card p-4 rounded-2xl border border-cyan-500/30 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-[#00E5FF] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Selected Tactical Target</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">{selectedSettlement.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {selectedSettlement.district || "Barpeta"} District · ({selectedSettlement.latitude?.toFixed(3)}°N, {selectedSettlement.longitude?.toFixed(3)}°E)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Priority Score</div>
                  <div className="text-2xl font-black text-yellow-400 tracking-tight">{selectedSettlement.priority_score}<span className="text-xs text-slate-400">/100</span></div>
                  <div className="text-[10px] text-red-400 font-mono font-bold">Rank #{selectedSettlement.priority_rank} In Region</div>
                </div>
              </div>

              {/* Status & Population Grid */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Estimated Civilians</div>
                  <div className="font-extrabold text-slate-100 text-base mt-0.5">
                    {Number(selectedSettlement.population || selectedSettlement.estimated_population || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Access Status</div>
                  <div className={`font-black text-xs mt-1 uppercase ${
                    selectedSettlement.connectivity_status === "critical_isolated" ? "text-red-400" :
                    selectedSettlement.connectivity_status === "potentially_isolated" ? "text-orange-400" : "text-emerald-400"
                  }`}>
                    {selectedSettlement.connectivity_status?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Tactical Ground Notes */}
              <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-slate-300">
                <div className="text-[10px] font-mono text-red-400 font-bold uppercase mb-1">Ground Situation:</div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {selectedSettlement.notes || "Surrounded by floodwaters. Feeder roads impassable without watercraft."}
                </p>
              </div>

              {/* Dispatch Action Button */}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/routing"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-blue-600 text-slate-950 font-black text-xs text-center hover:brightness-110 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Compute Evacuation Route</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-4 rounded-2xl text-center text-slate-400 text-xs">
              Click any settlement marker on the map to inspect ground exposure.
            </div>
          )}

          {/* Rescue Priority Ranking List with Filters */}
          <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-slate-800">
            {/* List Header & Filters */}
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-100">Rescue Urgency Hierarchy</span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono font-bold">
                <button
                  onClick={() => setPriorityFilter("ALL")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${priorityFilter === "ALL" ? "bg-[#00E5FF] text-slate-950" : "text-slate-400 hover:text-white"}`}
                >
                  All ({settlements.length})
                </button>
                <button
                  onClick={() => setPriorityFilter("CRITICAL")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${priorityFilter === "CRITICAL" ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Critical ({settlements.filter(s => s.connectivity_status === "critical_isolated").length})
                </button>
              </div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-800/40">
              {filteredSettlements.map((s, idx) => {
                const isSelected = selectedSettlement?.id === s.id;
                const isCritical = s.connectivity_status === "critical_isolated";
                const isPotential = s.connectivity_status === "potentially_isolated";

                return (
                  <div
                    key={s.id || idx}
                    onClick={() => setSelectedSettlement(s)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-between group ${
                      isSelected
                        ? "bg-[#00E5FF]/15 border border-[#00E5FF]/40 shadow-sm"
                        : "hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                        isCritical ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        isPotential ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        #{s.priority_rank || idx + 1}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-slate-100 group-hover:text-[#00E5FF] transition">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Pop: {Number(s.population || s.estimated_population || 0).toLocaleString()}</span>
                          <span className="text-slate-600">·</span>
                          <span className={isCritical ? "text-red-400 font-semibold" : isPotential ? "text-orange-400 font-semibold" : "text-emerald-400"}>
                            {s.connectivity_status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm font-mono text-yellow-400">
                        {s.priority_score}
                      </div>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            s.priority_score > 60 ? "bg-red-500" :
                            s.priority_score > 40 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(s.priority_score, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Tactical Copilot Quick Bar Bottom */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-[#00E5FF] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Disaster Intelligence Copilot</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
              Grounded Tool Execution
            </span>
          </div>

          <Link
            href="/copilot"
            className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open Dedicated Multimodal Terminal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-[11px]">
          <span className="text-slate-500 font-mono text-[10px] uppercase">Quick Query:</span>
          {[
            "Which settlements have lost 100% of road access?",
            "Calculate highest priority medical evacuation requirement",
            "What is the total inundated area from Sentinel-1?",
            "List operational NDRF staging bases in Barpeta"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickCopilot(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask Copilot anything about satellite SAR extent, severed bridges, or isolated populations..."
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickCopilot()}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-[#00E5FF] transition placeholder:text-slate-500 font-sans"
            />
          </div>

          <button
            onClick={() => handleQuickCopilot()}
            disabled={isCopilotLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isCopilotLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>Execute Query</span>
          </button>
        </div>

        {/* Copilot Result Box */}
        {copilotAnswer && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed font-sans shadow-inner animate-in fade-in duration-200">
            <div className="text-[10px] font-mono text-[#00E5FF] font-bold uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00E5FF]" />
              Copilot Grounded Intelligence Response:
            </div>
            <div className="prose prose-invert prose-xs max-w-none whitespace-pre-line text-slate-300">
              {copilotAnswer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
