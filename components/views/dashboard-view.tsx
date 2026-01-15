"use client";

import { useMemo, useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useTasks, useCompleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { Shield, Brain, Zap, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TypeSelector } from "@/components/type-selector";
import { TaskStatus } from "@/types";
import { cn, getTaskUrgency, getUrgencyShadow, compareByUrgency } from "@/lib/utils";

export function DashboardView() {
  const { data, isLoading, isError, error } = useDashboard();
  const { data: tasks = [] } = useTasks();
  const completeMutation = useCompleteTask();
  const updateMutation = useUpdateTask();
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!showCompleted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCompleted(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCompleted]);

  // ============================================================
  // 計算 Staged Tasks (取代舊的 stress_breakdown)
  // ============================================================
  const stagedTasks = useMemo(
    () => tasks.filter((t) => t.status === TaskStatus.STAGED),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === TaskStatus.COMPLETED),
    [tasks]
  );

  // Sort by urgency (critical first)
  const sortedTasks = useMemo(() => {
    return [...stagedTasks].sort((a, b) => compareByUrgency(a.deadline, b.deadline));
  }, [stagedTasks]);

  const sortedCompletedTasks = useMemo(() => {
    return [...completedTasks].sort((a, b) => {
      const timeA = new Date(a.updated_at).getTime();
      const timeB = new Date(b.updated_at).getTime();
      return timeB - timeA;
    });
  }, [completedTasks]);

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No Deadline";
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) return "No Deadline";
    return parsed.toLocaleDateString();
  };

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
        <div className="p-4 border-b-2 border-neo-black bg-stone-50 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl flex items-center gap-2">
            STRATEGIC MAP
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-neo-black text-neo-white px-2 py-1">
              COUNT: {stagedTasks.length}
            </span>
            <button
              type="button"
              className="neo-button px-2 py-1 text-xs font-mono"
              onClick={() => setShowCompleted(true)}
            >
              COMPLETED: {completedTasks.length}
            </button>
          </div>
        </div>

        <div className="p-4">
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center font-mono text-stone-400">
              NO STAGED TASKS. DRAG TASKS FROM LOGISTICS VIEW.
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedTasks.map((task) => {
                const urgency = getTaskUrgency(task.deadline);
                return (
                  <li
                    key={task.id}
                    className={cn(
                      "neo-card p-3 flex items-start gap-3",
                      getUrgencyShadow(urgency)
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-neo-black"
                      checked={false}
                      onChange={(event) => {
                        if (event.target.checked) {
                          completeMutation.mutate(task.id);
                        }
                      }}
                      disabled={completeMutation.isPending}
                      aria-label={`Complete ${task.title}`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-display text-sm">
                          {task.title}
                        </div>
                        <span className="text-[10px] font-mono uppercase text-stone-500">
                          {urgency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <TypeSelector taskId={task.id} currentType={task.type} />
                        <Badge variant="outline" className="font-mono text-xs">
                          D{task.difficulty}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {task.xp_value} XP
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatDeadline(task.deadline)}
                        </Badge>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {showCompleted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowCompleted(false)}
        >
          <div
            className="neo-card w-full max-w-2xl bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-neo-black pb-3">
              <h4 className="font-display text-lg">COMPLETED TASKS</h4>
              <button
                type="button"
                className="neo-button px-2 py-1 text-xs font-mono"
                onClick={() => setShowCompleted(false)}
              >
                CLOSE
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
              {sortedCompletedTasks.length === 0 ? (
                <div className="py-10 text-center font-mono text-stone-400">
                  NO COMPLETED TASKS YET.
                </div>
              ) : (
                <ul className="space-y-2">
                  {sortedCompletedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="neo-card p-3 flex items-start gap-3 bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-neo-black"
                        checked={true}
                        readOnly
                        aria-label={`${task.title} completed`}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="font-display text-sm">
                          {task.title}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <TypeSelector taskId={task.id} currentType={task.type} />
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            D{task.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {task.xp_value} XP
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {formatDeadline(task.deadline)}
                          </Badge>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="neo-button px-2 py-1 text-xs font-mono"
                        onClick={() =>
                          updateMutation.mutate({
                            id: task.id,
                            status: TaskStatus.STAGED,
                          })
                        }
                        disabled={updateMutation.isPending}
                      >
                        MOVE BACK
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
