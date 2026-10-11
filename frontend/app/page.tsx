"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Satellite, ShieldAlert, Users, Radio, Navigation, ArrowRight,
  PlayCircle, CheckCircle2, ChevronRight, Activity, Cpu, Sparkles,
  Building2, MapPin, Eye, FileText, Compass, Network, ShieldCheck
} from "lucide-react";
import DemoModal from "@/components/DemoModal";

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                FloodGuard <span className="text-blue-400 font-semibold">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Satellite Rescue Intelligence
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/command" className="hover:text-white transition">Command Center</Link>
            <Link href="/satellite" className="hover:text-white transition">Satellite Engine</Link>
            <Link href="/isolation" className="hover:text-white transition">Community Isolation</Link>
            <Link href="/routing" className="hover:text-white transition">Rescue Routes</Link>
            <Link href="/copilot" className="hover:text-white transition">AI Copilot</Link>
            <Link href="/reports" className="hover:text-white transition">Reports</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Watch Demo</span>
            </button>

            <Link
              href="/command"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs font-medium mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Operational Geospatial Decision Support for First Responders</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12] mb-6">
              Detect flood extents from space.<br />
              Identify isolated settlements.<br />
              <span className="text-blue-400">Direct life-saving evacuations.</span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mb-8">
              When surface telemetry, cellular towers, and roadways fail during extreme monsoon events, FloodGuard AI processes cloud-penetrating Sentinel-1 SAR imagery and road network topology to locate marooned populations within minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/command"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Enter Command Center</span>
              </Link>

              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-blue-400" />
                <span>Launch Assam 2022 Benchmark Demo</span>
              </button>

              <Link
                href="/events"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition"
              >
                <span>Browse Historical Archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Metric Highlights Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800/80 pt-8">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400">Validated Inundation</div>
              <div className="text-2xl font-bold text-white mt-1">412.8 km²</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Barpeta & Mandia basin</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400">Isolated Population</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">61,100</div>
              <div className="text-[11px] text-slate-400 mt-0.5">5 severed char habitations</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400">Submerged Highway</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">41.7 km</div>
              <div className="text-[11px] text-slate-400 mt-0.5">OSM road network intersections</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400">SAR Resolution</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">10 Meter</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Sentinel-1 C-band radar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Operational Capabilities */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Mission Capabilities
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Purpose-built for disaster response commanders, emergency operations centers, and first responder coordinators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Capability 1 */}
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Satellite className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">1. All-Weather SAR Detection</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dual-date Sentinel-1 SAR change detection eliminates cloud obscuration. Computes backscatter drops below -14.5 dB to extract water masks at 10-meter pixel resolution.
                </p>
              </div>
              <Link href="/satellite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 mt-6 hover:text-blue-300 transition">
                <span>Inspect SAR Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">2. Network Isolation Analytics</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transforms road networks into topological graphs, clips submerged segments against flood polygons, and detects habitations where all dry overland routes are completely cut off.
                </p>
              </div>
              <Link href="/isolation" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 mt-6 hover:text-amber-300 transition">
                <span>View Isolation Diagnostics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">3. Explainable Prioritization & Routing</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ranks isolated communities using weighted multi-criteria decision models. Grounded Gemini AI Copilot explains risk factors while the route engine charts obstacle-free evacuation paths.
                </p>
              </div>
              <Link href="/copilot" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-6 hover:text-emerald-300 transition">
                <span>Consult Grounded Copilot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Process */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Operational Intelligence Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end processing from raw satellite downlink to incident command briefing.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: "01", title: "SAR Observation", desc: "Sentinel-1 C-band radar penetrates persistent cloud cover" },
              { step: "02", title: "Water Extraction", desc: "Backscatter thresholding creates high-precision inundation mask" },
              { step: "03", title: "Asset Intersection", desc: "Spatial overlay against roads, bridges, and hospitals" },
              { step: "04", title: "Graph Severance", desc: "NetworkX connectivity model isolates severed habitations" },
              { step: "05", title: "Multi-factor Scoring", desc: "Weighted risk prioritization highlights critical targets" },
              { step: "06", title: "Tactical Dispatch", desc: "Safe evacuation routing and certified PDF/CSV/GeoJSON export" },
            ].map((st) => (
              <div key={st.step} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-blue-400 mb-2">{st.step}</div>
                  <div className="text-xs font-semibold text-white mb-1.5">{st.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Event Callout */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-4">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Certified Benchmark: Assam Brahmaputra Flooding (June 2022)</span>
          </div>

          <p className="text-base text-slate-300 leading-relaxed mb-6">
            Pre-monsoon cloudbursts triggered severe flooding across 32 districts in Assam, isolating 5.4 million people. FloodGuard AI accurately detects 412.8 km² inundation across Barpeta and Mandia, locating 61,100 cut-off civilians in 5 riverine char communities with zero overland exit corridors.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/command"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
            >
              Open Command Center
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              Run Interactive Demo Walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300">FloodGuard AI</span>
            <span>— Satellite Rescue Intelligence</span>
          </div>
          <div className="text-slate-400">
            Powered by Copernicus Sentinel-1, OpenStreetMap, NetworkX, and Gemini AI
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
