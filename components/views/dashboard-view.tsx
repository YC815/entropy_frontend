"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { Shield, Brain, Zap, Activity, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardView() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 bg-stone-200 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="neo-card p-8 bg-red-50 border-neo-red text-neo-red">
        <div className="flex items-center gap-4 mb-4">
          <AlertCircle className="h-8 w-8" />
          <h2 className="text-2xl font-display">SYSTEM FAILURE</h2>
        </div>
        <p className="font-mono">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  const hpColor =
    data.integrity > 80
      ? "bg-neo-blue"
      : data.integrity > 50
      ? "bg-neo-yellow"
      : "bg-neo-red";
  const hpTextColor =
    data.integrity > 80
      ? "text-neo-blue"
      : data.integrity > 50
      ? "text-neo-yellow"
      : "text-neo-red";

  return (
    <div className="space-y-6">
      {/* 核心數據區 */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Integrity */}
        <div className="neo-card p-6 flex flex-col justify-between h-full relative overflow-hidden group">
          <div
            className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${hpTextColor}`}
          >
            <Shield className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-3 h-3 ${hpColor} border border-neo-black`}
              ></div>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                System Integrity
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-display">{data.integrity}</span>
              <span className="text-xl font-display text-stone-400">%</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-6 w-full border-2 border-neo-black bg-stone-200 relative">
              <div
                className={`h-full ${hpColor} border-r-2 border-neo-black transition-all duration-500`}
                style={{ width: `${data.integrity}%` }}
              />
            </div>
            <p className="font-mono text-xs text-stone-500 mt-2 text-right">
              STATUS: {data.status}
            </p>
          </div>
        </div>

        {/* Level */}
        <div className="neo-card p-6 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-stone-900">
            <Brain className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-stone-900 border border-neo-black"></div>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                User Level
              </h3>
            </div>
            <div className="text-5xl font-display">
              Lv.{Math.floor(data.user_info.level)}
              <span className="text-2xl text-stone-400">
                .{(data.user_info.level % 1).toFixed(2).substring(2)}
              </span>
            </div>
          </div>
          <div className="mt-6 font-mono text-sm border-t-2 border-dashed border-stone-300 pt-4 flex justify-between">
            <span className="text-stone-500">CURRENT XP</span>
            <span className="font-bold">{data.user_info.current_xp}</span>
          </div>
        </div>

        {/* Blackhole */}
        <div className="neo-card p-6 bg-neo-black text-neo-white flex flex-col justify-between h-full relative overflow-hidden border-neo-black">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-purple-500">
            <Zap className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-purple-500 border border-white animate-pulse"></div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-stone-300">
                Event Horizon
              </h3>
            </div>
            <div className="text-5xl font-display text-purple-400">
              {data.user_info.blackhole_days.toFixed(1)}
              <span className="text-xl text-purple-800 ml-2">DAYS</span>
            </div>
          </div>
          <div className="mt-6 font-mono text-xs text-stone-500 uppercase">
            Until total system collapse
          </div>
        </div>
      </section>

      {/* 壓力源 */}
      <section className="neo-card p-0 overflow-hidden">
        <div className="p-4 border-b-2 border-neo-black bg-stone-50 flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Stressors
          </h3>
          <span className="font-mono text-xs bg-neo-black text-neo-white px-2 py-1">
            COUNT: {data.stress_breakdown.length}
          </span>
        </div>
        <div className="p-0">
          {/* (這裡省略一點重複代碼，就是你原本的 map 列表) */}
          {data.stress_breakdown.length === 0 ? (
            <div className="p-8 text-center font-mono text-stone-400">
              NO ACTIVE STRESSORS DETECTED.
            </div>
          ) : (
            <div className="divide-y-2 divide-stone-100">
              {data.stress_breakdown.map((item, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between hover:bg-stone-50"
                >
                  <span className="font-bold">{item.task_title}</span>
                  <span className="font-mono text-neo-red font-bold">
                    -{item.stress_impact.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
