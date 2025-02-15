import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from "@/components/Task"

interface Task {
  id: string
  taskName: string
  isCompleted: boolean
}

interface TodoListProps {
  id: string
  name: string
  tasks: Task[]
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onDeleteList: (id: string) => void
  onDeleteTask: (listId: string, taskId: string) => void
  onToggleTask: (listId: string, taskId: string, isCompleted: boolean) => void
  onAddTask: (listId: string) => void
  onRenameTask: (listId: string, taskId: string, newName: string) => void
}

export function TodoList({
  id,
  name,
  tasks,
  isExpanded,
  onToggleExpand,
  onDeleteList,
  onDeleteTask,
  onToggleTask,
  onAddTask,
  onRenameTask,
}: TodoListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={{
        ...style,
        maxWidth: '100%',
        width: '100%'
      }}
      className="bg-white shadow rounded-lg h-fit"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <div {...attributes} {...listeners} className="cursor-move flex-grow">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleExpand(id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDeleteList(id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 transition-all duration-2000 ease-in-out">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Task
                  key={task.id}
                  {...task}
                  listId={id}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onRename={onRenameTask}
                />
              ))
            ) : (
              <p className="text-gray-500 italic">No tasks yet</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddTask(id)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 