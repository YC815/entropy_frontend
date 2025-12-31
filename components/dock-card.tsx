'use client'

import { Task } from '@/types'
import { Check, X } from 'lucide-react'

interface DockCardProps {
  task: Task
  onComplete: (taskId: number) => void
  onUndock: (taskId: number) => void
}

export function DockCard({ task, onComplete, onUndock }: DockCardProps) {
  return (
    <div className="neo-card flex items-center gap-3 p-3 bg-white">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onComplete(task.id)
        }}
        className="
          basis-[15%] shrink-0 h-12 flex items-center justify-center
          border-4 border-neo-black bg-white
          hover:bg-green-400 transition-colors
        "
        aria-label="Complete task"
      >
        <Check className="w-6 h-6 text-neo-black" />
      </button>

      <div className="basis-[75%] min-w-0">
        <p className="font-display text-base truncate">{task.title}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onUndock(task.id)
        }}
        className="
          basis-[10%] shrink-0 h-10 flex items-center justify-center
          border-2 border-neo-black bg-white
          hover:bg-stone-200 transition-colors
        "
        aria-label="Undock task"
      >
        <X className="w-5 h-5 text-neo-black" />
      </button>
    </div>
  )
}
