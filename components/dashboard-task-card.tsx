'use client'

import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Calendar } from 'lucide-react'

import { useUpdateTask } from '@/hooks/use-tasks'
import { buildUtcIsoFromParts, deadlineToInputParts, formatDeadline } from '@/lib/datetime'
import { cn, getTaskUrgency, getUrgencyShadow } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { TypeSelector } from '@/components/type-selector'
import { Task } from '@/types'

interface DashboardTaskCardProps {
  task: Task
  prefix?: ReactNode
  suffix?: ReactNode
  className?: string
}

function NumberBadgeEditor({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onSubmit,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  onSubmit: (val: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value.toString())

  useEffect(() => {
    setDraft(value.toString())
  }, [value])

  const commit = () => {
    const parsed = Math.round(Number(draft))
    if (!Number.isFinite(parsed)) {
      setDraft(value.toString())
      setIsEditing(false)
      return
    }

    if (min !== undefined && parsed < min) {
      alert(`Value must be >= ${min}`)
      return
    }

    if (max !== undefined && parsed > max) {
      alert(`Value must be <= ${max}`)
      return
    }

    if (parsed !== value) {
      onSubmit(parsed)
    }
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(value.toString())
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit()
    }
    if (e.key === 'Escape') {
      cancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-16 border border-stone-400 text-xs px-2 py-1"
          min={min}
          max={max}
          step={step}
          autoFocus
        />
        <button
          type="button"
          className="neo-button px-2 py-1 text-[11px] font-mono"
          onClick={commit}
        >
          Save
        </button>
        <button
          type="button"
          className="text-stone-500 underline-offset-2 underline text-[11px]"
          onClick={cancel}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <Badge
      variant="outline"
      className="font-mono text-xs cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {label}
      {value}
      {suffix ? ` ${suffix}` : ''}
    </Badge>
  )
}

function DeadlineEditor({
  deadline,
  onSave,
}: {
  deadline: string | null
  onSave: (next: string | null) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => deadlineToInputParts(deadline))

  useEffect(() => {
    setDraft(deadlineToInputParts(deadline))
  }, [deadline])

  const handleSave = () => {
    try {
      const iso = draft.date ? buildUtcIsoFromParts(draft.date, draft.time) : null
      onSave(iso)
      setIsEditing(false)
    } catch (error) {
      alert('Invalid deadline. Please check date/time.')
    }
  }

  const handleCancel = () => {
    setDraft(deadlineToInputParts(deadline))
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
          className="border border-stone-900 p-1 rounded"
          autoFocus
        />
        <input
          type="time"
          value={draft.time}
          onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
          className="border border-stone-900 p-1 rounded"
          step={60}
        />
        <button
          type="button"
          className="neo-button px-2 py-1 text-[11px] font-mono"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          className="text-stone-500 underline underline-offset-2 text-[11px]"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <Badge
      variant="outline"
      className="font-mono text-xs cursor-pointer flex items-center gap-1"
      onClick={() => setIsEditing(true)}
    >
      <Calendar className="w-3 h-3" />
      {formatDeadline(deadline)}
    </Badge>
  )
}

export function DashboardTaskCard({ task, prefix, suffix, className }: DashboardTaskCardProps) {
  const updateMutation = useUpdateTask()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)

  useEffect(() => {
    setTitle(task.title)
  }, [task.title])

  const urgency = getTaskUrgency(task.deadline)
  const shadowClass = getUrgencyShadow(urgency)

  const handleTitleBlur = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(task.title)
      setIsEditingTitle(false)
      return
    }
    if (trimmed !== task.title) {
      updateMutation.mutate({ id: task.id, title: trimmed })
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setTitle(task.title)
      setIsEditingTitle(false)
    }
  }

  return (
    <li className={cn('neo-card p-3 flex items-start gap-3', shadowClass, className)}>
      {prefix && <div className="pt-1">{prefix}</div>}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
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
            <button
              type="button"
              className="flex-1 text-left font-display text-sm hover:bg-yellow-200"
              onClick={() => setIsEditingTitle(true)}
            >
              {task.title}
            </button>
          )}
          <span className="text-[10px] font-mono uppercase text-stone-500">
            {urgency}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <TypeSelector taskId={task.id} currentType={task.type} />
          <NumberBadgeEditor
            label="D"
            value={task.difficulty}
            min={1}
            max={10}
            onSubmit={(next) => updateMutation.mutate({ id: task.id, difficulty: next })}
          />
          <NumberBadgeEditor
            label=""
            value={task.xp_value}
            min={0}
            step={10}
            suffix="XP"
            onSubmit={(next) => updateMutation.mutate({ id: task.id, xp_value: next })}
          />
          <DeadlineEditor
            deadline={task.deadline}
            onSave={(next) => updateMutation.mutate({ id: task.id, deadline: next })}
          />
        </div>
      </div>
      {suffix && <div className="flex items-center">{suffix}</div>}
    </li>
  )
}
