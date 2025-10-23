"use client"

import { useState } from "react"
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
  Edit, 
  Plus, 
  Link, 
  Trash2,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { Task } from "@/hooks/useTasks"
import { toast } from "sonner"
import TaskAssignmentModal from "./TaskAssignmentModal"

interface TaskActionButtonsProps {
  task: Task
  onEdit?: (task: Task) => void
  onSubTask?: (parentId: string) => void
  onLink?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onAssignResource?: (taskId: string) => void
}

export default function TaskActionButtons({ 
  task, 
  onEdit, 
  onSubTask, 
  onLink, 
  onDelete,
  onAssignResource 
}: TaskActionButtonsProps) {
  const { deleteTask, createSubTask } = useTasks()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSubTaskModal, setShowSubTaskModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [subTaskName, setSubTaskName] = useState("")

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.libelle_tache}" ?`)) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTask(task.id)
      onDelete?.(task.id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubTask = () => {
    setShowSubTaskModal(true)
  }

  const handleCreateSubTask = async () => {
    if (!subTaskName.trim()) {
      toast.error("Le nom de la sous-tâche est requis")
      return
    }

    try {
      await createSubTask(task.id, {
        libelle_tache: subTaskName.trim(),
        statut: 'Non lancé',
        avancement_pct: 0
      })
      
      setShowSubTaskModal(false)
      setSubTaskName("")
      onSubTask?.(task.id)
      toast.success("Sous-tâche créée avec succès")
    } catch (error) {
      console.error('Erreur lors de la création de la sous-tâche:', error)
      toast.error("Erreur lors de la création de la sous-tâche")
    }
  }

  const handleCancelSubTask = () => {
    setShowSubTaskModal(false)
    setSubTaskName("")
  }

  const handleAssignResource = () => {
    setShowAssignmentModal(true)
  }

  const canCreateSubTask = true // Hiérarchie désactivée - colonne level n'existe pas

  return (
    <div className="flex gap-1">
      {/* Bouton Modifier */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit?.(task)}
        className="h-8 px-2"
      >
        <Edit className="h-3 w-3" />
      </Button>

      {/* Bouton Sous-tâche */}
      {canCreateSubTask && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSubTask}
          className="h-8 px-2"
          title="Créer une sous-tâche"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}

      {/* Bouton Lien */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onLink?.(task.id)}
        className="h-8 px-2"
        title="Créer un lien de dépendance"
      >
        <Link className="h-3 w-3" />
      </Button>

            {/* Bouton Assigner Ressource */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAssignResource}
              className="h-8 px-2"
              title="Assigner une ressource"
            >
              <User className="h-3 w-3" />
            </Button>

      {/* Bouton Supprimer */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Supprimer la tâche"
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      {/* Modal de création de sous-tâche */}
      <Dialog open={showSubTaskModal} onOpenChange={setShowSubTaskModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Créer une sous-tâche
            </DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle sous-tâche à "{task.libelle_tache}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subtask-name" className="text-sm font-medium">
                Nom de la sous-tâche
              </Label>
              <Input
                id="subtask-name"
                value={subTaskName}
                onChange={(e) => setSubTaskName(e.target.value)}
                placeholder="Saisissez le nom de la sous-tâche..."
                className="w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSubTask()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelSubTask}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateSubTask}
              disabled={!subTaskName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'affectation de ressource */}
      <TaskAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        task={task}
        onAssignmentComplete={() => {
          setShowAssignmentModal(false)
          onAssignResource?.(task.id)
        }}
      />
    </div>
  )
}
