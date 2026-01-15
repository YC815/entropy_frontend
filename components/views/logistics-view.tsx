'use client'

import { useTasks, useDeleteTask, useUpdateTask } from '@/hooks/use-tasks'
import { TaskCard } from '@/components/task-card'
import { AudioRecorder } from '@/components/audio-recorder'
import { TaskStatus } from '@/types'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'

export function LogisticsView() {
  const { data: tasks = [], isLoading } = useTasks()
  const deleteMutation = useDeleteTask()
  const updateMutation = useUpdateTask()

  // ============================================================
  // Filter Tasks - Only DRAFT
  // ============================================================
  const draftTasks = tasks.filter((t) => t.status === TaskStatus.DRAFT)

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

  // ============================================================
  // Stage All Handler
  // ============================================================
  const handleStageAll = () => {
    draftTasks.forEach((task) => {
      updateMutation.mutate({ id: task.id, status: TaskStatus.STAGED })
    })
    toast.success('All Drafts Staged', {
      description: `${draftTasks.length} task(s) ready for battle.`,
    })
  }

  if (isLoading) {
    return <div className="font-mono">LOADING LOGISTICS...</div>
  }

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* Audio Recorder Section */}
      {/* ============================================ */}
      <section className="neo-card p-6 bg-gradient-to-br from-blue-50 to-white">
        <h3 className="font-display text-lg mb-4">VOICE INPUT</h3>
        <AudioRecorder />
      </section>

      {/* ============================================ */}
      {/* Draft Tasks Section */}
      {/* ============================================ */}
      <section className="neo-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">
            INBOX
            <span className="ml-2 text-sm font-mono text-stone-500">
              ({draftTasks.length} DRAFTS)
            </span>
          </h3>
          {draftTasks.length > 1 && (
            <button
              onClick={handleStageAll}
              disabled={updateMutation.isPending}
              className="neo-button px-4 py-2 text-xs font-mono flex items-center gap-2"
            >
              STAGE ALL
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {draftTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-stone-400 font-mono text-sm">
              NO DRAFTS YET - START RECORDING!
            </p>
            <p className="text-stone-300 font-mono text-xs mt-2">
              Your AI-parsed tasks will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
                showStageButton
                largeTypeSelector
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
