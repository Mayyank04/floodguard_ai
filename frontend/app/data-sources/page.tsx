"use client";

import React, { useEffect, useState } from "react";
import {
  Satellite, Database, ShieldCheck, Download, ExternalLink,
  Layers, Radio, Cpu, CheckCircle2, AlertCircle, FileText, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { fetchDataSourcesCatalog } from "@/lib/api";
import { DataSourcesCatalog } from "@/types";

export default function DataSourcesPage() {
  const [catalog, setCatalog] = useState<DataSourcesCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await fetchDataSourcesCatalog();
        setCatalog(data);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleExportJson = () => {
    if (!catalog) return;
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floodguard-provenance-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B1220] text-slate-100 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Database className="w-4 h-4" />
            <span>Audit & Verification</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Data Sources & Provenance Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Traceable satellite acquisitions, authoritative geospatial vectors, and ground truth validation frameworks underpinning the FloodGuard AI 3.0 decision engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Catalog JSON
          </button>
          <Link
            href="/reports"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            View Situation Report
          </Link>
        </div>
      </div>

      {/* Provenance Integrity Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-slate-100 text-sm block">
              100% Traceable Evidence Policy
            </span>
            <p>
              In accordance with operational disaster management standards, FloodGuard AI does not fabricate sensor readings, unvalidated confidence metrics, or synthetic geometries. All flood extents are derived from radiometric thresholding of European Space Agency Copernicus Synthetic Aperture Radar (SAR) observations, cross-referenced against multi-spectral surface reflectance and verified ground incident reports.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            Spaceborne Remote Sensing Constellations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Primary active radar and multi-spectral sensors utilized for automated inundation mapping.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentinel-1 SAR */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 mb-2">
                  Primary Sensor • All-Weather Active Radar
                </span>
                <h3 className="text-lg font-bold text-white">Copernicus Sentinel-1 C-SAR</h3>
                <p className="text-xs text-slate-400">European Space Agency (ESA) Copernicus Programme</p>
              </div>
              <Radio className="w-6 h-6 text-cyan-400/80" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Acquisition Mode</span>
                <span className="font-semibold text-slate-200">Interferometric Wide (IW)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Product Type</span>
                <span className="font-semibold text-slate-200">GRDH (Ground Range Detected)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Radar Frequency</span>
                <span className="font-semibold text-slate-200">C-band (5.405 GHz / 5.54 cm)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Polarization</span>
                <span className="font-semibold text-slate-200">Dual-pol VV + VH</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Spatial Resolution</span>
                <span className="font-semibold text-slate-200">10m Pixel Spacing</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Cloud Penetration</span>
                <span className="font-semibold text-emerald-400">100% Day & Night Radar</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Flood Peak Acquisition:</span>
                <code className="text-[11px] bg-slate-900 px-2 py-0.5 rounded text-cyan-300">
                  S1A_IW_GRDH_1SDV_20220620T001428
                </code>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Pre-monsoon Reference:</span>
                <code className="text-[11px] bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                  S1A_IW_GRDH_1SDV_20220528T001427
                </code>
              </div>
            </div>
          </div>

          {/* Sentinel-2 MSI */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 mb-2">
                  Validation Sensor • Multi-Spectral Optical
                </span>
                <h3 className="text-lg font-bold text-white">Copernicus Sentinel-2 MSI</h3>
                <p className="text-xs text-slate-400">European Space Agency (ESA) Copernicus Programme</p>
              </div>
              <Layers className="w-6 h-6 text-emerald-400/80" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Instrument</span>
                <span className="font-semibold text-slate-200">Multi-Spectral Instrument (MSI)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Processing Level</span>
                <span className="font-semibold text-slate-200">Level-2A (Bottom-Of-Atmosphere)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Spectral Bands</span>
                <span className="font-semibold text-slate-200">B03 (Green), B08 (NIR), B11 (SWIR)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Water Indices</span>
                <span className="font-semibold text-slate-200">NDWI & MNDWI (Green vs SWIR)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Spatial Resolution</span>
                <span className="font-semibold text-slate-200">10m (B3, B8) / 20m (B11)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Cloud Filtering</span>
                <span className="font-semibold text-amber-400">SCL Cloud & Cirrus Masking</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              Used for dry-baseline surface water identification and cloud-free confirmation of inundation receding patterns post-monsoon.
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Vectors & Infrastructure */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Geospatial Vector Networks & Facility Registries
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Topological street networks and vital life-safety assets used for accessibility graph calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">OpenStreetMap Road Topology</h3>
              <span className="px-2 py-0.5 text-[10px] rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                ODbL License
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Extracted via OSMnx within Barpeta, Bajali, and Bongaigaon corridors. Covers 142.8 km of classified routes (National Highway NH-27, State Highway SH-4, Major District Roads, and rural Char links).
            </p>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Graph nodes:</span>
                <span className="font-mono text-slate-200">184 intersections</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Directed edges:</span>
                <span className="font-mono text-slate-200">242 road segments</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Critical Facilities & Shelters</h3>
              <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                District Contingency Registry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Curated locations of life-safety infrastructure cross-referenced between OSM tags and Assam State Disaster Management Authority contingency plans.
            </p>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Hospitals & CHCs:</span>
                <span className="font-mono text-slate-200">Kalgachia Civil, Barpeta FAAMCH, Mandia PHC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rescue Bases:</span>
                <span className="font-mono text-slate-200">Barpeta Town NDRF Staging Post</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Ground Truth Authorities */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Authoritative Response Agencies & Ground Truth
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Situational reports used to corroborate model exposure estimations with field reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">ASDMA Daily Flood Situation Reports</span>
              <span className="text-[10px] text-slate-400">Disaster Authority</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assam State Disaster Management Authority daily bulletins covering 32 affected districts, river gauge levels at Beki & Manas rivers, and relief camp headcounts.
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">1st Battalion NDRF Patgaon Operations</span>
              <span className="text-[10px] text-slate-400">First Responder</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              National Disaster Response Force staging deployments, motorized boat assets, and char evacuation logs corroborating candidate rescue ingress corridors.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Pipeline Flow */}
      <div className="bg-gradient-to-br from-slate-900 to-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          End-to-End Algorithmic Pipeline
        </h3>
        <p className="text-xs text-slate-400">
          Every intermediate stage produces inspectable geospatial artifacts with zero unexplained AI interpolations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold block mb-1">STAGE 1</span>
              <h4 className="font-semibold text-slate-200 mb-1">SAR Thresholding</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Specular reflection detection on Sentinel-1 VV polarizations (dB &lt; -14.5) with Lee speckle filter (5x5 kernel).
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold block mb-1">STAGE 2</span>
              <h4 className="font-semibold text-slate-200 mb-1">Permanent Water Mask</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Difference mapping against pre-monsoon baseline to isolate transient floodwaters from permanent river channels.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold block mb-1">STAGE 3</span>
              <h4 className="font-semibold text-slate-200 mb-1">Topological Cut</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                PostGIS ST_Intersects and Shapely spatial overlay against the OSM road graph; road segments severed or marked blocked.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold block mb-1">STAGE 4</span>
              <h4 className="font-semibold text-slate-200 mb-1">NetworkX Isolation</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Bi-directional Dijkstra search from NDRF staging posts to settlements to classify reachable vs isolated communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
