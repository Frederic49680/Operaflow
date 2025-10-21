"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Plus,
  GripVertical
} from "lucide-react"
import { useTasks, Task } from "@/hooks/useTasks"
import TaskCard from "./TaskCard"
import NewTaskButton from "./NewTaskButton"

export default function TuilesTachesSimple() {
  const { tasks, loading, loadTasks } = useTasks()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.libelle_tache.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.statut === filterStatus
    return matchesSearch && matchesStatus
  })

  const renderTask = (task: Task, level = 0) => {
    const isExpanded = expandedTasks.has(task.id)
    const hasChildren = task.enfants && task.enfants.length > 0

    return (
      <div key={task.id} className="space-y-2">
        <TaskCard
          task={task}
          onEdit={(task) => {
            console.log('Éditer tâche:', task)
            // TODO: Ouvrir modal d'édition
          }}
          onSubTask={(parentId) => {
            console.log('Créer sous-tâche pour:', parentId)
            // TODO: Ouvrir modal de création de sous-tâche
          }}
          onLink={(taskId) => {
            console.log('Créer lien pour:', taskId)
            // TODO: Ouvrir modal de création de lien
          }}
          onDelete={(taskId) => {
            console.log('Supprimer tâche:', taskId)
            loadTasks() // Recharger après suppression
          }}
          onAssignResource={(taskId) => {
            console.log('Assigner ressource à:', taskId)
            // TODO: Ouvrir modal d'assignation de ressource
          }}
          onToggleExpand={toggleExpand}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
        />

        {/* Rendu récursif des enfants */}
        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-2">
            {task.enfants?.map(child => renderTask(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des tâches...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            Gestion des Tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tous les statuts</option>
                <option value="Non lancé">Non lancé</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Bloqué">Bloqué</option>
                <option value="Reporté">Reporté</option>
              </select>
            </div>
          </div>

          {/* Bouton nouvelle tâche */}
          <NewTaskButton onTaskCreated={() => loadTasks()} />
        </CardContent>
      </Card>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Aucune tâche ne correspond aux critères de recherche"
                  : "Aucune tâche créée pour le moment"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => renderTask(task))
        )}
      </div>
    </div>
  )
}
