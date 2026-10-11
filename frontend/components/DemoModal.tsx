"use client";

import React, { useState } from "react";
import {
  X, CheckCircle2, ChevronRight, ChevronLeft, Satellite,
  Building2, Users, Navigation, Bot, FileText, Sparkles, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: "1. Historical Event Ingestion",
    tagline: "Assam Brahmaputra Basin Monsoon Deluge (June 2022)",
    icon: Satellite,
    details: [
      "Target Region: Barpeta, Chenga, Mandia & Morigaon flood basin",
      "Baseline Date: 2022-05-28 (Pre-monsoon normal baseline)",
      "Peak Deluge Date: 2022-06-20 (Persistent cloud cover during peak monsoon)",
      "Data Sources: Copernicus Sentinel-1 SAR GRD & Sentinel-2 MSI"
    ],
    actionText: "Proceed to Satellite Imagery Analysis",
    link: "/satellite"
  },
  {
    step: 2,
    title: "2. Cloud-Penetrating SAR Flood Detection",
    tagline: "Sentinel-1 C-Band Radar Specular Reflection Extraction",
    icon: Satellite,
    details: [
      "Optical imagery rendered unusable by heavy monsoonal cloud cover (98% cloud cover in Assam)",
      "Synthetic Aperture Radar (SAR) transmits microwave pulses (5.405 GHz) penetrating dense clouds & rain",
      "Specular reflection from smooth floodwater surfaces causes a dramatic backscatter drop (< -14.5 dB)",
      "Computed Flood Inundation Extent: 412.8 km² across lower Assam basin (94% confidence)"
    ],
    actionText: "Inspect Flood Mask & Inundation",
    link: "/flood-analysis"
  },
  {
    step: 3,
    title: "3. Infrastructure Exposure Intersections",
    tagline: "Geospatial Polygon Intersections with OpenStreetMap Assets",
    icon: Building2,
    details: [
      "Total Monitored Critical Facilities: 9 hospitals, schools, and relief shelters",
      "Directly Inundated: Kalgachia Model Hospital (100 beds), Chenga Primary Health Centre",
      "Potentially Compromised: Barpeta Civil Hospital (210m from floodwater edge)",
      "Road Corridors Intersected: 41.7 km of arterial highways and rural char feeder routes"
    ],
    actionText: "View Critical Facilities Status",
    link: "/infrastructure"
  },
  {
    step: 4,
    title: "4. Graph-Based Community Isolation Detection",
    tagline: "Core Differentiating Innovation: NetworkX Scenario Graph Exclusion",
    icon: Users,
    details: [
      "When phone lines and roads vanish, who is cut off?",
      "Built topological road graph connecting 10 settlements to 3 NDRF/SDRF rescue staging bases",
      "Subtracted all flood-severed road segments from the network graph",
      "Result: 5 communities and over 61,100 civilians have lost all dry mapped overland road access!",
      "Most severely cut off: Mandia Char Settlement (pop: 16,500) and Chenga Village (pop: 11,400)"
    ],
    actionText: "Examine Isolated Communities Graph",
    link: "/isolation"
  },
  {
    step: 5,
    title: "5. Explainable Rescue Prioritization & Routing",
    tagline: "Multi-Criteria Normalized Scoring with Tactical Disclaimers",
    icon: Navigation,
    details: [
      "Transparent Scoring: Population (30%), Isolation (30%), Flood Proximity (20%), Infrastructure (15%), Uncertainty (5%)",
      "Mandia Char ranked #1 Priority (Score: 94.6/100) — direct inundation + total road severance",
      "Chenga Village ranked #2 Priority (Score: 88.4/100) — culvert breaches on SH-4",
      "Preliminary Route Planning: Dijkstra & A* candidate routes calculated from Barpeta Staging Unit",
      "Strict safety disclaimers: Preliminary planning aid requiring ground/UAV verification"
    ],
    actionText: "Test Route Assessment Tool",
    link: "/routing"
  },
  {
    step: 6,
    title: "6. Gemini AI Disaster Copilot & Verified Reporting",
    tagline: "Tool-Grounded Multi-Modal Response & Audit-Ready Export",
    icon: Bot,
    details: [
      "Evidence-grounded: Copilot executes backend tools (`get_flood_analysis`, `get_isolated_settlements`)",
      "Strictly avoids hallucinating flood metrics or certifying unverified roads",
      "Multimodal analysis of uploaded field damage photos",
      "Instant export in 3 standard formats: Printable PDF Emergency Brief, Tabular CSV, Multi-layer GeoJSON"
    ],
    actionText: "Open AI Copilot & Generate Report",
    link: "/copilot"
  }
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIndex];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0B1728] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/20 border border-[#00D4FF]/40 flex items-center justify-center text-[#00D4FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wider text-slate-100 uppercase">
                Hackathon Presentation Mode
              </div>
              <div className="text-[11px] text-cyan-400 font-mono">
                Multimodal AI Hackathon 2026 — Track B Guided Walkthrough
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-6 gap-1 p-3 bg-slate-950/40 border-b border-slate-800/80">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "bg-[#00D4FF] shadow-sm shadow-cyan-400"
                  : idx < currentStepIndex
                  ? "bg-emerald-500"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#00D4FF] flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{current.title}</h3>
              <p className="text-xs text-[#00D4FF] font-medium mt-0.5">{current.tagline}</p>
            </div>
          </div>

          <div className="bg-[#102238] border border-slate-800/80 rounded-xl p-4 mb-5 space-y-2.5">
            {current.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{d}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
            <strong>Provenance:</strong> Precomputed analysis of authentic historical European Space Agency Sentinel-1 SAR and OpenStreetMap datasets for Barpeta, Assam (June 2022).
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <div className="flex items-center gap-3">
            <Link
              href={current.link}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 border border-cyan-500/40 text-[#00D4FF] text-xs font-semibold hover:bg-cyan-500/10 transition"
            >
              <span>{current.actionText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition cursor-pointer"
              >
                Complete Tour
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
