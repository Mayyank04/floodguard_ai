"use client";

import React, { useEffect, useState } from "react";
import {
  Building2, Navigation, AlertTriangle, CheckCircle2,
  ShieldAlert, Phone, MapPin, ExternalLink
} from "lucide-react";
import { fetchInfrastructure, getPrimaryEventId } from "@/lib/api";
import Link from "next/link";

export default function InfrastructureIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
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

  const filteredAssets = filterType === "all" ? assets : assets.filter((a: any) => a.asset_type === filterType);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <Building2 className="w-4 h-4" />
            <span>Lifeline & Infrastructure Exposure</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Infrastructure Exposure & Road Network Status</h1>
          <p className="text-xs text-slate-400 mt-1">
            Spatial intersections between satellite flood polygons, healthcare facilities, relief camps, bridges, and highways.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/command"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            View on Interactive Map
          </Link>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border-l-4 border-red-500">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Exposed Road Network</div>
          <div className="text-2xl font-black text-red-500 mt-1">{data?.exposed_road_km || 41.7} km</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Of {data?.total_road_km || 164.2} km Total Mapped</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-l-4 border-purple-500">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Compromised Facilities</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{data?.exposed_assets_count || 4} Assets</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hospitals, Bridges, Shelters</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-l-4 border-emerald-500">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Operational Arterials</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">NH-27 Open</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Northern Lifeline Intact</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-l-4 border-amber-500">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Action Status</div>
          <div className="text-2xl font-black text-amber-400 mt-1">Recon Required</div>
          <div className="text-[10px] text-slate-400 mt-0.5">No Safe Certifications Claimed</div>
        </div>
      </div>

      {/* Critical Facilities Table */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00D4FF]" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Critical Facilities & Evacuation Shelters
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {["all", "hospital", "shelter", "bridge", "school"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                  filterType === type ? "bg-[#00D4FF] text-slate-950 font-bold" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Asset Type</th>
                <th className="py-2.5 px-3">Exposure Status</th>
                <th className="py-2.5 px-3">Distance to Flood</th>
                <th className="py-2.5 px-3">Capacity</th>
                <th className="py-2.5 px-3">Emergency Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.map((asset: any) => (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      asset.flood_intersection ? "bg-red-500 animate-pulse" : asset.distance_to_flood_meters < 500 ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    {asset.name}
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-300 font-medium">
                    {asset.asset_type}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.exposure_status === "flood_exposed"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : asset.exposure_status === "potentially_affected"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {asset.exposure_status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {asset.distance_to_flood_meters === 0 ? "0 m (Direct Inundation)" : `${asset.distance_to_flood_meters} m`}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    {asset.capacity > 0 ? `${asset.capacity.toLocaleString()} beds/capacity` : "N/A"}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {asset.contact_info || "District Control Room"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitored Road Corridors Table */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Navigation className="w-4 h-4 text-[#00D4FF]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Road Network & Arterial Corridors (OpenStreetMap Intersections)
          </h3>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Road Corridor</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Total Length</th>
                <th className="py-2.5 px-3">Flooded Section</th>
                <th className="py-2.5 px-3">Accessibility Status</th>
                <th className="py-2.5 px-3">Recommended Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {roads.map((road: any) => (
                <tr key={road.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-bold text-white">{road.name}</td>
                  <td className="py-3 px-3 capitalize text-slate-300 font-medium">
                    {road.road_type?.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{road.length_km} km</td>
                  <td className="py-3 px-3 font-mono font-bold text-red-400">
                    {road.potentially_exposed_length_km} km
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      road.accessibility_status === "impassable_suspected"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : road.accessibility_status === "potentially_inundated"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {road.accessibility_status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {road.flood_intersection ? "Field inspection & boat staging required." : "Operational highway; clear from satellite flood extent."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
