import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
      style={style}
      className="bg-white shadow rounded-lg h-fit w-full"
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
          <div className="space-y-3">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 group"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={(e) => onToggleTask(id, task.id, e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span
                    className={`flex-grow ${task.isCompleted ? "line-through text-gray-500" : "text-gray-700"}`}
                  >
                    {task.taskName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(id, task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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