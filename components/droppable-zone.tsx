'use client'

import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'

interface DroppableZoneProps {
  id: string
  children: ReactNode
  label: string
  isEmpty?: boolean
  isFull?: boolean  // For Dock
  className?: string
}

export function DroppableZone({
  id,
  children,
  label,
  isEmpty = false,
  isFull = false,
  className = '',
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`
        neo-card p-4 min-h-[200px] transition-all
        ${isOver && !isFull ? 'bg-blue-100 border-blue-500 border-4' : ''}
        ${isOver && isFull ? 'bg-red-100 border-red-500 border-4 animate-pulse' : ''}
        ${className}
      `}
    >
      <h3 className="font-display text-lg mb-4 flex items-center justify-between">
        {label}
        {isFull && (
          <span className="text-xs font-mono bg-red-500 text-white px-2 py-1">
            FULL
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {isEmpty ? (
          <p className="text-xs font-mono text-stone-400">
            DROP HERE...
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
