// ============================================================
// Urgency Module - Single Source of Truth
// ============================================================
// 急迫性統一管理模組
// Dashboard 和 Logistics 共用此邏輯

export type TaskUrgency = 'critical' | 'warning' | 'normal'

/**
 * 計算任務急迫性
 *
 * 算法:
 * - 無 deadline → normal
 * - 已過期 或 < 24h → critical
 * - < 72h (3天) → warning
 * - 其他 → normal
 */
export function getTaskUrgency(deadline: string | null): TaskUrgency {
  if (!deadline) return 'normal'

  const ms = new Date(deadline).getTime() - Date.now()
  const hours = ms / 3600000

  if (hours < 0) return 'critical'      // Past deadline
  if (hours < 24) return 'critical'     // < 24h
  if (hours < 72) return 'warning'      // < 3 days
  return 'normal'
}

/**
 * Neo-Brutalism 陰影樣式
 *
 * critical → 紅色陰影
 * warning → 黃色陰影
 * normal → 黑色陰影
 */
export function getUrgencyShadow(urgency: TaskUrgency): string {
  const shadowMap = {
    critical: 'shadow-[4px_4px_0px_0px_#FF0000]',
    warning: 'shadow-[4px_4px_0px_0px_#FFDE59]',
    normal: 'shadow-[4px_4px_0px_0px_#000000]',
  }
  return shadowMap[urgency]
}

/**
 * 排序比較器 - 用於任務列表排序
 *
 * critical (0) < warning (1) < normal (2)
 * 返回負數 = a 更緊急，正數 = b 更緊急
 */
export function compareByUrgency(deadlineA: string | null, deadlineB: string | null): number {
  const order = { critical: 0, warning: 1, normal: 2 }
  return order[getTaskUrgency(deadlineA)] - order[getTaskUrgency(deadlineB)]
}
