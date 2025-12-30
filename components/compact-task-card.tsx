'use client'

import { Task, TaskType } from '@/types'
import { Badge } from '@/components/ui/badge'

interface CompactTaskCardProps {
  task: Task
}

/**
 * Compact version of TaskCard for DragOverlay
 * Shows only Title + Type Badge in a square format
 */
export function CompactTaskCard({ task }: CompactTaskCardProps) {
  // Type Badge Styling (same as TaskCard)
  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case TaskType.SCHOOL:
        return 'bg-[#FFDE59] text-black border-2 border-black'
      case TaskType.SKILL:
        return 'bg-[#54A0FF] text-white border-2 border-black'
      case TaskType.MISC:
        return 'bg-[#FF6B6B] text-white border-2 border-black'
    }
  }

  return (
    <div
      className="
        w-32 h-32
        bg-white
        border-4 border-black
        shadow-neo-lg
        rotate-6
        cursor-grabbing
        flex flex-col items-center justify-center
        p-3 gap-2
      "
    >
      {/* Type Badge (Compact, Top Right Corner) */}
      <Badge className={`${getTypeColor(task.type)} text-xs`}>
        {task.type.toUpperCase()}
      </Badge>

      {/* Title (Main Focus) */}
      <h3 className="font-display text-2xl text-center line-clamp-2 leading-tight">
        {task.title}
      </h3>
    </div>
  )
}
