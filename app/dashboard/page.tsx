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

const LIST_ORDER_KEY = 'todo-list-order';

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
      // Get saved order from localStorage
      const savedOrder = localStorage.getItem(LIST_ORDER_KEY)
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder)
        // Sort lists according to saved order
        const sortedLists = [...data].sort((a, b) => {
          return orderIds.indexOf(a.id) - orderIds.indexOf(b.id)
        })
        setLists(sortedLists)
      } else {
        setLists(data)
      }
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
      setLists(currentLists => {
        const updatedLists = [...currentLists, { ...newList, tasks: [] }]
        const newOrder = updatedLists.map(list => list.id)
        localStorage.setItem(LIST_ORDER_KEY, JSON.stringify(newOrder))
        return updatedLists
      })
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

  const handleRenameTask = async (listId: string, taskId: string, newName: string) => {
    const response = await fetch(`/api/task/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName: newName }),
    })
    if (response.ok) {
      setLists(
        lists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: list.tasks.map((task) => {
                if (task.id === taskId) {
                  return { ...task, taskName: newName }
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

  const handleReorder = (newOrder: { id: string }[]) => {
    const reorderedLists = newOrder.map(({id}) => 
      lists.find(list => list.id === id)!
    );
    setLists([...reorderedLists]);
    localStorage.setItem(LIST_ORDER_KEY, JSON.stringify(newOrder.map(item => item.id)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header />
      <main className="flex-1 p-4 flex justify-center">
        <div className="w-full max-w-7xl bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 my-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">My Lists</h1>
            <Button 
              onClick={() => setIsCreateListModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Create List
            </Button>
          </div>

          <div className="w-full">
            <MasonryGrid 
              columnWidth={350} 
              gutter={16}
              items={lists}
              onReorder={handleReorder}
            >
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
                  onRenameTask={handleRenameTask}
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
        </div>
      </main>
    </div>
  )
}

