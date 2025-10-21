"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GripVertical,
  Calendar,
  Clock,
  User,
  Target,
  AlertTriangle,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Task } from "@/hooks/useTasks"
import TaskActionButtons from "./TaskActionButtons"
import { formatDate } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onSubTask?: (parentId: string) => void
  onLink?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onAssignResource?: (taskId: string) => void
  onToggleExpand?: (taskId: string) => void
  isExpanded?: boolean
  hasChildren?: boolean
}

export default function TaskCard({
  task,
  onEdit,
  onSubTask,
  onLink,
  onDelete,
  onAssignResource,
  onToggleExpand,
  isExpanded = false,
  hasChildren = false
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Terminé':
        return 'bg-green-100 text-green-800'
      case 'En cours':
        return 'bg-blue-100 text-blue-800'
      case 'Bloqué':
        return 'bg-red-100 text-red-800'
      case 'Reporté':
        return 'bg-orange-100 text-orange-800'
      case 'Non lancé':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (niveau: number) => {
    switch (niveau) {
      case 0:
        return 'bg-purple-100 text-purple-800'
      case 1:
        return 'bg-blue-100 text-blue-800'
      case 2:
        return 'bg-green-100 text-green-800'
      case 3:
        return 'bg-orange-100 text-orange-800'
      case 4:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isHovered ? 'ring-2 ring-blue-200' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {/* Bouton d'expansion pour les tâches avec enfants */}
            {hasChildren && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleExpand?.(task.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Icône de niveau */}
            <div className="p-1 bg-gray-100 rounded">
              <GripVertical className="h-4 w-4 text-gray-600" />
            </div>

            {/* Titre de la tâche */}
            <div className="flex-1">
              <CardTitle className="text-lg">{task.libelle_tache}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getLevelColor(task.niveau)}>
                  Niveau {task.niveau}
                </Badge>
                <Badge variant="outline" className={getStatusColor(task.statut)}>
                  {task.statut}
                </Badge>
                {task.affaire && (
                  <Badge variant="outline">
                    {task.affaire.code_affaire}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <TaskActionButtons
            task={task}
            onEdit={onEdit}
            onSubTask={onSubTask}
            onLink={onLink}
            onDelete={onDelete}
            onAssignResource={onAssignResource}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Informations de la tâche */}
        <div className="space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {task.date_debut_plan && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Début: {formatDate(task.date_debut_plan)}</span>
              </div>
            )}
            {task.date_fin_plan && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Fin: {formatDate(task.date_fin_plan)}</span>
              </div>
            )}
          </div>

          {/* Durée et effort */}
          {(task.effort_plan_h || task.effort_reel_h) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {task.effort_plan_h && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Planifié: {task.effort_plan_h}h</span>
                </div>
              )}
              {task.effort_reel_h && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Réel: {task.effort_reel_h}h</span>
                </div>
              )}
            </div>
          )}

          {/* Avancement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avancement</span>
              <span className="font-medium">{task.avancement_pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(task.avancement_pct, 100)}%` }}
              />
            </div>
          </div>

          {/* Ressources assignées */}
          {task.ressources && task.ressources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Ressources:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {task.ressources.map((ressource) => (
                  <Badge key={ressource.id} variant="secondary" className="text-xs">
                    {ressource.prenom} {ressource.nom}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Site */}
          {task.site && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>Site: {task.site.nom} ({task.site.code_site})</span>
            </div>
          )}

          {/* Alertes */}
          {task.statut === 'Bloqué' && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Tâche bloquée</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
