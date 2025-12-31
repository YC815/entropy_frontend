'use client'

import { Task } from '@/types'

interface CompactTaskCardProps {
  task: Task
}

export function CompactTaskCard({ task }: CompactTaskCardProps) {
  return (
    <div
      className="
        w-40 h-40
        bg-white
        border-4 border-neo-black
        shadow-neo-lg
        rotate-6
        cursor-grabbing
        flex items-center justify-center
        p-4
      "
    >
      {/* Title (Main Focus) */}
      <h3 className="font-display text-2xl text-center line-clamp-2 leading-tight">
        {task.title}
      </h3>
    </div>
  )
}
