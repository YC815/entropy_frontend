'use client'

import { Task, TaskStatus } from '@/types'
import { useState } from 'react'
import { useUpdateTask } from '@/hooks/use-tasks'
import { Badge } from '@/components/ui/badge'
import { TypeSelector } from '@/components/type-selector'
import { Calendar, Flame, ArrowRight } from 'lucide-react'
import { cn, getTaskUrgency, getUrgencyShadow } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onDelete?: (id: number) => void
  showStageButton?: boolean
  largeTypeSelector?: boolean
  className?: string
}

export function TaskCard({ task, onDelete, showStageButton, largeTypeSelector, className }: TaskCardProps) {
  const updateMutation = useUpdateTask()

  // Local state for inline editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [isEditingDeadline, setIsEditingDeadline] = useState(false)

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
  // Urgency Styling
  // ============================================================
  const urgency = getTaskUrgency(task.deadline)
  const shadowClass = getUrgencyShadow(urgency)

  return (
    <div
      className={cn(
        `
          bg-white p-3
          border-2 border-black
          ${shadowClass}
          hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px] transition-all
        `,
        className
      )}
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
        {/* Type Selector */}
        <TypeSelector
          taskId={task.id}
          currentType={task.type}
          size={largeTypeSelector ? 'lg' : 'sm'}
        />

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

      {/* Stage Button */}
      {showStageButton && task.status === TaskStatus.DRAFT && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            updateMutation.mutate({ id: task.id, status: TaskStatus.STAGED })
          }}
          disabled={updateMutation.isPending}
          className="mt-3 w-full neo-button px-3 py-1.5 text-xs font-mono flex items-center justify-center gap-2"
        >
          STAGE
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
