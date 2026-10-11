"use client";

import React, { useState } from "react";
import {
  History, Calendar, MapPin, Satellite, ArrowRight,
  ShieldCheck, AlertTriangle, CloudRain, Droplets, Search,
  Filter, Layers, FileText, CheckCircle2, ChevronRight, Download
} from "lucide-react";
import Link from "next/link";

interface HistoricalEvent {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  district: string;
  state: string;
  dateRange: string;
  peakDate: string;
  inundationAreaKm2: number;
  isolatedCount: number;
  exposedRoadsKm: number;
  sensors: string[];
  provenance: "Verified Copernicus Sentinel-1" | "Archival Sentinel & Gauge" | "Hydrological Model Reanalysis";
  provenanceType: "ground_truth" | "archival" | "model";
  status: "active_benchmark" | "archived";
  summary: string;
  keyInsights: string[];
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: "assam-barpeta-2022",
    title: "Assam Brahmaputra Basin Flooding",
    subtitle: "Catastrophic monsoon riverine inundation across Barpeta-Mandia corridor",
    region: "Brahmaputra Valley",
    district: "Barpeta",
    state: "Assam, India",
    dateRange: "May 28 – June 28, 2022",
    peakDate: "2022-06-20",
    inundationAreaKm2: 412.8,
    isolatedCount: 61100,
    exposedRoadsKm: 41.7,
    sensors: ["Sentinel-1A C-SAR (10m)", "Sentinel-2 MSI", "CWC Gauge Beki River"],
    provenance: "Verified Copernicus Sentinel-1",
    provenanceType: "ground_truth",
    status: "active_benchmark",
    summary:
      "Pre-monsoon cloudbursts triggered severe flooding across 32 districts, affecting over 5.4 million people. Specular radar reflection dropped below -14.5 dB over 412.8 km² in Barpeta district, isolating major char communities along the Brahmaputra and Beki rivers.",
    keyInsights: [
      "Continuous radar penetration through 100% monsoon cloud cover (Track 121)",
      "NetworkX graph analysis identified 5 completely severed char settlements",
      "Kalgachia Civil Hospital isolated; Beki river gauge recorded +1.86m above danger level"
    ],
    bounds: [90.75, 26.25, 91.15, 26.55]
  },
  {
    id: "bihar-kosi-2008",
    title: "Bihar Kosi River Embankment Breach",
    subtitle: "Avulsion event shifting the Kosi channel 120 km eastward",
    region: "North Bihar Plains",
    district: "Supaul & Madhepura",
    state: "Bihar, India",
    dateRange: "Aug 18 – Sept 25, 2008",
    peakDate: "2008-08-28",
    inundationAreaKm2: 2840.0,
    isolatedCount: 320000,
    exposedRoadsKm: 185.0,
    sensors: ["RADARSAT-1 SAR", "Landsat 5 TM", "MODIS Terra"],
    provenance: "Archival Sentinel & Gauge",
    provenanceType: "archival",
    status: "archived",
    summary:
      "Catastrophic breach of the eastern afflux bund at Kusaha severed primary transportation arteries, submerging over 400 villages in non-traditional floodways and displacing over 3 million civilians.",
    keyInsights: [
      "Historic avulsion event requiring multi-basin spatial routing",
      "Embankment rupture caused sudden, high-velocity overland inundation",
      "Benchmark for multi-district topological graph severing"
    ],
    bounds: [86.50, 25.75, 87.25, 26.45]
  },
  {
    id: "kerala-periyar-2018",
    title: "Kerala Extreme Precipitation & Reservoir Surge",
    subtitle: "Statewide extreme monsoon runoff and synchronized dam releases",
    region: "Periyar & Pamba Basins",
    district: "Ernakulam & Alappuzha",
    state: "Kerala, India",
    dateRange: "Aug 08 – Aug 24, 2018",
    peakDate: "2018-08-16",
    inundationAreaKm2: 680.5,
    isolatedCount: 145000,
    exposedRoadsKm: 112.4,
    sensors: ["Sentinel-1B C-SAR", "Resourcesat-2 LISS-IV", "IMD Gridded Precipitation"],
    provenance: "Verified Copernicus Sentinel-1",
    provenanceType: "ground_truth",
    status: "archived",
    summary:
      "Precipitation 164% above normal forced simultaneous gate openings across 35 major reservoirs. Urban and rural communities in Ernakulam, Thrissur, and Alappuzha experienced rapid backwater inundation.",
    keyInsights: [
      "Complex terrain and coastal backwater interaction",
      "High density urban infrastructure exposure with hospital relocations",
      "Validated utility of C-band SAR in mountainous and coastal transition zones"
    ],
    bounds: [76.20, 9.85, 76.65, 10.25]
  },
  {
    id: "godavari-basin-2020",
    title: "Godavari Basin Lower Reach Inundation",
    subtitle: "Widespread submergence of tribal settlements in Polavaram backwaters",
    region: "Lower Godavari Basin",
    district: "East & West Godavari",
    state: "Andhra Pradesh, India",
    dateRange: "Aug 14 – Aug 29, 2020",
    peakDate: "2020-08-19",
    inundationAreaKm2: 520.0,
    isolatedCount: 48000,
    exposedRoadsKm: 64.0,
    sensors: ["Sentinel-1A SAR", "RISAT-1", "Central Water Commission Hydrographs"],
    provenance: "Hydrological Model Reanalysis",
    provenanceType: "model",
    status: "archived",
    summary:
      "Discharge exceeding 2.1 million cusecs at Dowleswaram barrage marooned dozens of island and riverbank habitations in the Papikonda hill range, requiring amphibious transport.",
    keyInsights: [
      "Demonstrated remote char village isolation along narrow gorge corridors",
      "Overland roads submerged under 3 to 5 meters of standing water",
      "Highlights essential role of boat-assisted staging points in route planner"
    ],
    bounds: [81.50, 16.90, 82.10, 17.40]
  }
];

export default function HistoricalEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ground_truth" | "active_benchmark">("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("assam-barpeta-2022");

  const filteredEvents = HISTORICAL_EVENTS.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "ground_truth") return ev.provenanceType === "ground_truth";
    if (selectedFilter === "active_benchmark") return ev.status === "active_benchmark";
    return true;
  });

  const selectedEvent = HISTORICAL_EVENTS.find((e) => e.id === selectedEventId) || HISTORICAL_EVENTS[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Historical Flood Archive</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">Verified Disaster Scenarios</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Disaster Event Library</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Curated and verified historical flood inundation scenarios with ground-truth Copernicus Sentinel-1 SAR observations, OpenStreetMap road networks, and hydrological gauge data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/command"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Open Active Benchmark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event, district, state, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Filter:</span>
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              selectedFilter === "all"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            All Events ({HISTORICAL_EVENTS.length})
          </button>
          <button
            onClick={() => setSelectedFilter("active_benchmark")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              selectedFilter === "active_benchmark"
                ? "bg-blue-900/40 text-blue-200 border border-blue-800/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Active Benchmark
          </button>
          <button
            onClick={() => setSelectedFilter("ground_truth")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              selectedFilter === "ground_truth"
                ? "bg-emerald-900/40 text-emerald-200 border border-emerald-800/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Copernicus SAR Verified
          </button>
        </div>
      </div>

      {/* Main Grid: Event List & Detailed Inspector */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Event Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredEvents.map((ev) => {
            const isSelected = ev.id === selectedEvent.id;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-slate-900/90 border-blue-500/80 shadow-md shadow-blue-950/40"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ev.status === "active_benchmark" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          Active Benchmark
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          Archived Scenario
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">{ev.peakDate}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white truncate">{ev.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span>{ev.district}, {ev.state}</span>
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition ${isSelected ? "text-blue-400 translate-x-0.5" : "text-slate-600"}`} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Extent</span>
                    <span className="font-semibold text-slate-200">{ev.inundationAreaKm2} km²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cut Off</span>
                    <span className="font-semibold text-amber-400">{ev.isolatedCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Roads</span>
                    <span className="font-semibold text-rose-400">{ev.exposedRoadsKm} km</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center bg-slate-900/30 border border-slate-800 rounded-xl text-slate-500 text-xs">
              No historical events match your search query.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Scenario Dossier (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          {/* Top Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  {selectedEvent.provenance}
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedEvent.dateRange}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedEvent.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{selectedEvent.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/command"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Load in Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Inundation Area</div>
              <div className="text-lg font-bold text-blue-400 mt-0.5">{selectedEvent.inundationAreaKm2} km²</div>
              <div className="text-[10px] text-slate-500">Sentinel-1 C-SAR drop</div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Civilians Isolated</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{selectedEvent.isolatedCount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Severed access corridors</div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Roads Cut Off</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">{selectedEvent.exposedRoadsKm} km</div>
              <div className="text-[10px] text-slate-500">Submerged culverts</div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Peak Inundation</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">{selectedEvent.peakDate}</div>
              <div className="text-[10px] text-slate-500">CWC crest recorded</div>
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Disaster Narrative & Hydrology</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
              {selectedEvent.summary}
            </p>
          </div>

          {/* Satellite & Ground Provenance */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Remote Sensing & Sensor Provenance</h4>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.sensors.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono"
                >
                  <Satellite className="w-3.5 h-3.5 text-blue-400" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights & Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Analytical Findings & Rescue Considerations</h4>
            <div className="space-y-1.5">
              {selectedEvent.keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Spatial Extent: <span className="font-mono text-slate-400">[{selectedEvent.bounds.join(", ")}]</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/satellite"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                Inspect SAR Rasters
              </Link>
              <Link
                href="/reports"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                Generate Briefing Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
