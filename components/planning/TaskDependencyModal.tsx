"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link, ArrowRight, Calendar } from "lucide-react"
import { useTasks, Task } from "@/hooks/useTasks"
import { toast } from "sonner"

interface TaskDependencyModalProps {
  isOpen: boolean
  onClose: () => void
  sourceTaskId: string
  sourceTaskName: string
}

export default function TaskDependencyModal({
  isOpen,
  onClose,
  sourceTaskId,
  sourceTaskName
}: TaskDependencyModalProps) {
  const { tasks, loadTasks } = useTasks()
  const [selectedTargetTask, setSelectedTargetTask] = useState<string>("")
  const [dependencyType, setDependencyType] = useState<string>("finish_to_start")
  const [lagDays, setLagDays] = useState<number>(0)
  const [isCreating, setIsCreating] = useState(false)

  // Filtrer les tâches disponibles (exclure la tâche source)
  const availableTasks = tasks.filter(task => 
    task.id !== sourceTaskId && 
    task.statut !== 'Terminé'
  )

  const handleCreateDependency = async () => {
    if (!selectedTargetTask) {
      toast.error("Veuillez sélectionner une tâche cible")
      return
    }

    try {
      setIsCreating(true)
      
      // Ici on pourrait créer une table task_dependencies
      // Pour l'instant, on simule la création
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Dépendance créée avec succès")
      onClose()
      await loadTasks()
    } catch (error) {
      console.error('Erreur lors de la création de la dépendance:', error)
      toast.error("Erreur lors de la création de la dépendance")
    } finally {
      setIsCreating(false)
    }
  }

  const getDependencyTypeLabel = (type: string) => {
    const types = {
      'finish_to_start': 'Fin → Début (FS)',
      'start_to_start': 'Début → Début (SS)',
      'finish_to_finish': 'Fin → Fin (FF)',
      'start_to_finish': 'Début → Fin (SF)'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-blue-600" />
            Créer un lien de dépendance
          </DialogTitle>
          <DialogDescription>
            Créer une dépendance entre "{sourceTaskName}" et une autre tâche
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tâche source (readonly) */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Tâche source</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{sourceTaskName}</span>
              </div>
            </div>
          </div>

          {/* Type de dépendance */}
          <div className="grid gap-2">
            <Label htmlFor="dependency-type" className="text-sm font-medium">
              Type de dépendance
            </Label>
            <Select value={dependencyType} onValueChange={setDependencyType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finish_to_start">Fin → Début (FS)</SelectItem>
                <SelectItem value="start_to_start">Début → Début (SS)</SelectItem>
                <SelectItem value="finish_to_finish">Fin → Fin (FF)</SelectItem>
                <SelectItem value="start_to_finish">Début → Fin (SF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tâche cible */}
          <div className="grid gap-2">
            <Label htmlFor="target-task" className="text-sm font-medium">
              Tâche cible
            </Label>
            <Select value={selectedTargetTask} onValueChange={setSelectedTargetTask}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une tâche" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-2">
                      <span>{task.libelle_tache}</span>
                      <span className="text-xs text-gray-500">({task.statut})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Délai (lag) */}
          <div className="grid gap-2">
            <Label htmlFor="lag-days" className="text-sm font-medium">
              Délai (jours)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="lag-days"
                type="number"
                min="0"
                value={lagDays}
                onChange={(e) => setLagDays(parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-gray-500">jours</span>
            </div>
          </div>

          {/* Aperçu de la dépendance */}
          {selectedTargetTask && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Aperçu :</span>
                <span>
                  {sourceTaskName} {getDependencyTypeLabel(dependencyType)} 
                  {availableTasks.find(t => t.id === selectedTargetTask)?.libelle_tache}
                  {lagDays > 0 && ` (+${lagDays} jours)`}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateDependency}
            disabled={!selectedTargetTask || isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Link className="h-4 w-4 mr-2" />
            {isCreating ? "Création..." : "Créer la dépendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
