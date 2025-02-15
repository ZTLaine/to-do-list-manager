import * as React from "react"
import { useEffect, useRef, useState } from 'react'
import Masonry from 'masonry-layout'

interface MasonryInstance extends Masonry {
  layout: () => void;
  destroy: () => void;
}

interface MasonryGridProps {
  children: React.ReactNode
  columnWidth?: number
  gutter?: number
}

export function MasonryGrid({ children, columnWidth = 350, gutter = 16 }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const masonryRef = useRef<MasonryInstance | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerWidth(gridRef.current.offsetWidth)
        if (masonryRef.current) {
          masonryRef.current.layout()
        }
      }
    }

    // Initial measurement
    handleResize()

    // Add resize listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Small delay to ensure content is loaded
    const timer = setTimeout(() => {
      if (gridRef.current) {
        masonryRef.current = new Masonry(gridRef.current, {
          itemSelector: '.grid-item',
          columnWidth: '.grid-sizer', // Use element for column width
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
  To-do list app made with Next.Js using Typescript

  useEffect(() => {
    // Layout items when children change
    if (masonryRef.current) {
      masonryRef.current.layout()
    }
  }, [children])

  // Calculate column width based on container width
  const getColumnWidth = () => {
    const minColumns = 1
    const maxColumns = Math.floor(containerWidth / columnWidth)
    const actualColumns = Math.max(minColumns, maxColumns)
    return `${100 / actualColumns}%`
  }

  return (
    <div 
      ref={gridRef} 
      className="w-full px-4"
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        minWidth: columnWidth
      }}
    >
      {/* Grid sizer element */}
      <div className="grid-sizer" style={{ width: getColumnWidth() }} />
      
      {React.Children.map(children, (child) => (
        <div 
          className="grid-item space-y-2" 
          style={{ 
            width: getColumnWidth(),
            padding: `${gutter/2}px`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
} 