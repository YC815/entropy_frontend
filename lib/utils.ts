import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Task Urgency Utilities (Linus-style: No special cases)
// ============================================================

export type TaskUrgency = 'critical' | 'warning' | 'normal'

export function getTaskUrgency(deadline: string | null): TaskUrgency {
  if (!deadline) return 'normal'

  const ms = new Date(deadline).getTime() - Date.now()
  const hours = ms / 3600000

  if (hours < 0) return 'critical'      // Past deadline
  if (hours < 24) return 'critical'     // < 24h
  if (hours < 72) return 'warning'      // < 3 days
  return 'normal'
}

// Neo-brutalism urgency styles (for Dashboard Strategic Map)
export function getUrgencyStyles(urgency: TaskUrgency) {
  const styleMap = {
    critical: 'border-neo-red bg-red-50',
    warning: 'border-neo-yellow bg-yellow-50',
    normal: 'border-neo-black bg-white',
  }
  return styleMap[urgency]
}

// Shadow styles (for TaskCard - existing pattern)
export function getUrgencyShadow(urgency: TaskUrgency) {
  const shadowMap = {
    critical: 'shadow-[4px_4px_0px_0px_#FF0000]',
    warning: 'shadow-[4px_4px_0px_0px_#FFDE59]',
    normal: 'shadow-[4px_4px_0px_0px_#000000]',
  }
  return shadowMap[urgency]
}
