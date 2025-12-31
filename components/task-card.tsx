'use client'

import { Task, TaskType } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { useUpdateTask } from '@/hooks/use-tasks'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flame } from 'lucide-react'
import { cn, getTaskUrgency, getUrgencyShadow } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onDelete?: (id: number) => void
  className?: string
}

export function TaskCard({ task, onDelete, className }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const updateMutation = useUpdateTask()

  // Local state for inline editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [isEditingDeadline, setIsEditingDeadline] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide original card when dragging (Ghost takes over)
    opacity: isDragging ? 0 : 1,
  }

  // ============================================================
  // Title Editing
  // ============================================================
  const handleTitleBlur = () => {
    if (title !== task.title && title.trim()) {
      updateMutation.mutate({ id: task.id, title: title.trim() })
    } else {
      setTitle(task.title) // Revert if empty
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setTitle(task.title)
      setIsEditingTitle(false)
    }
  }

  // ============================================================
  // Deadline Editing
  // ============================================================
  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeadline = e.target.value || null
    updateMutation.mutate({ id: task.id, deadline: newDeadline })
    setIsEditingDeadline(false)
  }

  // ============================================================
  // Type Badge Styling (更新為新粗野主義配色)
  // ============================================================
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

  // ============================================================
  // Urgency Styling (使用統一工具函式)
  // ============================================================
  const urgency = getTaskUrgency(task.deadline)
  const shadowClass = getUrgencyShadow(urgency)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        `
          bg-white p-3 cursor-grab active:cursor-grabbing
          border-2 border-black
          ${shadowClass}
          hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px] transition-all
        `,
        className
      )}
      {...attributes}
      {...listeners}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        {/* Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 bg-transparent border-b-2 border-stone-900 font-display text-sm outline-none"
            autoFocus
          />
        ) : (
          <h4
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 font-display text-sm cursor-pointer hover:bg-yellow-200"
          >
            {task.title}
          </h4>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="ml-2 p-1 hover:bg-red-100 rounded"
          >
            <Flame className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type Badge */}
        <Badge className={getTypeColor(task.type)}>
          {task.type.toUpperCase()}
        </Badge>

        {/* Difficulty */}
        <Badge variant="outline" className="font-mono text-xs">
          D{task.difficulty}
        </Badge>

        {/* XP Value */}
        <Badge variant="outline" className="font-mono text-xs">
          {task.xp_value} XP
        </Badge>

        {/* Deadline */}
        {isEditingDeadline ? (
          <input
            type="date"
            onChange={handleDeadlineChange}
            onBlur={() => setIsEditingDeadline(false)}
            defaultValue={task.deadline?.split('T')[0] || ''}
            className="text-xs border border-stone-900 p-1 rounded"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingDeadline(true)}
            className="flex items-center gap-1 text-xs hover:bg-stone-200 px-2 py-1 rounded"
          >
            <Calendar className="w-3 h-3" />
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString()
              : 'No Deadline'}
          </button>
        )}
      </div>
    </div>
  )
}
