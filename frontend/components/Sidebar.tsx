"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, Satellite, Building2, Users, Navigation,
  Bot, History, FileText, Settings, Radio, Activity,
  Layers, MapPin, Globe, ChevronRight
} from "lucide-react";

interface NavGroup {
  group: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Operations",
    items: [
      { name: "Command Center", href: "/command", icon: Activity },
      { name: "Community Isolation", href: "/isolation", icon: Users, badge: "Graph" },
      { name: "Rescue Route Planner", href: "/routing", icon: Navigation },
    ]
  },
  {
    group: "Geospatial Intelligence",
    items: [
      { name: "Satellite Radar Viewer", href: "/satellite", icon: Satellite, badge: "S-1 SAR" },
      { name: "Flood Extent Analysis", href: "/flood-analysis", icon: Layers },
      { name: "Critical Infrastructure", href: "/infrastructure", icon: Building2 },
    ]
  },
  {
    group: "Response & Planning",
    items: [
      { name: "Disaster Copilot", href: "/copilot", icon: Bot, badge: "Gemini" },
      { name: "Historical Archive", href: "/events", icon: History },
      { name: "Assessment Reports", href: "/reports", icon: FileText },
    ]
  },
  {
    group: "Settings",
    items: [
      { name: "Priority Weights", href: "/settings", icon: Settings },
      { name: "Product Overview", href: "/", icon: Shield },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111827] border-r border-[#334155] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#334155] bg-[#0E1726]">
          <Link href="/command" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                FloodGuard <span className="text-[#2563EB] font-semibold text-xs px-1.5 py-0.5 rounded bg-[#2563EB]/15 border border-[#2563EB]/30">AI</span>
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                Satellite Rescue Intelligence
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#2563EB] text-white font-semibold shadow-sm"
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#94A3B8]"}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#1E293B] text-[#94A3B8] border border-[#334155]"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Operational Context Footer */}
        <div className="p-3.5 border-t border-[#334155] bg-[#0E1726] text-xs">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Assam 2022 Benchmark
            </span>
            <span className="font-mono text-[10px] text-slate-500">v2.0</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-1 font-mono">
            Barpeta Basin · Sentinel-1 SAR
          </div>
        </div>
      </div>
    </aside>
  );
}
