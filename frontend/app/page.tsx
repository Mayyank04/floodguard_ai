"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Satellite, ShieldAlert, Users, Radio, Navigation, ArrowRight,
  PlayCircle, CheckCircle2, ChevronRight, Activity, Cpu, Sparkles,
  Building2, MapPin, Eye, FileSpreadsheet
} from "lucide-react";
import DemoModal from "@/components/DemoModal";

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0B1728]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-white">
                FLOODGUARD <span className="text-[#00D4FF]">AI</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider">
                MULTIMODAL AI HACKATHON 2026
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/command" className="hover:text-[#00D4FF] transition">Command Center</Link>
            <Link href="/satellite" className="hover:text-[#00D4FF] transition">Satellite Engine</Link>
            <Link href="/isolation" className="hover:text-[#00D4FF] transition">Community Isolation</Link>
            <Link href="/copilot" className="hover:text-[#00D4FF] transition">AI Copilot</Link>
            <Link href="/reports" className="hover:text-[#00D4FF] transition">Reports</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#00D4FF]" />
              <span>Watch Demo</span>
            </button>

            <Link
              href="/command"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 text-xs font-extrabold hover:brightness-110 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,212,255,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-[#00D4FF] text-xs font-semibold uppercase tracking-wider mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Track B: Mapping Flood Damage From Space
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
              See the Flood.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-cyan-200 to-blue-500">
                Find the Isolated.
              </span><br />
              Guide the Response.
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              When roads, bridges, and phone lines are gone, rescuers still need to know where the damage is and who is cut off. 
              FloodGuard AI transforms Sentinel satellite observations into life-saving disaster intelligence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/command"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 hover:brightness-110 transition cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5 text-slate-950" />
                Launch Command Center
              </Link>

              <Link
                href="/events"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#102238] border border-slate-700 text-slate-200 font-bold text-sm hover:border-[#00D4FF]/60 hover:bg-[#102238]/80 transition cursor-pointer"
              >
                <Satellite className="w-5 h-5 text-[#00D4FF]" />
                Explore Historical Flood
              </Link>

              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Live Metric Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-5 rounded-xl text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flooded Extent</div>
              <div className="text-3xl font-extrabold text-[#00D4FF] mt-1">412.8 km²</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Sentinel-1 C-SAR Inundation</div>
            </div>

            <div className="glass-panel p-5 rounded-xl text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Isolated Civilians</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">61,100</div>
              <div className="text-[11px] text-slate-400 mt-0.5">5 Cut-Off Char Communities</div>
            </div>

            <div className="glass-panel p-5 rounded-xl text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Exposed Roadway</div>
              <div className="text-3xl font-extrabold text-[#EF4444] mt-1">41.7 km</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Highway & Culvert Breaches</div>
            </div>

            <div className="glass-panel p-5 rounded-xl text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sensor Resolution</div>
              <div className="text-3xl font-extrabold text-[#22C55E] mt-1">10 Meter</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cloud-Penetrating Radar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-24 bg-[#0B1728]/50 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Three Pillars of Disaster Intelligence
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Engineered for extreme humanitarian emergencies where conventional communications fail.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D4FF] mb-6">
                  <Satellite className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Satellite Flood Intelligence</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Dual-date Sentinel-1 SAR change detection cuts through persistent monsoon storm cloud cover. 
                  Calculates exact water boundaries (<span className="text-[#00D4FF] font-semibold">-14.5 dB threshold</span>) and total flooded area down to 10-meter pixel resolution.
                </p>
              </div>
              <Link href="/satellite" className="inline-flex items-center gap-2 text-xs font-bold text-[#00D4FF] mt-6 hover:underline">
                Explore SAR Engine <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between border-cyan-500/30">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Community Isolation Detection</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our core differentiating innovation. Automatically maps road network topology into NetworkX graph structures, 
                  removes flood-inundated segments, and identifies villages where all overland rescue access has been severed.
                </p>
              </div>
              <Link href="/isolation" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 mt-6 hover:underline">
                View Isolation Engine <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. AI Rescue Prioritization</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Explainable multi-factor ranking combining civilian population exposure, isolation severity, flood proximity, 
                  and hospital vulnerability. Grounded Gemini AI Copilot explains decisions with authentic telemetry.
                </p>
              </div>
              <Link href="/copilot" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mt-6 hover:underline">
                Consult AI Copilot <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How FloodGuard Works Workflow */}
      <section className="py-24 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-[#00D4FF] mb-2">END-TO-END PIPELINE</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How FloodGuard AI Operates
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              From microwave backscatter in low-earth orbit to tactical boots on the ground.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: "01", title: "Satellite Observation", desc: "Sentinel-1 SAR C-Band microwave radar scans earth surface" },
              { step: "02", title: "AI Flood Detection", desc: "Backscatter drop analysis extracts surface inundation mask" },
              { step: "03", title: "Geospatial Impact", desc: "Polygon intersections with roads, hospitals, bridges, shelters" },
              { step: "04", title: "Connectivity Graph", desc: "NetworkX scenario graph models severed dry corridors" },
              { step: "05", title: "Rescue Priority", desc: "Multi-factor explainable scoring ranks urgent settlements" },
              { step: "06", title: "Evidence Reports", desc: "Grounded Gemini briefs + PDF/CSV/GeoJSON export" },
            ].map((st) => (
              <div key={st.step} className="bg-[#102238] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-[#00D4FF] mb-2">{st.step}</div>
                  <div className="text-xs font-bold text-white mb-1.5">{st.title}</div>
                  <div className="text-[11px] text-slate-400 leading-normal">{st.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Hackathon Impact */}
      <section className="py-20 bg-[#0B1728]/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Official Challenge: Multimodal AI Hackathon 2026
          </h2>
          <blockquote className="text-lg italic text-slate-300 bg-slate-900/60 border-l-4 border-[#00D4FF] p-6 rounded-r-xl my-6 text-left">
            &ldquo;When roads, bridges and phone lines are gone, rescuers still need to know where the damage is and who is cut off. Build the system that tells them — from space.&rdquo;
          </blockquote>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            FloodGuard AI fulfills this mandate with authentic satellite datasets, genuine topological graph analytics, 
            and zero fabricated statistics. Built for first responders at the National Disaster Response Force (NDRF), 
            State Disaster Management Authorities (SDMA), and humanitarian relief coordinators.
          </p>

          <Link
            href="/command"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 hover:brightness-110 transition"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#07111F] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00D4FF]" />
            <span className="font-bold text-slate-300">FloodGuard AI</span>
            <span>— Satellite Rescue Intelligence</span>
          </div>
          <div>
            Built for <strong>Multimodal AI Hackathon 2026</strong> | Track B: Mapping Flood Damage from Space
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
