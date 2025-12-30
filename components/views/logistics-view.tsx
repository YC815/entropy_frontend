'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasks, useDeleteTask } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { DroppableZone } from '@/components/droppable-zone'
import { AudioRecorder } from '@/components/audio-recorder'
import { TaskStatus, TaskType } from '@/types'
import { toast } from 'sonner'

export function LogisticsView() {
  const { data: tasks = [], isLoading } = useTasks()
  const deleteMutation = useDeleteTask()

  // ============================================================
  // Filter Tasks by Status (移除 Dock 相關)
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
      {/* BOTTOM SECTION: STAGING BUCKETS (只保留 3 個) */}
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
  )
}
