const TAIPEI_TZ = 'Asia/Taipei'
const DEFAULT_TIME = '23:59'

function pad(value: string | number) {
  return value.toString().padStart(2, '0')
}

function formatParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    hour12: false,
  })

  const parts: Record<string, string> = {}
  formatter.formatToParts(date).forEach(({ type, value }) => {
    parts[type] = value
  })
  return parts
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No Deadline'
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return 'No Deadline'

  const parts = formatParts(date)
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} (TPE)`
}

export function deadlineToInputParts(deadline: string | null): { date: string; time: string } {
  if (!deadline) return { date: '', time: '' }
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return { date: '', time: '' }

  const parts = formatParts(date)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  }
}

export function buildUtcIsoFromParts(datePart: string, timePart?: string): string | null {
  if (!datePart) return null
  const trimmedTime = (timePart || DEFAULT_TIME).trim()
  const needsSeconds = trimmedTime.split(':').length === 2
  const timeWithSeconds = needsSeconds ? `${trimmedTime}:00` : trimmedTime

  const candidate = new Date(`${datePart}T${timeWithSeconds}+08:00`)
  if (Number.isNaN(candidate.getTime())) {
    throw new Error('Invalid deadline')
  }
  return candidate.toISOString()
}

export const DEADLINE_TIMEZONE = 'Asia/Taipei'
export const DEADLINE_TIMEZONE_LABEL = 'TPE'
export const DEADLINE_DEFAULT_TIME = DEFAULT_TIME
