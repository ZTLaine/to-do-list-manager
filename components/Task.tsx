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

  // Update editedName when taskName prop changes
  useEffect(() => {
    setEditedName(taskName)
  }, [taskName])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

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
      onToggle(listId, id, !isCompleted)
    }, 200) // 200ms is typically a good duration for double-click detection
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
      className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 group cursor-pointer relative"
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={(e) => onToggle(listId, id, e.target.checked)}
        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1.5 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
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
            className="w-full bg-white border rounded px-2 py-1 resize-none overflow-hidden min-h-[24px] max-h-[200px] break-words hyphens-auto"
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
            className={`block break-words hyphens-auto relative ${
              isCompleted ? "text-gray-500" : "text-gray-700"
            }`}
          >
            {taskName}
            <span 
              className={`absolute left-0 top-1/2 w-full h-[1.5px] bg-gradient-to-r from-gray-500 via-gray-500 to-transparent 
                transform origin-left transition-transform duration-300 ease-out
                ${isCompleted ? 'scale-x-100' : 'scale-x-0'}`}
              style={{
                transformOrigin: '0% 50%',
                marginLeft: '-4px', // Starts slightly before text
                width: 'calc(100% + 8px)', // Extends slightly after text
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
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
} 