"use client"

import * as React from "react"
import { useCallback, useEffect, useState, useRef } from "react"

// Define color ranges (in HSL)
const colorRanges = {
  start: {
    min: 200, // blue-ish
    max: 150  // green-ish
  },
  mid: {
    min: 262, // violet
    max: 200  // blue
  },
  end: {
    min: 291, // pink
    max: 262  // violet
  }
}

export function AnimatedGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 })
  const [colorAngles, setColorAngles] = useState({
    start: colorRanges.start.min,
    mid: colorRanges.mid.min,
    end: colorRanges.end.min
  })
  const isHovering = useRef(true)
  const animationFrameRef = useRef<number>()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    setMousePosition({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false
  }, [])

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true
    // Restart animation if it was stopped
    if (!animationFrameRef.current) {
      updateGradient()
    }
  }, [])

  // Function to update colors based on some factor (like time or mouse position)
  const updateColors = useCallback(() => {
    // Use time to create a smooth oscillation between min and max values
    const oscillation = (Math.sin(Date.now() / 5000) + 1) / 2 // Value between 0 and 1

    setColorAngles({
      start: colorRanges.start.min + (colorRanges.start.max - colorRanges.start.min) * oscillation,
      mid: colorRanges.mid.min + (colorRanges.mid.max - colorRanges.mid.min) * oscillation,
      end: colorRanges.end.min + (colorRanges.end.max - colorRanges.end.min) * oscillation
    })
  }, [])

  // Combined update function for both position and color
  const updateGradient = useCallback(() => {
    if (isHovering.current) {
      // Update position
      setGradientPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.01,
        y: prev.y + (mousePosition.y - prev.y) * 0.01
      }))
      
      // Update colors
      updateColors()

      animationFrameRef.current = requestAnimationFrame(updateGradient)
    } else {
      animationFrameRef.current = undefined
    }
  }, [mousePosition, updateColors])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)
    
    updateGradient()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, updateGradient])

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="h-full w-full bg-gradient-to-r from-transparent to-transparent transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, 
            hsl(${colorAngles.start} 83.2% 53.3%) 0%,
            hsl(${colorAngles.mid} 83.3% 57.8%) 35%,
            hsl(${colorAngles.end} 95.5% 58.7%) 90%)`
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>
    </div>
  )
} 