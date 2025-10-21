"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Link, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  User,
  Target,
  Search,
  Filter
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useTasks, Task } from "@/hooks/useTasks"
import TaskCard from "./TaskCard"
import NewTaskButton from "./NewTaskButton"

// Types - Task est maintenant importé du hook useTasks

interface TaskTileProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleExpand: (taskId: string) => void
  onAddChild: (parentId: string) => void
  onAddLink: (taskId: string) => void
  conflicts?: any[]
}

// Composant Tile individuelle
function TaskTile({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleExpand, 
  onAddChild, 
  onAddLink,
  conflicts = []
}: TaskTileProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasConflicts = conflicts.some(c => c.task_id === task.id)
  const hasChildren = task.enfants && task.enfants.length > 0
  const levelColors = [
    "bg-blue-50 border-blue-200", // Niveau 0 - Projet
    "bg-green-50 border-green-200", // Niveau 1 - Phase
    "bg-orange-50 border-orange-200", // Niveau 2 - Tâche
    "bg-purple-50 border-purple-200", // Niveau 3 - Sous-tâche
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border rounded-lg p-4 mb-2 transition-all ${
        levelColors[task.niveau] || "bg-gray-50 border-gray-200"
      } ${hasConflicts ? "ring-2 ring-red-300" : ""}`}
    >
      {/* Indicateur de niveau */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: task.niveau }).map((_, i) => (
            <div key={i} className="w-4 h-0.5 bg-gray-300" />
          ))}
        </div>
        
        {/* Bouton expand/collapse pour les tâches avec enfants */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(task.id)}
            className="p-1 h-6 w-6"
          >
            {expandedTasks.has(task.id) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {/* Handle de drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Badge de niveau */}
        <Badge variant="outline" className="text-xs">
          {task.niveau === 0 ? "Projet" : 
            task.niveau === 1 ? "Phase" : 
            task.niveau === 2 ? "Tâche" : "Sous-tâche"}
        </Badge>

        {/* Badge de statut */}
        <Badge 
          variant={
            task.statut === "Terminé" ? "default" :
            task.statut === "En cours" ? "secondary" :
            task.statut === "Bloqué" ? "destructive" : "outline"
          }
        >
          {task.statut}
        </Badge>

        {/* Badge de conflit */}
        {hasConflicts && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Conflit
          </Badge>
        )}

        {/* Badge milestone */}
        {task.is_milestone && (
          <Badge variant="outline" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Jalon
          </Badge>
        )}
      </div>

      {/* Contenu de la tâche */}
      <div className="ml-6">
        <h3 className="font-medium text-gray-900 mb-2">{task.libelle_tache}</h3>
        
        {/* Informations de la tâche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{task.date_debut_plan ? formatDate(task.date_debut_plan) : 'Non définie'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{task.date_fin_plan ? formatDate(task.date_fin_plan) : 'Non définie'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.avancement_pct}%</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{task.ressource_ids?.length || 0} ressource(s)</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.avancement_pct}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Modifier
          </Button>
          
          {task.niveau < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddChild(task.id)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Sous-tâche
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLink(task.id)}
          >
            <Link className="h-3 w-3 mr-1" />
            Lien
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function TuilesTaches() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [conflicts, setConflicts] = useState<any[]>([])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Charger les tâches
  useEffect(() => {
    loadTasks()
    loadConflicts()
  }, [])

  // Filtrer les tâches
  useEffect(() => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.libelle_tache.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter(task => task.niveau === parseInt(selectedLevel))
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(task => task.statut === selectedStatus)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, selectedLevel, selectedStatus])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('v_tasks_hierarchy')
        .select('*')
        .order('order_index')

      if (error) throw error

      // Organiser en hiérarchie
      const taskMap = new Map<string, Task>()
      const rootTasks: Task[] = []

      data?.forEach((task: any) => {
        const taskWithChildren: Task = {
          ...task,
          children: [],
          expanded: true
        }
        taskMap.set(task.id, taskWithChildren)
      })

      // Construire la hiérarchie
      taskMap.forEach((task) => {
        if (task.parent_id) {
          const parent = taskMap.get(task.parent_id)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(task)
          }
        } else {
          rootTasks.push(task)
        }
      })

      setTasks(rootTasks)
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
      toast.error("Erreur lors du chargement des tâches")
    } finally {
      setLoading(false)
    }
  }

  const loadConflicts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('v_resource_conflicts')
        .select('*')

      if (error) throw error
      setConflicts(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des conflits:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    try {
      const supabase = createClient()
      
      // Mettre à jour l'ordre dans la base de données
      const { error } = await supabase
        .from('planning_taches')
        .update({ order_index: Date.now() })
        .eq('id', active.id)

      if (error) throw error

      toast.success("Ordre mis à jour")
      loadTasks()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleEdit = (task: Task) => {
    // TODO: Ouvrir modal d'édition
    console.log('Édition de la tâche:', task)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('planning_taches')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      toast.success("Tâche supprimée")
      loadTasks()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleToggleExpand = (taskId: string) => {
    setTasks(prevTasks => 
      updateTaskExpansion(prevTasks, taskId)
    )
  }

  const updateTaskExpansion = (tasks: Task[], taskId: string): Task[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, expanded: !task.expanded }
      }
      if (task.children) {
        return { ...task, children: updateTaskExpansion(task.children, taskId) }
      }
      return task
    })
  }

  const handleAddChild = (parentId: string) => {
    // TODO: Ouvrir modal de création de sous-tâche
    console.log('Ajout de sous-tâche pour:', parentId)
  }

  const handleAddLink = (taskId: string) => {
    // TODO: Ouvrir modal de création de lien
    console.log('Ajout de lien pour:', taskId)
  }

  const renderTasks = (tasks: Task[], level = 0) => {
    return tasks.map(task => (
      <div key={task.id}>
        <SortableContext items={[task.id]} strategy={verticalListSortingStrategy}>
          <TaskTile
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleExpand={handleToggleExpand}
            onAddChild={handleAddChild}
            onAddLink={handleAddLink}
            conflicts={conflicts}
          />
        </SortableContext>
        
        {/* Rendu récursif des enfants */}
        {task.children && task.children.length > 0 && task.expanded && (
          <div className="ml-4">
            {renderTasks(task.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            Tuiles Tâches (4 niveaux)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les niveaux</option>
              <option value="0">Projets</option>
              <option value="1">Phases</option>
              <option value="2">Tâches</option>
              <option value="3">Sous-tâches</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="Non lancé">Non lancé</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Bloqué">Bloqué</option>
              <option value="Reporté">Reporté</option>
            </select>

            <Button onClick={() => {/* TODO: Ouvrir modal de création */}}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone de drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {renderTasks(filteredTasks)}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              {/* Rendu de la tâche en cours de drag */}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Message si aucune tâche */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Aucune tâche trouvée</p>
            <Button className="mt-4" onClick={() => {/* TODO: Créer première tâche */}}>
              <Plus className="h-4 w-4 mr-2" />
              Créer votre première tâche
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
