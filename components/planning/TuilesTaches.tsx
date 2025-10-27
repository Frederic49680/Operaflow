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
        task.level === 0 ? "bg-blue-50 border-blue-200" :
        task.level === 1 ? "bg-green-50 border-green-200" :
        task.level === 2 ? "bg-yellow-50 border-yellow-200" :
        task.level === 3 ? "bg-orange-50 border-orange-200" :
        "bg-gray-50 border-gray-200"
      } ${hasConflicts ? "ring-2 ring-red-300" : ""}`}
    >
      {/* Indicateur de niveau */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {task.level !== undefined && (
            <span className="text-xs font-medium text-gray-600">
              Niveau {task.level}
            </span>
          )}
          {task.is_milestone && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              🎯 Jalón
            </span>
          )}
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
          {task.type_tache || "Tâche"}
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
          
          {task.level !== undefined && task.level < 3 && (
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
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
      const level = parseInt(selectedLevel)
      filtered = filtered.filter(task => task.level === level)
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
          enfants: [],
          expanded: true
        }
        taskMap.set(task.id, taskWithChildren)
      })

      // Construire la hiérarchie
      taskMap.forEach((task) => {
        if (task.parent_id) {
          const parent = taskMap.get(task.parent_id)
          if (parent) {
            parent.enfants = parent.enfants || []
            parent.enfants.push(task)
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
    setEditingTask(task)
    setShowEditModal(true)
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
      if (task.enfants) {
        return { ...task, enfants: updateTaskExpansion(task.enfants, taskId) }
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
        {task.enfants && task.enfants.length > 0 && task.expanded && (
          <div className="ml-4">
            {renderTasks(task.enfants, level + 1)}
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

      {/* Modal d'édition de tâche */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Modifier la tâche
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de la tâche</label>
                  <Input
                    id="edit-libelle"
                    defaultValue={editingTask.libelle_tache}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    id="edit-statut"
                    defaultValue={editingTask.statut}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Non lancé">Non lancé</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Bloqué">Bloqué</option>
                    <option value="Reporté">Reporté</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Avancement (%)</label>
                  <Input
                    id="edit-avancement"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingTask.avancement_pct}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type de tâche</label>
                  <select
                    id="edit-type"
                    defaultValue={editingTask.type_tache || "Autre"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Préparation">Préparation</option>
                    <option value="Exécution">Exécution</option>
                    <option value="Contrôle">Contrôle</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date début</label>
                  <Input
                    id="edit-date-debut"
                    type="date"
                    defaultValue={editingTask.date_debut_plan || ""}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date fin</label>
                  <Input
                    id="edit-date-fin"
                    type="date"
                    defaultValue={editingTask.date_fin_plan || ""}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Effort planifié (heures)</label>
                  <Input
                    id="edit-effort"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={editingTask.effort_plan_h || 0}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Niveau hiérarchique</label>
                  <select
                    id="task-level"
                    defaultValue={editingTask.level || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="0">0 - Racine</option>
                    <option value="1">1 - Sous-tâche</option>
                    <option value="2">2 - Sous-sous-tâche</option>
                    <option value="3">3 - Sous-sous-sous-tâche</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!editingTask) return
                    
                    // Récupérer toutes les valeurs du formulaire
                    const libelleInput = document.getElementById('edit-libelle') as HTMLInputElement
                    const statutSelect = document.getElementById('edit-statut') as HTMLSelectElement
                    const avancementInput = document.getElementById('edit-avancement') as HTMLInputElement
                    const typeSelect = document.getElementById('edit-type') as HTMLSelectElement
                    const dateDebutInput = document.getElementById('edit-date-debut') as HTMLInputElement
                    const dateFinInput = document.getElementById('edit-date-fin') as HTMLInputElement
                    const effortInput = document.getElementById('edit-effort') as HTMLInputElement
                    const levelSelect = document.getElementById('task-level') as HTMLSelectElement
                    
                    const updates: any = {
                      libelle_tache: libelleInput?.value || editingTask.libelle_tache,
                      statut: statutSelect?.value || editingTask.statut,
                      avancement_pct: avancementInput ? parseInt(avancementInput.value) : editingTask.avancement_pct || 0,
                      type_tache: typeSelect?.value || editingTask.type_tache,
                      date_debut_plan: dateDebutInput?.value || editingTask.date_debut_plan,
                      date_fin_plan: dateFinInput?.value || editingTask.date_fin_plan,
                      effort_plan_h: effortInput ? parseFloat(effortInput.value) : editingTask.effort_plan_h || 0,
                      level: levelSelect ? parseInt(levelSelect.value) : editingTask.level || 0
                    }
                    
                    const supabase = createClient()
                    const { error } = await supabase
                      .from('planning_taches')
                      .update(updates)
                      .eq('id', editingTask.id)
                    
                    if (error) throw error
                    
                    toast.success("Tâche modifiée avec succès")
                    setShowEditModal(false)
                    loadTasks()
                  } catch (error) {
                    console.error('Erreur lors de la modification:', error)
                    toast.error("Erreur lors de la modification de la tâche")
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
