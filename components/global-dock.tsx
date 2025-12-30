'use client'

import { useDroppable } from '@dnd-kit/core'
import { useTasks } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { TaskStatus } from '@/types'

export function GlobalDock() {
  const { data: tasks = [] } = useTasks()
  const { setNodeRef, isOver } = useDroppable({ id: 'dock' })

  // ============================================================
  // DERIVED STATE: Dock tasks from React Query (SINGLE SOURCE OF TRUTH)
  // ============================================================
  const dockedTasks = tasks.filter((t) => t.status === TaskStatus.IN_DOCK)
  const isFull = dockedTasks.length >= 3

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-0 left-0 right-0
        bg-stone-100 border-t-4 border-stone-900
        p-4 shadow-neo-lg z-50
        transition-all
        ${isOver && !isFull ? 'bg-blue-100 border-blue-500' : ''}
        ${isOver && isFull ? 'bg-red-100 border-red-500 animate-pulse' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xl">
            GLOBAL DOCK
          </h2>
          <span className="font-mono text-xs">
            {dockedTasks.length} / 3 SLOTS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIndex) => {
            const task = dockedTasks[slotIndex]
            return (
              <div
                key={slotIndex}
                className={`
                  neo-card p-4 min-h-[120px]
                  ${!task ? 'opacity-30 border-dashed' : ''}
                `}
              >
                {task ? (
                  <TaskCard task={task} />
                ) : (
                  <p className="font-mono text-xs text-stone-400 text-center">
                    SLOT {slotIndex + 1}<br />EMPTY
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
