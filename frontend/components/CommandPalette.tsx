"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Shield, Satellite, Building2, Users, Navigation,
  Bot, History, FileText, Settings, Camera, Database,
  ArrowRight, X, PlayCircle, MapPin, Sparkles
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Action" | "AOI Location";
  icon: any;
  href?: string;
  action?: () => void;
  keywords: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo?: () => void;
}

export default function CommandPalette({ isOpen, onClose, onLaunchDemo }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // toggle logic can be handled in parent
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const COMMANDS: CommandItem[] = [
    {
      id: "cmd-command",
      title: "Command Center — Real-time GIS Situation Map",
      category: "Navigation",
      icon: Shield,
      href: "/command",
      keywords: "gis map command center overview"
    },
    {
      id: "cmd-satellite",
      title: "Satellite Analysis — Sentinel-1 SAR Dual-Date Telemetry",
      category: "Navigation",
      icon: Satellite,
      href: "/satellite",
      keywords: "sentinel radar sar backscatter change detection copernicus"
    },
    {
      id: "cmd-flood",
      title: "Flood Mapping — 412.8 km² Inundation Polygons",
      category: "Navigation",
      icon: Satellite,
      href: "/flood-analysis",
      keywords: "flood area extent mask ndwi radar"
    },
    {
      id: "cmd-infra",
      title: "Critical Infrastructure — Hospitals, Bridges & Road Status",
      category: "Navigation",
      icon: Building2,
      href: "/infrastructure",
      keywords: "hospitals bridges shelters roads sh-4 assets"
    },
    {
      id: "cmd-isolation",
      title: "Community Isolation — Graph Theory Disconnection Engine",
      category: "Navigation",
      icon: Users,
      href: "/isolation",
      keywords: "networkx isolated communities cut off population"
    },
    {
      id: "cmd-routing",
      title: "Rescue Route Planner — Dijkstra & A* Candidate Paths",
      category: "Navigation",
      icon: Navigation,
      href: "/routing",
      keywords: "routes routing convoy dijkstra a star rescue"
    },
    {
      id: "cmd-incidents",
      title: "Incident Reports — Multimodal Field Photo & Observation Intake",
      category: "Navigation",
      icon: Camera,
      href: "/incidents",
      keywords: "field photo observations reports volunteers ndrf ground"
    },
    {
      id: "cmd-copilot",
      title: "AI Copilot — Evidence-Grounded Gemini Command Assistant",
      category: "Navigation",
      icon: Bot,
      href: "/copilot",
      keywords: "gemini chat copilot ai assistant question briefing"
    },
    {
      id: "cmd-events",
      title: "Historical Events — June 2022 Assam Floods Benchmark",
      category: "Navigation",
      icon: History,
      href: "/events",
      keywords: "assam barpeta 2022 archive historical disaster"
    },
    {
      id: "cmd-data-sources",
      title: "Data Sources — Copernicus STAC & OpenStreetMap Provenance",
      category: "Navigation",
      icon: Database,
      href: "/data-sources",
      keywords: "data sources provenance esa sentinel osm asdma ndrf"
    },
    {
      id: "cmd-reports",
      title: "Assessment Reports — Printable Briefs, CSV & GeoJSON",
      category: "Navigation",
      icon: FileText,
      href: "/reports",
      keywords: "export reports pdf csv geojson dossier"
    },
    {
      id: "cmd-settings",
      title: "Priority Weights & Settings — Multi-Criteria Customizer",
      category: "Navigation",
      icon: Settings,
      href: "/settings",
      keywords: "settings weights population isolation severity configuration"
    },
    {
      id: "action-demo",
      title: "Launch Historical Flood Demo Walkthrough",
      category: "Action",
      icon: PlayCircle,
      action: () => {
        if (onLaunchDemo) onLaunchDemo();
      },
      keywords: "tour walkthrough demo presentation 6 phase"
    },
    {
      id: "loc-barpeta",
      title: "Jump to Barpeta District HQ",
      category: "AOI Location",
      icon: MapPin,
      href: "/command",
      keywords: "barpeta hq center coordinates"
    },
    {
      id: "loc-mandia",
      title: "Jump to Mandia Char Sector (Priority 1 Critical Cut-off)",
      category: "AOI Location",
      icon: MapPin,
      href: "/command",
      keywords: "mandia char priority isolated"
    }
  ];

  const filtered = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (cmd: CommandItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#334155] bg-[#1E293B]/70">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, location, or module name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-[#0F172A] border border-[#334155] rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#1E293B]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching modules or actions found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs hover:bg-[#1E293B] group transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#1E293B] group-hover:bg-[#2563EB] text-slate-300 group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-slate-200 group-hover:text-white truncate">
                          {cmd.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cmd.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 border-t border-[#334155] bg-[#0B1220] flex items-center justify-between text-[11px] text-slate-400">
          <span>FloodGuard AI 3.0 Operational Palette</span>
          <span className="font-mono">Press ↵ to select</span>
        </div>
      </div>
    </div>
  );
}
