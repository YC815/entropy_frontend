'use client'

import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'

type ZoneType = 'school' | 'skill' | 'misc' | 'dock' | 'inbox'

interface DroppableZoneProps {
  id: string
  children: ReactNode
  label: string
  isEmpty?: boolean
  isFull?: boolean  // For Dock
  zoneType?: ZoneType
  className?: string
}

export function DroppableZone({
  id,
  children,
  label,
  isEmpty = false,
  isFull = false,
  zoneType,
  className = '',
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Hover styles based on zone type
  const getHoverStyles = (type?: ZoneType) => {
    const baseHover = 'scale-[1.02] transition-all duration-200'

    switch (type) {
      case 'school':
        return `${baseHover} border-black border-4 bg-stone-200`
      case 'skill':
        return `${baseHover} border-[#54A0FF] border-4 bg-blue-50`
      case 'misc':
        return `${baseHover} border-[#FFDE59] border-4 bg-yellow-50`
      case 'dock':
        return `${baseHover} border-dashed border-4 border-black scale-105`
      default:
        return `${baseHover} border-blue-500 border-4 bg-blue-100`
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        neo-card p-4 min-h-50
        ${isOver && !isFull ? getHoverStyles(zoneType) : ''}
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
