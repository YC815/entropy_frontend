'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { CompactTaskCard } from '@/components/compact-task-card'
import { DroppableZone } from '@/components/droppable-zone'
import { AudioRecorder } from '@/components/audio-recorder'
import { TaskStatus, TaskType, Task } from '@/types'
import { toast } from 'sonner'

export function LogisticsView() {
  const { data: tasks = [], isLoading } = useTasks()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()

  // Local state for DragOverlay (replaces Zustand isDragging)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Configure Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags (click vs drag)
      },
    })
  )

  // Compute Dock fullness from React Query state
  const dockedTasks = tasks.filter((t) => t.status === TaskStatus.IN_DOCK)
  const isDockFull = dockedTasks.length >= 3

  // ============================================================
  // Filter Tasks by Status
  // ============================================================
  const draftTasks = tasks.filter((t) => t.status === TaskStatus.DRAFT)
  const schoolTasks = tasks.filter(
    (t) => t.status === TaskStatus.STAGED && t.type === TaskType.SCHOOL
  )
  const skillTasks = tasks.filter(
    (t) => t.status === TaskStatus.STAGED && t.type === TaskType.SKILL
  )
  const miscTasks = tasks.filter(
    (t) => t.status === TaskStatus.STAGED && t.type === TaskType.MISC
  )

  // ============================================================
  // DnD Handlers
  // ============================================================
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null) // Clear Ghost

    const { active, over } = event
    if (!over) return

    const taskId = active.id as number
    const targetZone = over.id as string

    // ============================================================
    // CRITICAL: Prevent 4th item in Dock (Client-side validation)
    // ============================================================
    if (targetZone === 'dock' && isDockFull) {
      toast.error('DOCK FULL', {
        description: 'Maximum 3 tasks allowed in Dock',
        duration: 2000,
      })
      return  // ← Block mutation, card snaps back to original position
    }

    // Simple switch - no special cases
    const updates = getUpdatesForZone(targetZone)
    if (!updates) return

    updateMutation.mutate({ id: taskId, ...updates })
  }

  // ============================================================
  // Zone Mapping (Linus-style: no if-else hell)
  // ============================================================
  function getUpdatesForZone(zone: string) {
    const zoneMap: Record<string, Partial<{ status: TaskStatus; type: TaskType }>> = {
      school: { status: TaskStatus.STAGED, type: TaskType.SCHOOL },
      skill: { status: TaskStatus.STAGED, type: TaskType.SKILL },
      misc: { status: TaskStatus.STAGED, type: TaskType.MISC },
      dock: { status: TaskStatus.IN_DOCK },
    }
    return zoneMap[zone] || null
  }

  // ============================================================
  // Delete Handler
  // ============================================================
  const handleDelete = (taskId: number) => {
    if (confirm('Incinerate this task?')) {
      deleteMutation.mutate(taskId)
      toast.error('Task Incinerated', {
        description: 'Burned to ashes.',
      })
    }
  }

  if (isLoading) {
    return <div className="font-mono">LOADING LOGISTICS...</div>
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* ============================================ */}
        {/* TOP SECTION: INBOX (含錄音輸入) */}
        {/* ============================================ */}
        <DroppableZone
          id="inbox"
          label="INBOX (AI DRAFTS)"
          isEmpty={false}
          zoneType="inbox"
        >
          {/* 錄音輸入區（永遠顯示） */}
          <div className="neo-card p-6 mb-4 bg-linear-to-br from-blue-50 to-white">
            <AudioRecorder />
          </div>

          {/* 草稿任務列表 */}
          {draftTasks.length === 0 ? (
            <p className="text-xs font-mono text-stone-400 text-center py-8">
              NO DRAFTS YET - START RECORDING!
            </p>
          ) : (
            <SortableContext
              items={draftTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {draftTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          )}
        </DroppableZone>

        {/* ============================================ */}
        {/* BOTTOM SECTION: STAGING BUCKETS */}
        {/* ============================================ */}
        <section className="grid grid-cols-3 gap-4">
          {/* SCHOOL BUCKET */}
          <DroppableZone
            id="school"
            label="SCHOOL"
            isEmpty={schoolTasks.length === 0}
            zoneType="school"
            className="bg-neutral-100! shadow-none!"
          >
            <SortableContext
              items={schoolTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {schoolTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </DroppableZone>

          {/* SKILL BUCKET */}
          <DroppableZone
            id="skill"
            label="SKILL"
            isEmpty={skillTasks.length === 0}
            zoneType="skill"
            className="bg-neutral-100! shadow-none!"
          >
            <SortableContext
              items={skillTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {skillTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </DroppableZone>

          {/* MISC BUCKET */}
          <DroppableZone
            id="misc"
            label="MISC"
            isEmpty={miscTasks.length === 0}
            zoneType="misc"
            className="bg-neutral-100! shadow-none!"
          >
            <SortableContext
              items={miscTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {miscTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </DroppableZone>
        </section>
      </div>

      {/* ============================================ */}
      {/* DragOverlay: Compact Ghost Card */}
      {/* Ghost appears at cursor position (no transition from original card) */}
      {/* ============================================ */}
      <DragOverlay dropAnimation={null}>
        {activeTask && <CompactTaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}
