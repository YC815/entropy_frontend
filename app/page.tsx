"use client";

import { useState, useCallback } from "react";
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
import { GlobalDock } from "@/components/global-dock";
import { TaskCard } from "@/components/task-card";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { Task } from "@/types";

type Tab = "logistics" | "dashboard";
type DropTarget = "school" | "skill" | "misc" | "dock";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // ============================================================
  // DnD State (提升到頂層)
  // ============================================================
  const { data: tasks = [] } = useTasks();
  const updateStatusMutation = useUpdateTaskStatus();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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

      if (!["school", "skill", "misc", "dock"].includes(targetZone)) {
        return;
      }

      updateStatusMutation.mutate({
        taskId,
        target: targetZone as DropTarget,
      });
    },
    [updateStatusMutation]
  );

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
          <div className="text-right text-xs font-mono font-bold text-green-600">
            SYSTEM ONLINE
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
        </main>

        {/* 4. Global Dock (固定在底部) */}
        <GlobalDock isVisible={activeTab === "dashboard"} />

        {/* 5. DragOverlay (顯示拖曳中的卡片) */}
        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="cursor-grabbing rotate-6 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
