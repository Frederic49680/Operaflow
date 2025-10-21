"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

  const handleSubTask = async () => {
    try {
      const subTaskName = prompt("Nom de la sous-tâche :")
      if (!subTaskName) return

      await createSubTask(task.id, {
        libelle_tache: subTaskName,
        statut: 'Non lancé',
        avancement_pct: 0
      })
      
      onSubTask?.(task.id)
    } catch (error) {
      console.error('Erreur lors de la création de la sous-tâche:', error)
    }
  }

  const canCreateSubTask = task.level < 3

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
        onClick={() => onAssignResource?.(task.id)}
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
    </div>
  )
}
