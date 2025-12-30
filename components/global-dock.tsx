"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTasks, useDeleteTask } from "@/hooks/use-tasks";
import { TaskStatus } from "@/types";
import { Flame } from "lucide-react";

export function GlobalDock() {
  const { data: tasks = [] } = useTasks();
  const { setNodeRef, isOver } = useDroppable({ id: "dock" });
  const deleteMutation = useDeleteTask();

  // ============================================================
  // DERIVED STATE: Dock tasks from React Query (SINGLE SOURCE OF TRUTH)
  // ============================================================
  const dockedTasks = tasks.filter((t) => t.status === TaskStatus.IN_DOCK);
  const isFull = dockedTasks.length >= 3;

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        max-w-2xl transition-all duration-200
        ${isOver && !isFull ? "scale-105" : "scale-100"}
        ${isOver && isFull ? "animate-pulse" : ""}
      `}
    >
      {/* 懸浮島背景 */}
      <div className="neo-card p-4 bg-stone-900 text-white">
        <div className="flex items-center justify-between mb-3 text-black">
          <h2 className="font-display text-sm tracking-wider">GLOBAL DOCK</h2>
          <span className="font-mono text-xs opacity-70">
            {dockedTasks.length} / 3
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 ">
          {[0, 1, 2].map((slotIndex) => {
            const task = dockedTasks[slotIndex];
            return (
              <div
                key={slotIndex}
                className={`
                  border-2 border-white/20 rounded p-3 min-h-20
                  flex flex-col justify-between text-black
                  ${!task ? "opacity-30 border-dashed" : "bg-white/10"}
                `}
              >
                {task ? (
                  <>
                    <p className="font-display text-xs line-clamp-2 leading-tight">
                      {task.title}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Remove from Dock?")) {
                          deleteMutation.mutate(task.id);
                        }
                      }}
                      className="self-end p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Flame className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                ) : (
                  <p className="font-mono text-xs text-center opacity-50 m-auto">
                    SLOT {slotIndex + 1}
                    <br />
                    EMPTY
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
