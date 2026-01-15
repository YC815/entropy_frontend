'use client'

import { TaskType } from '@/types'
import { useUpdateTask } from '@/hooks/use-tasks'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: TaskType.SCHOOL, label: 'SCHOOL', color: 'bg-[#FFDE59] text-black' },
  { value: TaskType.SKILL, label: 'SKILL', color: 'bg-[#54A0FF] text-white' },
  { value: TaskType.MISC, label: 'MISC', color: 'bg-[#FF6B6B] text-white' },
] as const

interface TypeSelectorProps {
  taskId: number
  currentType: TaskType
  disabled?: boolean
  size?: 'sm' | 'lg'
}

export function TypeSelector({ taskId, currentType, disabled, size = 'sm' }: TypeSelectorProps) {
  const updateMutation = useUpdateTask()

  const currentOption = TYPE_OPTIONS.find(o => o.value === currentType)!

  const handleSelect = (newType: TaskType) => {
    if (newType !== currentType) {
      updateMutation.mutate({ id: taskId, type: newType })
    }
  }

  const isLarge = size === 'lg'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || updateMutation.isPending}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex items-center font-medium border-2 border-black cursor-pointer',
          'hover:opacity-80 transition-all',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          currentOption.color,
          isLarge
            ? 'gap-2 px-3 py-1.5 text-sm shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5'
            : 'gap-1 px-2 py-0.5 text-xs'
        )}
      >
        {currentOption.label}
        <ChevronDown className={isLarge ? 'w-4 h-4' : 'w-3 h-3'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          'border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] p-0 rounded-none',
          isLarge ? 'min-w-[140px]' : 'min-w-[100px]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {TYPE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'flex items-center gap-2 cursor-pointer rounded-none',
              'hover:bg-stone-100 focus:bg-stone-100',
              'border-b border-stone-200 last:border-b-0',
              isLarge ? 'px-4 py-3' : 'px-3 py-2'
            )}
          >
            <span className={cn(
              'border border-black',
              option.color,
              isLarge ? 'w-4 h-4' : 'w-3 h-3'
            )} />
            <span className={cn('font-mono', isLarge ? 'text-sm' : 'text-xs')}>
              {option.label}
            </span>
            {option.value === currentType && (
              <Check className={cn('ml-auto', isLarge ? 'w-4 h-4' : 'w-3 h-3')} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
