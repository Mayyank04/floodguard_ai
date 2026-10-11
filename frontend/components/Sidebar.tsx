"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Satellite, ShieldAlert, Activity, Navigation, Radio,
  Building2, Users, Bot, History, FileText, Settings,
  RadioTower, Sparkles, ExternalLink
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Landing Overview", href: "/", icon: Activity },
  { name: "Command Center", href: "/command", icon: ShieldAlert, highlight: true },
  { name: "Satellite Intelligence", href: "/satellite", icon: Satellite },
  { name: "Flood Detection", href: "/flood-analysis", icon: RadioTower },
  { name: "Infrastructure", href: "/infrastructure", icon: Building2 },
  { name: "Isolated Communities", href: "/isolation", icon: Users, badge: "CORE" },
  { name: "Rescue Planning", href: "/routing", icon: Navigation },
  { name: "AI Disaster Copilot", href: "/copilot", icon: Bot, badge: "AI" },
  { name: "Historical Events", href: "/events", icon: History },
  { name: "Disaster Reports", href: "/reports", icon: FileText },
  { name: "Settings & Weights", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0B1728] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#00D4FF] to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-slate-950 font-black animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5">
              FLOODGUARD <span className="text-[#00D4FF]">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              SATELLITE RESCUE INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#00D4FF]" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-200">System Ready</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.0-2026</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Track B: Mapping Flood Damage from Space
        </div>
      </div>
    </aside>
  );
}
