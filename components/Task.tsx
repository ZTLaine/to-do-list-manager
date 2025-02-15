import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TaskProps {
  id: string
  taskName: string
  isCompleted: boolean
  listId: string
  onToggle: (listId: string, taskId: string, isCompleted: boolean) => void
  onDelete: (listId: string, taskId: string) => void
  onRename: (listId: string, taskId: string, newName: string) => void
}

// Add this helper function at the module level
const getStoredLineOffset = (taskId: string): number | null => {
  const stored = sessionStorage.getItem(`task-line-offset-${taskId}`)
  return stored ? Number(stored) : null
}

export function Task({
  id,
  taskName,
  isCompleted,
  listId,
  onToggle,
  onDelete,
  onRename,
}: TaskProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(taskName)
  const clickTimeoutRef = useRef<NodeJS.Timeout>()
  const [lineOffset, setLineOffset] = useState(() => {
    // If the task is completed, always try to get from storage first
    if (isCompleted) {
      const stored = getStoredLineOffset(id)
      if (stored !== null) {
        return stored
      }
      // If no stored value but task is completed, generate a new random offset
      const newOffset = Math.floor(Math.random() * 12) - 6
      sessionStorage.setItem(`task-line-offset-${id}`, newOffset.toString())
      return newOffset
    }
    return 0
  })
  const [isAnimating, setIsAnimating] = useState(false)

  // Update editedName when taskName prop changes
  useEffect(() => {
    setEditedName(taskName)
  }, [taskName])

  // Add an effect to handle completed state changes
  useEffect(() => {
    if (isCompleted) {
      const stored = getStoredLineOffset(id)
      if (stored === null) {
        const newOffset = Math.floor(Math.random() * 12) - 6
        setLineOffset(newOffset)
        sessionStorage.setItem(`task-line-offset-${id}`, newOffset.toString())
      } else {
        setLineOffset(stored)
      }
    }
  }, [isCompleted, id])

  const handleClick = (e: React.MouseEvent) => {
    // Don't process if clicking button or input
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) {
      return
    }

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // Set new timeout for toggle
    clickTimeoutRef.current = setTimeout(() => {
      if (!isCompleted) { // Only trigger animation when completing the task
        const newOffset = Math.floor(Math.random() * 12) - 6
        setLineOffset(newOffset)
        setIsAnimating(true)
        // Store the offset
        sessionStorage.setItem(`task-line-offset-${id}`, newOffset.toString())
      } else {
        // Clean up storage when unchecking
        sessionStorage.removeItem(`task-line-offset-${id}`)
      }
      onToggle(listId, id, !isCompleted)
    }, 200)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Clear the toggle timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    setIsEditing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditedName(taskName)
    }
  }

  const handleSubmit = () => {
    const trimmedName = editedName.trim()
    if (trimmedName !== '' && trimmedName !== taskName) {
      onRename(listId, id, trimmedName)
    } else {
      setEditedName(taskName) // Reset to original if empty or unchanged
    }
    setIsEditing(false)
  }

  // Add new function to handle textarea height
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  return (
    <div 
      onClick={handleClick}
      className="flex items-center justify-center p-2 rounded-md hover:bg-gray-50 group cursor-pointer relative min-h-[40px]"
    >
      <div className="flex-1 min-w-0 text-center">
        {isEditing ? (
          <textarea
            value={editedName}
            onChange={(e) => {
              setEditedName(e.target.value)
              adjustTextareaHeight(e.target)
            }}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              } else if (e.key === 'Escape') {
                setIsEditing(false)
                setEditedName(taskName)
              }
            }}
            className="w-full text-center bg-white border rounded px-2 py-1 resize-none overflow-hidden min-h-[24px] max-h-[200px] break-words hyphens-auto"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            ref={(textarea) => {
              if (textarea) {
                textarea.focus()
                adjustTextareaHeight(textarea)
                textarea.setSelectionRange(editedName.length, editedName.length)
              }
            }}
            rows={1}
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className={`inline-block break-words hyphens-auto relative 
              ${isCompleted ? "text-gray-500" : "text-gray-700"}
              max-w-full`}
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {taskName}
            <span 
              className={`absolute w-[calc(100%+16px)] h-[3px] bg-gradient-to-r from-transparent via-gray-900 to-transparent 
                transform origin-left transition-all duration-100 ease-out pointer-events-none
                ${isCompleted ? 'scale-x-100' : 'scale-x-0'}`}
              style={{
                transformOrigin: '0% 50%',
                left: '-8px',
                top: '50%',
                transform: isCompleted 
                  ? `scaleX(1) rotate(${Math.atan2(lineOffset * 2, 100)}rad)`
                  : 'scaleX(0)',
                opacity: isCompleted ? 1 : 0,
              }}
            />
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(listId, id)
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 p-1 flex-shrink-0 absolute right-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
} 