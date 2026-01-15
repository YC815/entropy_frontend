"use client";

import { useState } from "react";
import { NeoTabs } from "@/components/neo-tabs";
import { LogisticsView } from "@/components/views/logistics-view";
import { DashboardView } from "@/components/views/dashboard-view";

type Tab = "logistics" | "dashboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* 1. Header */}
      <header className="px-8 pt-8 pb-4 flex justify-between items-end bg-stone-100">
        <div>
          <h1 className="text-4xl font-display tracking-tighter">EntroPy</h1>
          <div className="flex items-center gap-3">
            <span className="bg-neo-black text-neo-white px-2 py-0.5 text-xs font-mono font-bold">
              v1.0.0
            </span>
            <p className="text-stone-500 font-mono text-xs uppercase hidden md:block">
              Strategic Life Management System
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-mono font-bold text-green-600">
          SYSTEM ONLINE
        </div>
      </header>

      {/* 2. Tab Switcher */}
      <div className="sticky top-0 z-10 px-8">
        <NeoTabs currentTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 3. Main Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full pb-12">
        {activeTab === "logistics" && <LogisticsView />}
        {activeTab === "dashboard" && <DashboardView />}
      </main>
    </div>
  );
}
