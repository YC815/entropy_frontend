import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Task, TaskStatus, TaskType } from '@/types'

// ============================================================
// QUERIES
// ============================================================

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get<Task[]>('/tasks/')
      return data
    },
  })
}

// ============================================================
// MUTATIONS
// ============================================================

interface UpdateTaskPayload {
  id: number
  title?: string
  type?: TaskType
  status?: TaskStatus
  deadline?: string | null
  difficulty?: number
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateTaskPayload) => {
      const { id, ...updates } = payload
      const { data } = await api.patch<Task>(`/tasks/${id}`, updates)
      return data
    },

    // ============================================================
    // OPTIMISTIC UPDATE: UI updates instantly, rollback on failure
    // ============================================================
    onMutate: async (newTask) => {
      // Cancel outgoing refetches (prevent race conditions)
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot current state FOR ROLLBACK
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      // Optimistically update UI (user sees change immediately)
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return []
        return old.map((task) =>
          task.id === newTask.id ? { ...task, ...newTask } : task
        )
      })

      // Return rollback context (used in onError)
      return { previousTasks }
    },

    // ============================================================
    // ROLLBACK: Snap card back to original position on error
    // ============================================================
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      console.error('Task update failed:', err)
      // Card will "bounce back" to its original position
    },

    // Always refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
