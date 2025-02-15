"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./button"
import type React from "react" // Added import for React

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => void
  title: string
  placeholder: string
  initialValue?: string
}

export function Modal({ isOpen, onClose, onSubmit, title, placeholder, initialValue = "" }: ModalProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter" && isOpen) {
        onSubmit(value)
        setValue("")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onSubmit, value, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(value)
    setValue("")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autoFocus
          />
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

