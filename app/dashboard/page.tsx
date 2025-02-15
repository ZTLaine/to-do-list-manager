"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { ChevronUp, ChevronDown, Plus, Loader2, Trash2 } from "lucide-react"
import { TodoList } from "@/components/TodoList"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { MasonryGrid } from "@/components/MasonryGrid"
import { Header } from "@/components/Header"

interface Task {
  id: string
  taskName: string
  isCompleted: boolean
}

interface UserList {
  id: string
  name: string
  tasks: Task[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lists, setLists] = useState<UserList[]>([])
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false)
  const [createTaskModalList, setCreateTaskModalList] = useState<string | null>(null)
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchLists()
    }
  }, [session])

  const fetchLists = async () => {
    const response = await fetch("/api/userlist")
    if (response.ok) {
      const data = await response.json()
      setLists(data)
    }
  }

  const handleCreateList = async (name: string) => {
    const response = await fetch("/api/userlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (response.ok) {
      const newList = await response.json()
      setLists((currentLists) => [...currentLists, { ...newList, tasks: [] }])
      setIsCreateListModalOpen(false)
    }
  }

  const handleCreateTask = async (taskName: string) => {
    if (!createTaskModalList) return

    const response = await fetch("/api/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName, userListId: createTaskModalList }),
    })
    if (response.ok) {
      const newTask = await response.json()
      setLists(
        lists.map((list) => {
          if (list.id === createTaskModalList) {
            return {
              ...list,
              tasks: [...list.tasks, newTask],
            }
          }
          return list
        }),
      )
      setCreateTaskModalList(null)
    }
  }

  const toggleTaskCompletion = async (listId: string, taskId: string, isCompleted: boolean) => {
    const response = await fetch(`/api/task/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted }),
    })
    if (response.ok) {
      setLists(
        lists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: list.tasks.map((task) => {
                if (task.id === taskId) {
                  return { ...task, isCompleted }
                }
                return task
              }),
            }
          }
          return list
        }),
      )
    }
  }

  const toggleListExpansion = (listId: string) => {
    setExpandedLists((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(listId)) {
        newSet.delete(listId)
      } else {
        newSet.add(listId)
      }
      return newSet
    })
  }

  const handleDeleteTask = async (listId: string, taskId: string) => {
    const response = await fetch(`/api/task/${taskId}`, {
      method: "DELETE",
    })
    if (response.ok) {
      setLists(
        lists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: list.tasks.filter((task) => task.id !== taskId),
            }
          }
          return list
        }),
      )
    }
  }

  const handleDeleteList = async (listId: string) => {
    const response = await fetch(`/api/userlist/${listId}`, {
      method: "DELETE",
    })
    if (response.ok) {
      setLists(lists.filter((list) => list.id !== listId))
    }
  }

  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setLists((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">My Lists</h1>
          <Button onClick={() => setIsCreateListModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create List
          </Button>
        </div>

        <div className="w-full">
          <MasonryGrid columnWidth={350} gutter={16}>
            {lists.map((list) => (
              <TodoList
                key={list.id}
                {...list}
                isExpanded={expandedLists.has(list.id)}
                onToggleExpand={toggleListExpansion}
                onDeleteList={handleDeleteList}
                onDeleteTask={handleDeleteTask}
                onToggleTask={toggleTaskCompletion}
                onAddTask={setCreateTaskModalList}
              />
            ))}
          </MasonryGrid>
        </div>

        <Modal
          isOpen={isCreateListModalOpen}
          onClose={() => setIsCreateListModalOpen(false)}
          onSubmit={handleCreateList}
          title="Create New List"
          placeholder="Enter list name..."
        />

        <Modal
          isOpen={createTaskModalList !== null}
          onClose={() => setCreateTaskModalList(null)}
          onSubmit={handleCreateTask}
          title="Create New Task"
          placeholder="Enter task description..."
        />
      </main>
    </div>
  )
}

