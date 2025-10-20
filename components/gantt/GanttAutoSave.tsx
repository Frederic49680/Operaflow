"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Save, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GanttAutoSaveProps {
  tasks: any[]
  onSave?: (tasks: any[]) => Promise<void>
  interval?: number // en millisecondes
}

export default function GanttAutoSave({
  tasks,
  onSave,
  interval = 30000, // 30 secondes par défaut
}: GanttAutoSaveProps) {
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fonction de sauvegarde
  const save = useCallback(async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(tasks)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error auto-saving:", error)
      toast.error("Erreur lors de la sauvegarde automatique")
    } finally {
      setIsSaving(false)
    }
  }, [tasks, onSave])

  // Auto-save périodique
  useEffect(() => {
    if (!onSave) return

    const intervalId = setInterval(() => {
      if (hasUnsavedChanges) {
        save()
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [hasUnsavedChanges, interval, save, onSave])

  // Sauvegarde avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Détecter les changements
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [tasks])

  // Sauvegarde manuelle
  const handleManualSave = async () => {
    await save()
    toast.success("Modifications sauvegardées")
  }

  // Formater la date de dernière sauvegarde
  const formatLastSaved = () => {
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) {
      return `Il y a ${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `Il y a ${minutes}min`
    } else {
      const hours = Math.floor(seconds / 3600)
      return `Il y a ${hours}h`
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isSaving ? (
        <Badge variant="secondary" className="px-2 py-1 text-xs">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Sauvegarde...
        </Badge>
      ) : hasUnsavedChanges ? (
        <Badge variant="outline" className="px-2 py-1 text-xs border-orange-300 text-orange-700">
          <Clock className="h-3 w-3 mr-1" />
          Modifications non sauvegardées
        </Badge>
      ) : (
        <Badge variant="secondary" className="px-2 py-1 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
          {formatLastSaved()}
        </Badge>
      )}
      <button
        onClick={handleManualSave}
        disabled={isSaving || !hasUnsavedChanges}
        className="text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center gap-1"
        title="Sauvegarder maintenant (Ctrl+S)"
      >
        <Save className="h-3 w-3" />
        Sauvegarder
      </button>
    </div>
  )
}

