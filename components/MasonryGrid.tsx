import * as React from "react"
import { useEffect, useRef, useState } from 'react'
import Masonry from 'masonry-layout'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useResizeObserver } from "@/hooks/use-resize-observer"

interface MasonryInstance extends Masonry {
  layout: () => void;
  destroy: () => void;
  reloadItems: () => void;
}

interface MasonryGridProps {
  children: React.ReactNode
  columnWidth?: number
  gutter?: number
  items?: { id: string }[]
  onReorder?: (newOrder: { id: string }[]) => void
}

export function MasonryGrid({ 
  children, 
  columnWidth = 350, 
  gutter = 16,
  items = [],
  onReorder 
}: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const masonryRef = useRef<MasonryInstance | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Add this useEffect for SSR
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      const newOrder = arrayMove(items, oldIndex, newIndex)
      onReorder?.(newOrder)
    }
  }

  // Use ResizeObserver to watch container size
  useResizeObserver(gridRef, (entry) => {
    const newWidth = entry.contentRect.width
    if (newWidth !== containerWidth) {
      setContainerWidth(newWidth)
      if (masonryRef.current) {
        masonryRef.current.layout()
      }
    }
  })

  useEffect(() => {
    // Small delay to ensure content is loaded
    const timer = setTimeout(() => {
      if (gridRef.current) {
        masonryRef.current = new Masonry(gridRef.current, {
          itemSelector: '.grid-item',
          columnWidth: '.grid-sizer',
          gutter: gutter,
          fitWidth: true,
          transitionDuration: '0.2s',
          initLayout: true,
          percentPosition: true
        }) as MasonryInstance
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (masonryRef.current) {
        masonryRef.current.destroy()
      }
    }
  }, [columnWidth, gutter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (masonryRef.current) {
        masonryRef.current.reloadItems()
        masonryRef.current.layout()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [children, items])

  // Calculate column width based on container width
  const getColumnWidth = () => {
    const minColumns = 1
    const maxColumns = Math.floor(containerWidth / columnWidth)
    const actualColumns = Math.max(minColumns, maxColumns)
    return `${100 / actualColumns}%`
  }

  // Don't render DndContext on server
  if (!isClient) {
    return (
      <div 
        ref={gridRef} 
        className="w-full"
        style={{
          width: '90%',
          maxWidth: '90%',
          margin: '0 auto',
          minWidth: columnWidth,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {React.Children.map(children, (child) => (
          <div 
            className="grid-item space-y-2" 
            style={{ 
              width: getColumnWidth(),
              padding: `${gutter/2}px`,
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div 
        ref={gridRef} 
        className="w-full"
        style={{
          width: '90%',
          maxWidth: '90%',
          margin: '0 auto',
          minWidth: columnWidth,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        <SortableContext 
          items={items}
          strategy={rectSortingStrategy}
        >
          {/* Grid sizer element */}
          <div className="grid-sizer" style={{ width: getColumnWidth() }} />
          
          {React.Children.map(children, (child) => (
            <div 
              className="grid-item space-y-2" 
              style={{ 
                width: getColumnWidth(),
                padding: `${gutter/2}px`,
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              {child}
            </div>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
} 