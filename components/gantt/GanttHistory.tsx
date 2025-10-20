"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, History } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HistoryState {
  tasks: any[]
  timestamp: number
}

interface GanttHistoryProps {
  tasks: any[]
  onStateChange?: (tasks: any[]) => void
}

export function useGanttHistory(initialTasks: any[]) {
  const [history, setHistory] = useState<HistoryState[]>([
    { tasks: initialTasks, timestamp: Date.now() },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUndo, setIsUndo] = useState(false)
  const [isRedo, setIsRedo] = useState(false)

  const currentState = history[currentIndex]

  const addToHistory = useCallback(
    (newTasks: any[]) => {
      // Ne pas ajouter si c'est un undo/redo
      if (isUndo || isRedo) {
        setIsUndo(false)
        setIsRedo(false)
        return
      }

      // Supprimer les états après l'index actuel (si on a fait undo)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push({ tasks: newTasks, timestamp: Date.now() })

      // Limiter l'historique à 50 états
      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setCurrentIndex(newHistory.length - 1)
      }

      setHistory(newHistory)
    },
    [history, currentIndex, isUndo, isRedo]
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setIsUndo(true)
      setCurrentIndex(currentIndex - 1)
      return true
    }
    return false
  }, [currentIndex])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setIsRedo(true)
      setCurrentIndex(currentIndex + 1)
      return true
    }
    return false
  }, [currentIndex, history.length])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    currentState: currentState?.tasks || [],
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
  }
}

export default function GanttHistory({ tasks, onStateChange }: GanttHistoryProps) {
  const { currentState, addToHistory, undo, redo, canUndo, canRedo, historyLength } =
    useGanttHistory(tasks)

  // Ajouter à l'historique quand les tâches changent
  useEffect(() => {
    if (tasks !== currentState) {
      addToHistory(tasks)
    }
  }, [tasks])

  // Notifier le parent du changement d'état
  useEffect(() => {
    if (onStateChange && currentState !== tasks) {
      onStateChange(currentState)
    }
  }, [currentState])

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title="Refaire (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
      <Badge variant="secondary" className="px-2 py-1 text-xs">
        <History className="h-3 w-3 mr-1" />
        {historyLength}
      </Badge>
    </div>
  )
}

