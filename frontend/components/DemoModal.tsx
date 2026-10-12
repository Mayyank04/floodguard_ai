"use client";

import React, { useState } from "react";
import {
  X, CheckCircle2, ChevronRight, ChevronLeft, Satellite,
  Building2, Users, Navigation, Bot, FileText, ExternalLink,
  ShieldCheck, Layers, Radio
} from "lucide-react";
import Link from "next/link";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: "Step 1: Load Assam Historical Flood Event",
    tagline: "Assam Brahmaputra Basin Deluge (June 2022 Benchmark)",
    icon: Satellite,
    details: [
      "Target Region: Barpeta, Mandia, Chenga & Morigaon corridor",
      "Observation Baseline: 2022-05-28 (Pre-monsoon dry season baseline)",
      "Peak Flood Observation: 2022-06-20 (Peak river overflow and deluge)",
      "Data Provenance: European Space Agency Copernicus Open Access Hub"
    ],
    actionText: "View Event Overview",
    link: "/events"
  },
  {
    step: 2,
    title: "Step 2: Real Satellite Observations Ingestion",
    tagline: "Sentinel-1 C-SAR IW GRDH Cloud-Penetrating Radar",
    icon: Satellite,
    details: [
      "Heavy monsoonal cloud cover (>98%) rendered optical sensors blinded",
      "Sentinel-1 C-Band radar (5.405 GHz) penetrated dense clouds and torrential precipitation",
      "Geographically aligned 10m spatial resolution VV+VH polarization scenes",
      "Dual-date SAR difference confirms smooth water specular reflection"
    ],
    actionText: "Inspect Satellite Radar Split",
    link: "/satellite"
  },
  {
    step: 3,
    title: "Step 3: Extract Flood Inundation Extent",
    tagline: "Backscatter Thresholding (< -14.5 dB) with 3x3 Lee Speckle Filter",
    icon: Radio,
    details: [
      "Specular backscatter drop identifies open floodwater across lower Assam basin",
      "Calculated Inundated Area: 412.80 km² across the Barpeta watershed",
      "Cleaned polygon geometries with topological validity (Shapely unary_union)",
      "Quality Indicator: ESA Copernicus QA Passed (Radiometric Calibration & Speckle Filtered)"
    ],
    actionText: "Examine Flood Mask & Physics",
    link: "/flood-analysis"
  },
  {
    step: 4,
    title: "Step 4: Highlight Exposed Roads & Critical Infrastructure",
    tagline: "Geospatial Polygon Intersections with OpenStreetMap Lifeline Vectors",
    icon: Building2,
    details: [
      "10 Monitored Healthcare and Shelter facilities cross-referenced",
      "Compromised: Mandia PHC & Kalgachia Model Hospital",
      "Severed River Crossing: Beki River Bridge abutment inundated",
      "47.4 km of mapped highway and feeder road network submerged"
    ],
    actionText: "Inspect Infrastructure Lifelines",
    link: "/infrastructure"
  },
  {
    step: 5,
    title: "Step 5: Analyze Potentially Isolated Communities",
    tagline: "Topological NetworkX Graph Scenario Exclusions",
    icon: Users,
    details: [
      "Evaluates reachability from NDRF/SDRF emergency staging bases",
      "Subtracted all flood-severed road segments from the network graph",
      "Identified 4 completely cut-off riverine settlements holding 56,700 civilians",
      "Highest urgency: Mandia Char Settlement (pop: 16,500) with zero dry road access"
    ],
    actionText: "Open Community Isolation Engine",
    link: "/isolation"
  },
  {
    step: 6,
    title: "Step 6: Calculate Candidate Rescue Routes",
    tagline: "Dijkstra & A* Shortest-Path Planning with Safety Notices",
    icon: Navigation,
    details: [
      "Evaluates candidate paths from NDRF Barpeta Staging Unit to target settlements",
      "Mandia Char transit distance: 21.56 km (~86 min transit time)",
      "Classified as `flood_exposed_candidate_route` (boat/amphibious transport required)",
      "Includes mandatory safety warning: Preliminary planning aid requiring ground verification"
    ],
    actionText: "Open Rescue Route Planner",
    link: "/routing"
  },
  {
    step: 7,
    title: "Step 7: Ask Gemini Copilot for Grounded Summary",
    tagline: "Tool-Calling Multi-Modal AI with Zero Hallucination Guardrails",
    icon: Bot,
    details: [
      "Copilot executes backend tools: `get_isolated_settlements()`, `get_flood_extent()`",
      "Cites exact verifiable database entities rather than fabricated numbers",
      "Multi-modal field photo analysis for high-water mark damage assessment",
      "Zero ungrounded casualty or road safety claims"
    ],
    actionText: "Chat with Disaster Copilot",
    link: "/copilot"
  },
  {
    step: 8,
    title: "Step 8: Generate Disaster Assessment Report",
    tagline: "Audit-Ready Situation Reports in Printable PDF/HTML, CSV & GeoJSON",
    icon: FileText,
    details: [
      "Generates standardized disaster situation report (Sitrep)",
      "Includes executive summary, satellite provenance, facility damage, and priority matrix",
      "Instant one-click exports in PDF/HTML, Tabular CSV, and Unified GeoJSON",
      "Immediate operational dispatch for district emergency operations centers"
    ],
    actionText: "Generate Sitrep Report",
    link: "/reports"
  }
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = DEMO_STEPS[currentStepIndex];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#172033] border border-[#334155] rounded-xl shadow-2xl overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#334155] bg-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Historical Flood Demonstration Tour
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                Multimodal AI Hackathon 2026 — 8-Step Verification Workflow
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#334155] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-8 gap-1 p-2 bg-[#0B1220] border-b border-[#334155]">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? "bg-[#2563EB]"
                  : idx < currentStepIndex
                  ? "bg-[#10B981]"
                  : "bg-[#334155]"
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#2563EB] flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{current.title}</h3>
              <p className="text-xs text-[#2563EB] font-medium mt-0.5">{current.tagline}</p>
            </div>
          </div>

          <div className="bg-[#0B1220] border border-[#334155] rounded-lg p-3.5 space-y-2">
            {current.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <span>{d}</span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#334155] text-[11px] text-[#94A3B8]">
            <strong>Data Provenance:</strong> Precomputed historical analysis from European Space Agency Sentinel-1 SAR and OpenStreetMap datasets for Barpeta, Assam (June 2022).
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#334155] bg-[#1E293B] flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={current.link}
              onClick={onClose}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <span>{current.actionText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary text-xs bg-[#10B981] hover:bg-[#059669]"
              >
                <span>Finish Walkthrough</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
