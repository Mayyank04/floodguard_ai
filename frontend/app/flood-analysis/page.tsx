"use client";

import React, { useState } from "react";
import {
  RadioTower, Download, Layers, ShieldCheck, Activity,
  FileCode, Database, ArrowRight, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function FloodAnalysisPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadGeoJSON = () => {
    // Generate and download GeoJSON
    const geojsonData = {
      type: "FeatureCollection",
      metadata: {
        source: "Sentinel-1 C-SAR IW GRDH",
        region: "Barpeta & Lower Assam Basin",
        flooded_area_sq_km: 412.8,
        acquisition_date: "2022-06-20",
        confidence: 0.94
      },
      features: []
    };
    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "floodguard_assam_flood_mask_2022.geojson";
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
            <RadioTower className="w-4 h-4" />
            <span>Inundation & Vector Mask Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">AI Flood Detection & Water Inundation Extent</h1>
          <p className="text-xs text-slate-400 mt-1">
            Reproducible satellite change detection algorithms, backscatter histograms, and georeferenced boundary polygons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadGeoJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102238] border border-cyan-500/40 text-[#00D4FF] text-xs font-bold hover:bg-cyan-500/10 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? "Downloaded!" : "Download GeoJSON Mask"}</span>
          </button>

          <Link
            href="/command"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>View on Command Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-[#00D4FF]">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Surface Water Extent</div>
            <div className="text-4xl font-black text-[#00D4FF] mt-2">412.8 km²</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Calculated via geodesic polygon projection in WGS84 EPSG:4326 scaled to 26.3°N latitude. Represents 34% of monitored lowland territory.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Permanent Waterbody: <strong>112.4 km²</strong></span>
            <span>Surge Deluge: <strong>300.4 km²</strong></span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-emerald-500">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Detection Algorithm</div>
            <div className="text-xl font-black text-white mt-2">SAR Backscatter Thresholding</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Dual-polarization (VV+VH) radar intensity thresholded at <strong>-14.5 dB</strong> with 5x5 Lee Sigma filtering to eliminate speckle artifacts while preserving riverine char boundaries.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>False-Alarm Rate: <strong>&lt; 3.2%</strong></span>
            <span>Spatial Res: <strong>10 meters</strong></span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-purple-500">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Permanent Water Exclusion</div>
            <div className="text-xl font-black text-purple-400 mt-2">Pre-Monsoon Reference</div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Pre-flood baseline scene from <strong>2022-05-28</strong> subtracted from <strong>2022-06-20</strong> inundation to prevent normal riverbeds from inflating emergency deluge figures.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Baseline Delta: <strong>+267%</strong></span>
            <span>Status: <strong>Verified</strong></span>
          </div>
        </div>
      </div>

      {/* Algorithmic Methodology Details */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00D4FF]" />
          Remote Sensing Methodology & Signal Physics
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-bold text-[#00D4FF] text-sm">Why Optical Satellites Fail in Monsoon Floods</h4>
            <p>
              Traditional optical imaging (e.g. Landsat, Sentinel-2) relies on visible and near-infrared reflectance. 
              During catastrophic monsoon events like the Assam Brahmaputra floods, cloud cover consistently exceeds 90-95%, 
              blinding optical sensors completely.
            </p>
            <p>
              FloodGuard AI solves this critical bottleneck by prioritizing Synthetic Aperture Radar (SAR), which operates at C-Band (5.405 GHz) microwave frequencies that travel unimpeded through clouds, torrential rain, and darkness.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-emerald-400 text-sm">Physics of Radar Specular Reflection</h4>
            <p>
              Rough dry terrain and vegetation backscatter microwave radar pulses in multiple directions, returning a strong signal (-6 dB to -10 dB) to the satellite sensor.
            </p>
            <p>
              In contrast, smooth standing water acts like a mirror, reflecting incoming radar beams away from the satellite path. This creates a steep drop in backscatter intensity (&lt; -14.5 dB), rendering flooded expanses jet black in radar imagery and enabling deterministic detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
