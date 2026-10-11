"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import DemoModal from "./DemoModal";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Landing page renders in standalone layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
        {children}
        <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      </div>
    );
  }

  // Full-bleed map layouts for command, routing, and isolation
  const isMapCentric = pathname === "/command" || pathname === "/routing" || pathname === "/isolation";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1220] text-slate-100 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopNav onLaunchDemo={() => setDemoOpen(true)} />
        <main className={`flex-1 overflow-y-auto ${isMapCentric ? "p-3" : "p-4 sm:p-6"}`}>
          {children}
        </main>
      </div>
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
