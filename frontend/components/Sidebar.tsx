"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Satellite, ShieldAlert, Activity, Navigation, Radio,
  Building2, Users, Bot, History, FileText, Settings,
  RadioTower, Sparkles, ChevronRight, Clock, Globe,
  Shield, Compass, Waves
} from "lucide-react";

interface NavGroup {
  group: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "OPERATIONS",
    items: [
      { name: "Command Center", href: "/command", icon: ShieldAlert, highlight: true },
      { name: "Isolated Communities", href: "/isolation", icon: Users, badge: "CORE", badgeColor: "bg-red-500/20 text-red-400 border-red-500/30" },
      { name: "Rescue Route Planner", href: "/routing", icon: Navigation, badge: "A*", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    ]
  },
  {
    group: "SPACE SENSING",
    items: [
      { name: "SAR Radar Split", href: "/satellite", icon: Satellite, badge: "S-1", badgeColor: "bg-cyan-500/20 text-[#00E5FF] border-cyan-500/30" },
      { name: "Flood Physics & Mask", href: "/flood-analysis", icon: RadioTower },
      { name: "Critical Infrastructure", href: "/infrastructure", icon: Building2 },
    ]
  },
  {
    group: "INTELLIGENCE & AI",
    items: [
      { name: "Disaster Copilot", href: "/copilot", icon: Bot, badge: "GEMINI", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { name: "Historical Archive", href: "/events", icon: History },
      { name: "Sitrep Briefings", href: "/reports", icon: FileText },
    ]
  },
  {
    group: "SYSTEM",
    items: [
      { name: "Landing Overview", href: "/", icon: Activity },
      { name: "Scoring Weights", href: "/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState({ ist: "--:--:--", utc: "--:--:--" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr({
        ist: now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" }) + " IST",
        utc: now.toLocaleTimeString("en-GB", { timeZone: "UTC" }) + " UTC"
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 bg-[#07111F]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0A1628]/60">
          <Link href="/command" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00E5FF] via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Radio className="w-4 h-4 text-slate-950 font-black animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-[#00E5FF] opacity-30 blur-sm group-hover:opacity-60 transition" />
            </div>
            <div>
              <div className="font-black text-sm tracking-widest text-slate-100 flex items-center gap-1.5">
                FLOODGUARD <span className="text-[#00E5FF]">AI</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono tracking-wider">
                SPACE RESCUE INTEL
              </div>
            </div>
          </Link>
        </div>

        {/* Operational Clock & Uplink Bar */}
        <div className="px-4 py-2 border-b border-slate-800/60 bg-[#050B14]/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">{timeStr.ist}</span>
          </div>
          <span className="text-slate-500">{timeStr.utc}</span>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-2 text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)] font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#00E5FF] rounded-r-full shadow-[0_0_8px_#00E5FF]" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#00E5FF]" : "text-slate-400 group-hover:text-slate-200"}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 text-[8px] font-mono font-bold rounded border ${item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mission Status Widget */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0A1628]/80 m-2 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#00E5FF]" />
              Track B: Space AI
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Assam Brahmaputra Basin 2022 Benchmark
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>COPERNICUS S-1</span>
            <span>OSM VECTORS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
