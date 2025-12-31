"use client";

import { useTasks, useUpdateTaskStatus, useCompleteTask } from "@/hooks/use-tasks";
import { TaskStatus } from "@/types";
import { DroppableZone } from "@/components/droppable-zone";
import { DockCard } from "@/components/dock-card";
import { toast } from "sonner";

interface GlobalDockProps {
  isVisible?: boolean;
}

export function GlobalDock({ isVisible = true }: GlobalDockProps) {
  const { data: tasks = [] } = useTasks();
  const updateStatusMutation = useUpdateTaskStatus();
  const completeMutation = useCompleteTask();

  const dockedTasks = tasks.filter((t) => t.status === TaskStatus.IN_DOCK);

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-full max-w-2xl transition-opacity duration-200
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <DroppableZone
        id="dock"
        label="GLOBAL DOCK"
        isEmpty={false}
        type="dock"
        className="bg-white text-black"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-black opacity-70">
            {dockedTasks.length} / 3
          </span>
          <span className="font-mono text-xs text-black opacity-70">CAPACITY</span>
        </div>

        {dockedTasks.length === 0 ? (
          <p className="text-xs font-mono text-black opacity-70">
            DRAG TASKS FROM STRATEGIC MAP
          </p>
        ) : (
          <div className="space-y-2">
            {dockedTasks.slice(0, 3).map((task) => (
              <DockCard
                key={task.id}
                task={task}
                onComplete={(taskId) => {
                  completeMutation.mutate(taskId, {
                    onSuccess: () => {
                      toast.success("Task Completed", {
                        description: "Marked as done.",
                      });
                    },
                  });
                }}
                onUndock={(taskId) => {
                  updateStatusMutation.mutate(
                    { taskId, target: "staged" },
                    {
                      onSuccess: () => {
                        toast.info("Task Undocked", {
                          description: "Returned to Strategic Map",
                        });
                      },
                    }
                  );
                }}
              />
            ))}
          </div>
        )}
      </DroppableZone>
    </div>
  );
}
