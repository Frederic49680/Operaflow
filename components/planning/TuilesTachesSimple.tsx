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
  GripVertical,
  Edit,
  Link,
  User,
  Trash2,
  ChevronRight,
  Building,
  CheckCircle,
  Clock
} from "lucide-react"
import { useTasks, Task } from "@/hooks/useTasks"
import TaskCard from "./TaskCard"
import NewTaskButton from "./NewTaskButton"
import TaskDependencyModal from "./TaskDependencyModal"
import TaskResourceModal from "./TaskResourceModal"
import { toast } from "sonner"

export default function TuilesTachesSimple() {
  const { tasks, loading, loadTasks, updateTask, deleteTask } = useTasks()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [expandedAffaires, setExpandedAffaires] = useState<Set<string>>(new Set())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTaskName, setSelectedTaskName] = useState<string>("")

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const toggleAffaireExpand = (affaireId: string) => {
    const newExpanded = new Set(expandedAffaires)
    if (newExpanded.has(affaireId)) {
      newExpanded.delete(affaireId)
    } else {
      newExpanded.add(affaireId)
    }
    setExpandedAffaires(newExpanded)
  }

  // Fonction pour éditer une tâche
  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  // Fonction pour créer un lien de dépendance
  const handleLink = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setSelectedTaskId(taskId)
    setSelectedTaskName(task?.libelle_tache || "")
    setShowLinkModal(true)
  }

  // Fonction pour assigner une ressource
  const handleAssignResource = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setSelectedTaskId(taskId)
    setSelectedTaskName(task?.libelle_tache || "")
    setShowResourceModal(true)
  }

  // Fonction pour supprimer une tâche
  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast.success("Tâche supprimée avec succès")
      loadTasks()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression de la tâche")
    }
  }

  // Fonction récursive pour extraire toutes les tâches (racine + enfants)
  const getAllTasks = (taskList: Task[]): Task[] => {
    const allTasks: Task[] = []
    taskList.forEach(task => {
      allTasks.push(task)
      if (task.enfants && task.enfants.length > 0) {
        allTasks.push(...getAllTasks(task.enfants))
      }
    })
    return allTasks
  }

  const allTasks = getAllTasks(tasks)

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.libelle_tache.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.statut === filterStatus
    return matchesSearch && matchesStatus
  })

  // Tâches chargées

  // Grouper les tâches par affaire
  const tasksByAffaire = filteredTasks.reduce((acc, task) => {
    const affaireId = task.affaire_id || 'sans-affaire'
    const affaireName = task.affaire?.nom || 'Sans affaire'
    const affaireCode = task.affaire?.code_affaire || 'N/A'
    
    // Tâche parapluie BPU détectée
    
    if (!acc[affaireId]) {
      acc[affaireId] = {
        id: affaireId,
        nom: affaireName,
        code: affaireCode,
        tasks: []
      }
    }
    acc[affaireId].tasks.push(task)
    return acc
  }, {} as Record<string, { id: string; nom: string; code: string; tasks: Task[] }>)

  const renderTask = (task: Task, level = 0) => {
    const isExpanded = expandedTasks.has(task.id)
    const hasChildren = task.enfants && task.enfants.length > 0

    return (
      <div key={task.id} className="space-y-2">
        <TaskCard
          task={task}
          level={level}
          onEdit={handleEdit}
          onSubTask={(parentId) => {
            console.log('Créer sous-tâche pour:', parentId)
            // Géré par TaskActionButtons
          }}
          onLink={handleLink}
          onDelete={handleDelete}
          onAssignResource={handleAssignResource}
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
                   <Building className="h-5 w-5 text-blue-600" />
                   Tâches par Affaires
                 </CardTitle>
                 <p className="text-sm text-gray-500 mt-1">
                   Cliquez sur une affaire pour voir ses tâches
                 </p>
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

             {/* Liste des tâches organisées par affaires */}
             <div className="space-y-4">
               {Object.keys(tasksByAffaire).length === 0 ? (
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
                 Object.values(tasksByAffaire).map(affaire => {
                   const isExpanded = expandedAffaires.has(affaire.id)
                   const totalTasks = affaire.tasks.length
                   const completedTasks = affaire.tasks.filter(t => t.statut === 'Terminé').length
                   const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                   return (
                     <Card key={affaire.id} className="border-l-4 border-l-blue-500">
                       <CardHeader 
                         className="cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => toggleAffaireExpand(affaire.id)}
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2">
                               <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                 <ChevronRight className="h-4 w-4 text-gray-500" />
                               </div>
                               <Building className="h-5 w-5 text-blue-600" />
                               <div>
                                 <CardTitle className="text-lg text-blue-700">
                                   {affaire.nom}
                                 </CardTitle>
                                 <p className="text-sm text-gray-500">
                                   Code: {affaire.code} • {totalTasks} tâche(s)
                                 </p>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 text-sm text-gray-600">
                               <CheckCircle className="h-4 w-4 text-green-600" />
                               <span>{completedTasks}</span>
                               <Clock className="h-4 w-4 text-orange-600" />
                               <span>{totalTasks - completedTasks}</span>
                             </div>
                             <div className="text-right">
                               <div className="text-sm font-medium text-gray-700">
                                 {progressPercentage}% d'avancement
                               </div>
                               <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                   style={{ width: `${progressPercentage}%` }}
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                       </CardHeader>
                       
                       {isExpanded && (
                         <CardContent className="pt-0">
                           <div className="space-y-3">
                             {affaire.tasks.map(task => renderTask(task))}
                           </div>
                         </CardContent>
                       )}
                     </Card>
                   )
                 })
               )}
             </div>

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
                           defaultValue={editingTask.libelle_tache}
                           className="w-full"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Statut</label>
                         <select
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
                           type="date"
                           defaultValue={editingTask.date_debut_plan || ""}
                           className="w-full"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Date fin</label>
                         <Input
                           type="date"
                           defaultValue={editingTask.date_fin_plan || ""}
                           className="w-full"
                         />
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium mb-1">Compétence requise</label>
                         <select
                           defaultValue={editingTask.competence || ""}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md"
                         >
                           <option value="">Sélectionner...</option>
                           <option value="Électricité">Électricité</option>
                           <option value="CVC">CVC</option>
                           <option value="Automatisme">Automatisme</option>
                           <option value="Sécurité">Sécurité</option>
                         </select>
                     </div>
                                           <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Effort planifié (heures)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            defaultValue={editingTask.effort_plan_h || 0}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Durée estimée en heures
                          </p>
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
                          <p className="text-xs text-gray-500 mt-1">
                            Profondeur maximale: 3 niveaux
                          </p>
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
                            // Récupérer le niveau hiérarchique
                            const levelSelect = document.getElementById('task-level') as HTMLSelectElement
                            const updates: any = {
                              level: levelSelect ? parseInt(levelSelect.value) : editingTask.level || 0
                            }
                            
                            if (editingTask) {
                              await updateTask(editingTask.id, updates)
                              toast.success("Tâche modifiée avec succès")
                              setShowEditModal(false)
                              loadTasks()
                            }
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

             {/* Modal de liaison de dépendance */}
             <TaskDependencyModal
               isOpen={showLinkModal}
               onClose={() => setShowLinkModal(false)}
               sourceTaskId={selectedTaskId || ""}
               sourceTaskName={selectedTaskName}
             />

             {/* Modal d'assignation de ressource */}
             <TaskResourceModal
               isOpen={showResourceModal}
               onClose={() => setShowResourceModal(false)}
               taskId={selectedTaskId || ""}
               taskName={selectedTaskName}
               onResourceAdded={loadTasks}
             />
    </div>
  )
}
