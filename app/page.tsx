"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { NeoTabs } from "@/components/neo-tabs";
import { LogisticsView } from "@/components/views/logistics-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { RuntimeView } from "@/components/views/runtime-view";
import { GlobalDock } from "@/components/global-dock";
import { CompactTaskCard } from "@/components/compact-task-card";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Task, TaskStatus, TaskType } from "@/types";
import { toast } from "sonner";

type Tab = "logistics" | "dashboard" | "runtime";

export default function Home() {
  // 預設停在 Logistics (因為你要先輸入任務) 或是 Dashboard (看狀態)
  // 這裡我設為 dashboard 讓你先看到熟悉的畫面，你可以改成 "logistics"
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [time, setTime] = useState<string>("");

  // ============================================================
  // DnD State (提升到頂層)
  // ============================================================
  const { data: tasks = [] } = useTasks();
  const updateMutation = useUpdateTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Dock fullness check
  const dockedTasks = useMemo(
    () => tasks.filter((t) => t.status === TaskStatus.IN_DOCK),
    [tasks]
  );
  const isDockFull = dockedTasks.length >= 3;

  // ============================================================
  // Zone Mapping Helper (must be before handleDragEnd)
  // ============================================================
  const getUpdatesForZone = useCallback((zone: string) => {
    const zoneMap: Record<
      string,
      Partial<{ status: TaskStatus; type: TaskType }>
    > = {
      school: { status: TaskStatus.STAGED, type: TaskType.SCHOOL },
      skill: { status: TaskStatus.STAGED, type: TaskType.SKILL },
      misc: { status: TaskStatus.STAGED, type: TaskType.MISC },
      dock: { status: TaskStatus.IN_DOCK },
    };
    return zoneMap[zone] || null;
  }, []);

  // ============================================================
  // DnD Handlers
  // ============================================================
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task || null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as number;
      const targetZone = over.id as string;

      // Dock full check
      if (targetZone === "dock" && isDockFull) {
        toast.error("DOCK FULL", {
          description: "Maximum 3 tasks allowed in Dock",
          duration: 2000,
        });
        return;
      }

      // Zone mapping
      const updates = getUpdatesForZone(targetZone);
      if (!updates) return;

      updateMutation.mutate({ id: taskId, ...updates });
    },
    [isDockFull, updateMutation, getUpdatesForZone]
  );

  // Time display
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* 1. 全域 Header (永遠顯示) */}
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
          <div className="text-right">
            <div className="font-display text-2xl tabular-nums tracking-widest">
              {time}
            </div>
            <div className="text-xs font-mono font-bold text-green-600">
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        {/* 2. 分頁切換器 (黏在 Header 下方) */}
        <div className="sticky top-0 z-10 px-8">
          <NeoTabs currentTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* 3. 主要內容區 (根據 Tab 切換) */}
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full pb-55">
          {activeTab === "logistics" && <LogisticsView />}
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "runtime" && <RuntimeView />}
        </main>

        {/* 4. Global Dock (固定在底部) */}
        <GlobalDock />

        {/* 5. DragOverlay (顯示拖曳中的卡片) */}
        <DragOverlay dropAnimation={null}>
          {activeTask && <CompactTaskCard task={activeTask} />}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
