'use client'

import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'

type ZoneType = 'school' | 'skill' | 'misc'

interface DroppableZoneProps {
  id: string
  children: ReactNode
  label: string
  isEmpty?: boolean
  type: ZoneType
  className?: string
}

export function DroppableZone({
  id,
  children,
  label,
  isEmpty = false,
  type,
  className = '',
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const getHoverStyles = (zoneType: ZoneType) => {
    const baseHover = 'transition-all duration-200'

    switch (zoneType) {
      case 'school':
        return `${baseHover} border-black border-4 bg-stone-200 scale-[1.02]`
      case 'skill':
        return `${baseHover} border-neo-blue border-4 bg-blue-50 scale-[1.02]`
      case 'misc':
        return `${baseHover} border-neo-yellow border-4 bg-yellow-50 scale-[1.02]`
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        neo-card p-4 min-h-50
        ${isOver ? getHoverStyles(type) : ''}
        ${className}
      `}
    >
      <h3 className="font-display text-lg mb-4">{label}</h3>
      <div className="space-y-2">
        {isEmpty ? (
          <p className="text-xs font-mono text-stone-400">DROP HERE...</p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
