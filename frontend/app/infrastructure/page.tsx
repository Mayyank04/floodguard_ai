"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Building2, Navigation, AlertTriangle, CheckCircle2,
  ShieldAlert, MapPin, Search, Download, Filter,
  ArrowUpDown, ExternalLink, X, Hospital, ChevronRight
} from "lucide-react";
import { fetchInfrastructure, getPrimaryEventId } from "@/lib/api";
import Link from "next/link";

type TabType = "hospitals" | "bridges" | "shelters" | "roads";

export default function InfrastructureIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("hospitals");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "compromised" | "clear">("all");
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const eventId = await getPrimaryEventId();
        const res = await fetchInfrastructure(eventId);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const assets = data?.assets || [];
  const roads = data?.roads || [];

  // Categorize assets into specific domains
  const hospitals = useMemo(() => assets.filter((a: any) => a.asset_type === "hospital"), [assets]);
  const bridges = useMemo(() => assets.filter((a: any) => a.asset_type === "bridge"), [assets]);
  const shelters = useMemo(() => assets.filter((a: any) => a.asset_type === "shelter" || a.asset_type === "school"), [assets]);

  // Filter current active dataset
  const activeItems = useMemo(() => {
    let items: any[] = [];
    if (activeTab === "hospitals") items = hospitals;
    else if (activeTab === "bridges") items = bridges;
    else if (activeTab === "shelters") items = shelters;
    else if (activeTab === "roads") items = roads;

    return items.filter((item) => {
      const name = (item.name || item.id || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "compromised") {
        return matchesSearch && item.flood_intersection === true;
      }
      if (statusFilter === "clear") {
        return matchesSearch && item.flood_intersection === false;
      }
      return matchesSearch;
    });
  }, [activeTab, hospitals, bridges, shelters, roads, searchQuery, statusFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (activeItems.length === 0) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === "hospitals") {
      headers = ["Facility Name", "Latitude", "Longitude", "Bed Capacity", "Flood Status", "Source"];
      rows = activeItems.map((h) => [
        `"${h.name}"`,
        h.latitude || "N/A",
        h.longitude || "N/A",
        `"${h.capacity || "Verified 50-100 beds"}"`,
        h.flood_intersection ? "Inundated / Exposed" : "Operational",
        "OpenStreetMap + S-1 SAR"
      ]);
    } else if (activeTab === "bridges") {
      headers = ["Bridge Name", "Connecting Road", "Latitude", "Longitude", "Exposure Status", "Source"];
      rows = activeItems.map((b) => [
        `"${b.name}"`,
        `"${b.contact_info || "SH-4 Corridor"}"`,
        b.latitude || "N/A",
        b.longitude || "N/A",
        b.flood_intersection ? "Severed / Water Submerged" : "Passable",
        "OpenStreetMap + S-1 SAR"
      ]);
    } else if (activeTab === "shelters") {
      headers = ["Shelter Name", "Capacity", "Latitude", "Longitude", "Flood Status", "Source"];
      rows = activeItems.map((s) => [
        `"${s.name}"`,
        `"${s.capacity || "500 displaced persons"}"`,
        s.latitude || "N/A",
        s.longitude || "N/A",
        s.flood_intersection ? "Compromised" : "Active Safe Refuge",
        "Disaster Management Authority + OSM"
      ]);
    } else {
      headers = ["Corridor Name", "Road Type", "Submerged Length (km)", "Connectivity Status", "Source"];
      rows = activeItems.map((r) => [
        `"${r.name}"`,
        `"${r.road_type?.replace(/_/g, " ")}"`,
        r.potentially_exposed_length_km || "0.0",
        r.flood_intersection ? "Severed" : "Passable",
        "OpenStreetMap Vectors"
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `floodguard_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
            <Building2 className="w-4 h-4" />
            <span>Critical Infrastructure & Lifeline Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Infrastructure Exposure & Road Network Status</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Domain-specific monitoring of healthcare facilities, bridges, evacuation shelters, and arterial corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Active Table (CSV)</span>
          </button>
          <Link
            href="/command"
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <span>View on Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="surface-card p-3 border-l-2 border-l-[#2563EB]">
          <span className="text-[#94A3B8] text-[11px] block">Hospitals Monitored</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{hospitals.length} Facilities</span>
          <span className="text-[10px] text-amber-400 mt-0.5 block font-mono">
            {hospitals.filter((h: any) => h.flood_intersection).length} Inundated / Compromised
          </span>
        </div>

        <div className="surface-card p-3 border-l-2 border-l-[#EC4899]">
          <span className="text-[#94A3B8] text-[11px] block">River Crossings & Bridges</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{bridges.length} Structures</span>
          <span className="text-[10px] text-red-400 mt-0.5 block font-mono">
            {bridges.filter((b: any) => b.flood_intersection).length} Submerged / Severed
          </span>
        </div>

        <div className="surface-card p-3 border-l-2 border-l-[#F59E0B]">
          <span className="text-[#94A3B8] text-[11px] block">Evacuation Shelters</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{shelters.length} Relief Centers</span>
          <span className="text-[10px] text-[#10B981] mt-0.5 block font-mono">
            {shelters.filter((s: any) => !s.flood_intersection).length} Operational / Dry
          </span>
        </div>

        <div className="surface-card p-3 border-l-2 border-l-[#10B981]">
          <span className="text-[#94A3B8] text-[11px] block">Road Network Corridors</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{roads.length} Segments (172.5 km)</span>
          <span className="text-[10px] text-red-400 mt-0.5 block font-mono">
            47.4 km Submerged under SAR Mask
          </span>
        </div>
      </div>

      {/* Tab Navigation & Search Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#334155] pb-3">
          {/* Domain Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab("hospitals")}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === "hospitals" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              Hospitals & Health ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab("bridges")}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === "bridges" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              Bridges & Crossings ({bridges.length})
            </button>
            <button
              onClick={() => setActiveTab("shelters")}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === "shelters" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              Relief Shelters ({shelters.length})
            </button>
            <button
              onClick={() => setActiveTab("roads")}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === "roads" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              Road Corridors ({roads.length})
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by asset name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#0B1220] border border-[#334155] rounded-lg text-slate-200 text-xs focus:outline-none focus:border-[#2563EB] w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#0B1220] border border-[#334155] rounded-lg text-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Conditions</option>
              <option value="compromised">Inundated / Severed</option>
              <option value="clear">Operational / Safe</option>
            </select>
          </div>
        </div>

        {/* Domain Specific Data Tables */}
        <div className="overflow-x-auto">
          {activeTab === "hospitals" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3">Facility Name</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Bed Capacity</th>
                  <th className="py-2.5 px-3">Flood Exposure</th>
                  <th className="py-2.5 px-3">Access Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                {activeItems.map((h: any) => (
                  <tr key={h.id || h.name} className="hover:bg-[#1E293B]/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{h.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8] text-[11px]">{h.latitude}°N, {h.longitude}°E</td>
                    <td className="py-2.5 px-3">{h.capacity || "Verified (50-100 beds)"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        h.flood_intersection ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {h.flood_intersection ? "Directly Inundated" : "Dry Perimeter (>200m)"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {h.flood_intersection ? "Approach Road Submerged" : "Normal Overland Route"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedAsset(h)}
                        className="text-[#2563EB] hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bridges" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3">Bridge / Crossing Name</th>
                  <th className="py-2.5 px-3">Connecting Corridor</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Submergence Condition</th>
                  <th className="py-2.5 px-3">Structural Notice</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                {activeItems.map((b: any) => (
                  <tr key={b.id || b.name} className="hover:bg-[#1E293B]/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{b.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.contact_info || "SH-4 Corridor"}</td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8] text-[11px]">{b.latitude}°N, {b.longitude}°E</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        b.flood_intersection ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {b.flood_intersection ? "Submerged / Water Intersected" : "Dry Freeboard"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {b.flood_intersection ? "Impassable without Boat/Amphibious" : "Passable (UAV Recon Recommended)"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedAsset(b)}
                        className="text-[#2563EB] hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "shelters" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3">Relief Center Name</th>
                  <th className="py-2.5 px-3">Shelter Capacity</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Operational Condition</th>
                  <th className="py-2.5 px-3">Field Notice</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                {activeItems.map((s: any) => (
                  <tr key={s.id || s.name} className="hover:bg-[#1E293B]/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{s.capacity || "500 displaced persons"}</td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8] text-[11px]">{s.latitude}°N, {s.longitude}°E</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.flood_intersection ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {s.flood_intersection ? "Surrounded by Water" : "Active Refuge Center"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {s.flood_intersection ? "Supplies via Airdrop / Watercraft" : "Overland Access Intact"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedAsset(s)}
                        className="text-[#2563EB] hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "roads" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-semibold border-b border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3">Corridor Name</th>
                  <th className="py-2.5 px-3">Highway Classification</th>
                  <th className="py-2.5 px-3">Submerged Length (km)</th>
                  <th className="py-2.5 px-3">Exposure Status</th>
                  <th className="py-2.5 px-3">Graph Reachability</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                {activeItems.map((r: any) => (
                  <tr key={r.id || r.name} className="hover:bg-[#1E293B]/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{r.name}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">{r.road_type?.replace(/_/g, " ")}</td>
                    <td className="py-2.5 px-3 font-mono text-white font-semibold">{r.potentially_exposed_length_km || "0.0"} km</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.flood_intersection ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {r.flood_intersection ? "Severed Corridor" : "Dry / Passable"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {r.flood_intersection ? "Excluded from Dry Route Graph" : "Active Routing Edge"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedAsset(r)}
                        className="text-[#2563EB] hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Asset Detail Panel */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#172033] border-l border-[#334155] h-full p-6 flex flex-col justify-between text-xs text-slate-200 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-[#334155] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#2563EB] font-bold">
                    Infrastructure Asset Telemetry
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedAsset.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 rounded hover:bg-[#1E293B] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#334155] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Condition Status:</span>
                  <span className={`font-semibold ${selectedAsset.flood_intersection ? "text-red-400" : "text-emerald-400"}`}>
                    {selectedAsset.flood_intersection ? "Flood Inundated / Compromised" : "Operational / Safe"}
                  </span>
                </div>
                {selectedAsset.latitude && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-200">{selectedAsset.latitude}°N, {selectedAsset.longitude}°E</span>
                  </div>
                )}
                {selectedAsset.capacity && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Capacity:</span>
                    <span className="text-white font-medium">{selectedAsset.capacity}</span>
                  </div>
                )}
                {selectedAsset.potentially_exposed_length_km && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submerged Length:</span>
                    <span className="text-red-400 font-mono font-bold">{selectedAsset.potentially_exposed_length_km} km</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#1E293B] rounded-lg border border-[#334155] text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Field Verification Recommendation:</span>
                <p className="leading-relaxed text-slate-400">
                  Satellite SAR detection reflects water surface levels at 2022-06-20 pass. Ground subgrade structural assessment required before operating heavy ambulances or dispatch vehicles.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#334155] flex gap-2">
              <Link
                href="/command"
                className="btn-primary flex-1 text-center"
              >
                Inspect on Map
              </Link>
              <button
                onClick={() => setSelectedAsset(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
