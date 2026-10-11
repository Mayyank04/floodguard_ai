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

  // For landing page, render full screen with custom header
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col">
        {children}
        <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07111F] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNav onLaunchDemo={() => setDemoOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
