"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GanttChart, ZoomIn, ZoomOut, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"
import { useGanttHistory } from "./GanttHistory"
import GanttAutoSave from "./GanttAutoSave"

// Import du CSS de Frappe-Gantt
import "frappe-gantt/dist/frappe-gantt.css"

// Types
interface GanttTask {
  id: string
  text: string
  start_date: string
  duration: number
  progress: number
  type: string
  parent?: string
  open?: boolean
}

interface GanttProps {
  tasks: any[]
  onTaskUpdate?: (task: any) => void
  zoomLevel?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
}

export default function GanttInteractive({ tasks, onTaskUpdate, zoomLevel: externalZoomLevel, onZoomIn, onZoomOut }: GanttProps) {
  const ganttRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(externalZoomLevel || 1)
  const [isLoading, setIsLoading] = useState(false)
  const [localTasks, setLocalTasks] = useState(tasks)
  
  // Synchroniser le zoomLevel externe
  useEffect(() => {
    if (externalZoomLevel !== undefined) {
      setZoomLevel(externalZoomLevel)
    }
  }, [externalZoomLevel])
  
  // Synchroniser localTasks avec tasks
  useEffect(() => {
    console.log('📥 Tâches reçues dans GanttInteractive:', tasks)
    console.log('📊 Nombre de tâches:', tasks.length)
    setLocalTasks(tasks)
  }, [tasks])
  
  // Historique
  const { currentState, addToHistory, undo, redo, canUndo, canRedo } = useGanttHistory(tasks)

  // Convertir les tâches au format Frappe-Gantt
  const convertToGanttTasks = (tasks: any[]): GanttTask[] => {
    console.log('🔄 Conversion des tâches, nombre total:', tasks.length)
    
    // Filtrer les tâches qui ont des dates valides et un libellé
    const validTasks = tasks.filter(task => 
      task.date_debut_plan && 
      task.date_fin_plan &&
      task.libelle_tache &&
      !isNaN(new Date(task.date_debut_plan).getTime()) &&
      !isNaN(new Date(task.date_fin_plan).getTime())
    )
    
    console.log('✅ Tâches valides après filtrage:', validTasks.length)
    
    const ganttTasks = validTasks.map((task) => {
      const converted = {
        id: task.id,
        text: task.libelle_tache || `Tâche ${task.id}`,
        start_date: task.date_debut_plan,
        duration: Math.ceil(
          (new Date(task.date_fin_plan).getTime() - new Date(task.date_debut_plan).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        progress: (task.avancement_pct || 0) / 100,
        type: task.statut === "Terminé" ? "milestone" : "task",
        parent: task.lot_id,
        open: true,
      }
      console.log('📋 Tâche convertie:', converted)
      return converted
    })
    
    return ganttTasks
  }

  // Raccourcis clavier (Undo/Redo/Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if ((e.key === "y" || (e.key === "z" && e.shiftKey)) && canRedo) {
          e.preventDefault()
          redo()
        } else if (e.key === "s") {
          e.preventDefault()
          handleSave()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, canRedo])

  // Initialiser le Gantt
  useEffect(() => {
    if (!ganttRef.current || localTasks.length === 0) return

    // Charger Frappe-Gantt dynamiquement
    import("frappe-gantt").then((module) => {
      const Gantt = module.default
      
      // Détruire l'instance précédente si elle existe
      if ((ganttRef.current as any)?.ganttInstance) {
        const previousGantt = (ganttRef.current as any).ganttInstance
        if (previousGantt.destroy) {
          previousGantt.destroy()
        }
        // Nettoyer le contenu du conteneur
        if (ganttRef.current) {
          ganttRef.current.innerHTML = ''
        }
      }
      
      const ganttTasks = convertToGanttTasks(localTasks)

      // Ne pas initialiser le Gantt s'il n'y a pas de tâches valides
      if (ganttTasks.length === 0) {
        console.log('Aucune tâche valide à afficher dans le Gantt')
        return
      }

      console.log('📊 Tâches Gantt:', ganttTasks)

      const gantt = new Gantt(ganttRef.current!, ganttTasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ["Day", "Week", "Month"],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        popup_trigger: "click",
        on_click: (task: any) => {
          console.log("Task clicked:", task)
        },
        on_date_change: (task: any, start: Date, end: Date) => {
          console.log("Task date changed:", task, start, end)
          handleTaskUpdate(task, start, end)
        },
        on_progress_change: (task: any, progress: number) => {
          console.log("Task progress changed:", task, progress)
          handleProgressUpdate(task, progress)
        },
        on_view_change: (mode: string) => {
          console.log("View mode changed:", mode)
        },
      })

      // Stocker l'instance du Gantt pour pouvoir la manipuler
      ;(ganttRef.current as any).ganttInstance = gantt
    })

    // Cleanup: détruire l'instance du Gantt quand le composant se démonte
    return () => {
      if ((ganttRef.current as any)?.ganttInstance) {
        const previousGantt = (ganttRef.current as any).ganttInstance
        if (previousGantt.destroy) {
          previousGantt.destroy()
        }
        // Nettoyer le contenu du conteneur
        if (ganttRef.current) {
          ganttRef.current.innerHTML = ''
        }
      }
    }
  }, [localTasks])

  // Gérer la mise à jour d'une tâche
  const handleTaskUpdate = async (task: any, start: Date, end: Date) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gantt/update-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          date_debut_plan: start.toISOString().split("T")[0],
          date_fin_plan: end.toISOString().split("T")[0],
        }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.message || "Erreur lors de la mise à jour")
        // Recharger le Gantt pour annuler les changements
        if (ganttRef.current) {
          const gantt = (ganttRef.current as any).ganttInstance
          if (gantt) {
            gantt.refresh(tasks)
          }
        }
      } else {
        toast.success("Tâche mise à jour avec succès")
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, date_debut_plan: start, date_fin_plan: end })
        }
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Erreur lors de la mise à jour de la tâche")
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer la mise à jour du progrès
  const handleProgressUpdate = async (task: any, progress: number) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gantt/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          avancement_pct: progress * 100,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.message || "Erreur lors de la mise à jour")
      } else {
        toast.success("Progression mise à jour avec succès")
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, avancement_pct: progress * 100 })
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast.error("Erreur lors de la mise à jour de la progression")
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarder
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Sauvegarder toutes les tâches modifiées
      for (const task of localTasks) {
        await fetch("/api/gantt/update-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: task.id,
            date_debut_plan: task.date_debut_plan,
            date_fin_plan: task.date_fin_plan,
          }),
        })
      }
      addToHistory(localTasks)
      toast.success("Modifications sauvegardées")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  // Réinitialiser
  const handleReset = () => {
    if (ganttRef.current) {
      const gantt = (ganttRef.current as any).ganttInstance
      if (gantt) {
        gantt.refresh(tasks)
        toast.info("Gantt réinitialisé")
      }
    }
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <GanttChart className="h-5 w-5 text-blue-600" />
              Gantt Interactif
            </CardTitle>
            <CardDescription>
              Planification visuelle avec drag & drop
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo || isLoading}
              title="Annuler (Ctrl+Z)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo || isLoading}
              title="Refaire (Ctrl+Y)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Synchronisation...</span>
              </div>
            </div>
          )}
          <div
            ref={ganttRef}
            className="gantt-container"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              height: "600px",
              overflow: "auto",
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

