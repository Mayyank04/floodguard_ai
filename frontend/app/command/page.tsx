"use client";

import React, { useState, useEffect } from "react";
import FloodGuardMap from "@/components/maps/FloodGuardMap";
import {
  fetchEvents, fetchMapLayers, fetchSettlements,
  fetchInfrastructure, fetchIsolationAnalysis,
  sendCopilotChat
} from "@/lib/api";
import {
  Activity, Users, Radio, Navigation, Building2,
  Bot, ArrowRight, Eye, RefreshCw, Send, CheckCircle2,
  ChevronRight, MapPin, Flame, Crosshair, Shield,
  Search, Sliders, ExternalLink, X, Compass, ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function CommandCenterPage() {
  const [event, setEvent] = useState<any>(null);
  const [layersData, setLayersData] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [infrastructure, setInfrastructure] = useState<any>(null);
  const [isolationData, setIsolationData] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

  // Sidebar active tab: "urgency" | "copilot"
  const [sidebarTab, setSidebarTab] = useState<"urgency" | "copilot">("urgency");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "CRITICAL">("ALL");
  const [floodOpacity, setFloodOpacity] = useState(0.65);

  // Copilot quick chat
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

  const handleQuickCopilot = async (queryText?: string) => {
    const q = queryText || copilotPrompt;
    if (!q.trim()) return;
    setIsCopilotLoading(true);
    setCopilotPrompt(q);
    setSidebarTab("copilot");
    try {
      const res = await sendCopilotChat(q, event?.id);
      setCopilotAnswer(res.content);
    } catch (err) {
      setCopilotAnswer("Error querying FloodGuard Copilot. Ensure backend service is online.");
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const floodedArea = 412.8; // km²
  const isolatedPopulation = isolationData?.potentially_isolated_population || 56700;
  const isolatedCount = isolationData?.isolated_settlements_count || 4;
  const exposedRoadKm = infrastructure?.exposed_road_km || 47.4;

  const filteredSettlements = settlements.filter(s => {
    if (priorityFilter === "CRITICAL") return s.connectivity_status === "critical_isolated";
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] gap-2.5 overflow-hidden">
      {/* 1. Compact High-Density Metrics Bar */}
      <div className="panel px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#101726]">
        {/* Metric Items Inline */}
        <div className="flex items-center gap-5 sm:gap-7 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Flooded Extent:</span>
            <span className="font-semibold text-white font-mono text-sm">{floodedArea} km²</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Isolated Population:</span>
            <span className="font-semibold text-[#F87171] font-mono text-sm">{isolatedPopulation.toLocaleString()}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Severed Roads:</span>
            <span className="font-semibold text-[#FBBF24] font-mono text-sm">{exposedRoadKm} km</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[#94A3B8] text-[11px]">Cut-Off Communities:</span>
            <span className="font-semibold text-white font-mono text-sm">{isolatedCount} of {settlements.length || 10}</span>
          </div>
        </div>

        {/* Map Opacity Slider & Quick Nav */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="text-[11px]">Flood Mask Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={floodOpacity}
              onChange={(e) => setFloodOpacity(parseFloat(e.target.value))}
              className="w-20 accent-[#2563EB] cursor-pointer"
            />
            <span className="font-mono text-white text-[11px]">{Math.round(floodOpacity * 100)}%</span>
          </div>

          <div className="h-4 w-px bg-[#24324B]" />

          <Link
            href="/routing"
            className="btn-primary text-xs py-1 px-2.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Planner</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Geospatial Workspace (Large Map + Contextual Sidebar) */}
      <div className="flex-1 flex gap-2.5 min-h-0 overflow-hidden">
        {/* Large Interactive Map (70% viewport) */}
        <div className="flex-1 panel relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#151F32] text-slate-400">
              <div className="flex flex-col items-center gap-2 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-[#2563EB]" />
                <span>Synchronizing CARTO Voyager & Spatial Overlays...</span>
              </div>
            </div>
          ) : (
            <FloodGuardMap
              layersData={layersData}
              selectedSettlement={selectedSettlement}
              onSelectSettlement={(s) => setSelectedSettlement(s)}
              floodOpacity={floodOpacity}
              className="rounded-none border-none"
            />
          )}
        </div>

        {/* Contextual Intelligence Sidebar (30% viewport, width 360px) */}
        <div className="w-80 lg:w-96 panel flex flex-col overflow-hidden bg-[#101726]">
          {/* Sidebar Tab Header */}
          <div className="flex items-center border-b border-[#24324B] px-3 pt-2 bg-[#151F32]">
            <button
              onClick={() => setSidebarTab("urgency")}
              className={`pb-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                sidebarTab === "urgency"
                  ? "border-[#2563EB] text-white"
                  : "border-transparent text-[#94A3B8] hover:text-white"
              }`}
            >
              Priority Settlements
            </button>
            <button
              onClick={() => setSidebarTab("copilot")}
              className={`pb-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                sidebarTab === "copilot"
                  ? "border-[#2563EB] text-white"
                  : "border-transparent text-[#94A3B8] hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Copilot Assist</span>
            </button>
          </div>

          {/* TAB 1: Priority Settlements Queue & Target Inspector */}
          {sidebarTab === "urgency" && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
              {/* Selected Target Card (If settlement selected) */}
              {selectedSettlement && (
                <div className="p-3 rounded-lg bg-[#151F32] border border-[#24324B] space-y-2 text-xs">
                  <div className="flex items-start justify-between border-b border-[#24324B] pb-2">
                    <div>
                      <span className="text-[10px] text-[#2563EB] font-semibold uppercase tracking-wider block">
                        Inspecting Target
                      </span>
                      <h4 className="font-semibold text-white text-sm">{selectedSettlement.name}</h4>
                      <span className="text-[11px] text-[#94A3B8] font-mono">
                        {selectedSettlement.district || "Barpeta"} · {selectedSettlement.latitude?.toFixed(3)}°N, {selectedSettlement.longitude?.toFixed(3)}°E
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="badge badge-warning font-mono font-semibold">
                        Score {selectedSettlement.priority_score}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Rank #{selectedSettlement.priority_rank}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-1.5 rounded bg-[#101726]">
                      <span className="text-[#94A3B8] block text-[10px]">Population</span>
                      <span className="font-medium text-white">
                        {Number(selectedSettlement.population || selectedSettlement.estimated_population || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-1.5 rounded bg-[#101726]">
                      <span className="text-[#94A3B8] block text-[10px]">Overland Access</span>
                      <span className={`font-medium capitalize text-[10px] ${
                        selectedSettlement.connectivity_status === "critical_isolated" ? "text-red-400" : "text-amber-400"
                      }`}>
                        {selectedSettlement.connectivity_status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#94A3B8] leading-relaxed pt-1">
                    {selectedSettlement.notes || "All connecting approach feeder roads submerged. Evacuation requires motorized watercraft."}
                  </p>

                  <Link
                    href="/routing"
                    className="btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Plan Route to this Location</span>
                  </Link>
                </div>
              )}

              {/* Settlement Urgency Hierarchy List */}
              <div className="flex-1 flex flex-col overflow-hidden panel-subtle">
                <div className="p-2 border-b border-[#1E2B45] flex items-center justify-between text-xs">
                  <span className="font-medium text-white text-[11px]">Urgency Hierarchy</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => setPriorityFilter("ALL")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        priorityFilter === "ALL" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({settlements.length})
                    </button>
                    <button
                      onClick={() => setPriorityFilter("CRITICAL")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        priorityFilter === "CRITICAL" ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Critical ({settlements.filter(s => s.connectivity_status === "critical_isolated").length})
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#1E2B45] text-xs">
                  {filteredSettlements.map((s, idx) => {
                    const isSelected = selectedSettlement?.id === s.id;
                    const isCutOff = s.connectivity_status === "critical_isolated";

                    return (
                      <div
                        key={s.id || idx}
                        onClick={() => setSelectedSettlement(s)}
                        className={`p-2.5 cursor-pointer transition flex items-center justify-between ${
                          isSelected ? "bg-[#1E2B45] border-l-2 border-l-[#2563EB]" : "hover:bg-[#151F32]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCutOff ? "bg-red-400" : "bg-emerald-400"}`} />
                          <div>
                            <div className="font-medium text-white text-[11px]">{s.name}</div>
                            <div className="text-[10px] text-[#94A3B8]">
                              Pop: {Number(s.population || s.estimated_population || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-amber-400 text-xs font-semibold">{s.priority_score}</span>
                          <div className="w-10 h-1 bg-[#151F32] rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${s.priority_score > 60 ? "bg-red-400" : "bg-amber-400"}`}
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
          )}

          {/* TAB 2: Copilot Quick Intelligence */}
          {sidebarTab === "copilot" && (
            <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 block">Quick Operational Queries</span>
                <div className="space-y-1">
                  {[
                    "Which settlements have lost 100% of road access?",
                    "List compromised hospitals in Barpeta",
                    "What is the total inundated area from Sentinel-1?"
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickCopilot(prompt)}
                      className="w-full text-left p-1.5 rounded bg-[#151F32] hover:bg-[#1E2B45] border border-[#24324B] text-[11px] text-[#94A3B8] hover:text-white transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Ask about bridges, roads, flood extent..."
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickCopilot()}
                  className="flex-1 bg-[#151F32] border border-[#24324B] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  onClick={() => handleQuickCopilot()}
                  disabled={isCopilotLoading}
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  {isCopilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Copilot Response Panel */}
              <div className="flex-1 overflow-y-auto panel-subtle p-2.5 space-y-1.5 text-slate-300 leading-relaxed text-[11px]">
                {copilotAnswer ? (
                  <div className="whitespace-pre-line">{copilotAnswer}</div>
                ) : (
                  <span className="text-slate-500 italic">
                    Select a suggested prompt or ask an operational question. Responses cite verified database entities.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
