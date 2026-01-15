import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export urgency utilities from dedicated module
export {
  getTaskUrgency,
  getUrgencyShadow,
  compareByUrgency,
  type TaskUrgency,
} from './urgency'
