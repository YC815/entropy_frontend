"use client";

import { useMemo } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDashboard } from "@/hooks/use-dashboard";
import { useTasks } from "@/hooks/use-tasks";
import { Shield, Brain, Zap, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/components/task-card";
import { TaskStatus } from "@/types";
import { getTaskUrgency, getUrgencyStyles } from "@/lib/utils";

export function DashboardView() {
  const { data, isLoading, isError, error } = useDashboard();
  const { data: tasks = [] } = useTasks();

  // ============================================================
  // 計算 Staged Tasks (取代舊的 stress_breakdown)
  // ============================================================
  const stagedTasks = useMemo(
    () => tasks.filter((t) => t.status === TaskStatus.STAGED),
    [tasks]
  );

  // Sort by urgency (critical first)
  const sortedTasks = useMemo(() => {
    return [...stagedTasks].sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
      const urgA = getTaskUrgency(a.deadline);
      const urgB = getTaskUrgency(b.deadline);
      return urgencyOrder[urgA] - urgencyOrder[urgB];
    });
  }, [stagedTasks]);

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

      {/* ============================================================ */}
      {/* Strategic Map (取代 Active Stressors) */}
      {/* ============================================================ */}
      <section className="neo-card p-0 overflow-hidden">
        <div className="p-4 border-b-2 border-neo-black bg-stone-50 flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2">
            STRATEGIC MAP
          </h3>
          <span className="font-mono text-xs bg-neo-black text-neo-white px-2 py-1">
            COUNT: {stagedTasks.length}
          </span>
        </div>

        <div className="p-4">
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center font-mono text-stone-400">
              NO STAGED TASKS. DRAG TASKS FROM LOGISTICS VIEW.
            </div>
          ) : (
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    className={getUrgencyStyles(getTaskUrgency(task.deadline))}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </section>
    </div>
  );
}
