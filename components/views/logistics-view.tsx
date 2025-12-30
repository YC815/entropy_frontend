'use client'

import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { useUIStore } from '@/hooks/use-ui-store'
import { TaskCard } from '@/components/task-card'
import { DroppableZone } from '@/components/droppable-zone'
import { AudioRecorder } from '@/components/audio-recorder'
import { TaskStatus, TaskType } from '@/types'
import { toast } from 'sonner'

export function LogisticsView() {
  const { data: tasks = [], isLoading } = useTasks()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()

  const { setIsDragging } = useUIStore()

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
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)

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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* ============================================ */}
        {/* TOP SECTION: INPUT & INBOX */}
        {/* ============================================ */}
        <section>
          <AudioRecorder />
        </section>

        <DroppableZone
          id="inbox"
          label="INBOX (AI DRAFTS)"
          isEmpty={draftTasks.length === 0}
        >
          <SortableContext
            items={draftTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {draftTasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={handleDelete} />
            ))}
          </SortableContext>
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
    </DndContext>
  )
}
