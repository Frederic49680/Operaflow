"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { User, Plus, Trash2, Clock, Users } from "lucide-react"
import { toast } from "sonner"

interface Resource {
  id: string
  nom: string
  prenom: string
  competence: string
  site: string
}

interface TaskResource {
  resourceId: string
  resourceName: string
  charge: number // Pourcentage d'affectation
  heures: number // Heures planifiées
}

interface TaskResourceModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
}

export default function TaskResourceModal({
  isOpen,
  onClose,
  taskId,
  taskName
}: TaskResourceModalProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [taskResources, setTaskResources] = useState<TaskResource[]>([])
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [charge, setCharge] = useState<number>(100)
  const [heures, setHeures] = useState<number>(8)
  const [isLoading, setIsLoading] = useState(false)

  // Charger les ressources disponibles
  useEffect(() => {
    if (isOpen) {
      loadResources()
    }
  }, [isOpen])

  const loadResources = async () => {
    try {
      setIsLoading(true)
      // Simulation de chargement des ressources
      const mockResources: Resource[] = [
        { id: "1", nom: "Dupont", prenom: "Jean", competence: "Électricité", site: "E-03A" },
        { id: "2", nom: "Martin", prenom: "Pierre", competence: "CVC", site: "E-03A" },
        { id: "3", nom: "Bernard", prenom: "Marie", competence: "Électricité", site: "DAM" },
        { id: "4", nom: "Leroy", prenom: "Paul", competence: "Automatisme", site: "DAM" },
        { id: "5", nom: "Moreau", prenom: "Sophie", competence: "CVC", site: "PDC_FBA" }
      ]
      setResources(mockResources)
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
      toast.error("Erreur lors du chargement des ressources")
    } finally {
      setIsLoading(false)
    }
  }

  const addResource = () => {
    if (!selectedResource) {
      toast.error("Veuillez sélectionner une ressource")
      return
    }

    const resource = resources.find(r => r.id === selectedResource)
    if (!resource) return

    // Vérifier si la ressource n'est pas déjà assignée
    if (taskResources.some(tr => tr.resourceId === selectedResource)) {
      toast.error("Cette ressource est déjà assignée à cette tâche")
      return
    }

    const newTaskResource: TaskResource = {
      resourceId: selectedResource,
      resourceName: `${resource.prenom} ${resource.nom}`,
      charge: charge,
      heures: heures
    }

    setTaskResources([...taskResources, newTaskResource])
    setSelectedResource("")
    setCharge(100)
    setHeures(8)
    toast.success("Ressource ajoutée")
  }

  const removeResource = (resourceId: string) => {
    setTaskResources(taskResources.filter(tr => tr.resourceId !== resourceId))
    toast.success("Ressource supprimée")
  }

  const saveAssignments = async () => {
    try {
      setIsLoading(true)
      
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`${taskResources.length} ressource(s) assignée(s) avec succès`)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalCharge = () => {
    return taskResources.reduce((total, tr) => total + tr.charge, 0)
  }

  const getTotalHeures = () => {
    return taskResources.reduce((total, tr) => total + tr.heures, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Assigner des ressources
          </DialogTitle>
          <DialogDescription>
            Assigner des ressources à la tâche "{taskName}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Statistiques */}
          {taskResources.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{taskResources.length}</div>
                <div className="text-xs text-gray-500">Ressources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalCharge()}%</div>
                <div className="text-xs text-gray-500">Charge totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getTotalHeures()}h</div>
                <div className="text-xs text-gray-500">Heures totales</div>
              </div>
            </div>
          )}

          {/* Ajouter une ressource */}
          <div className="grid gap-4 p-4 border rounded-md">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une ressource
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Ressource</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ressource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex items-center gap-2">
                          <span>{resource.prenom} {resource.nom}</span>
                          <Badge variant="outline" className="text-xs">
                            {resource.competence}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Charge (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={charge}
                  onChange={(e) => setCharge(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Heures planifiées</Label>
              <Input
                type="number"
                min="0"
                value={heures}
                onChange={(e) => setHeures(parseInt(e.target.value) || 0)}
                className="w-32"
              />
            </div>

            <Button 
              onClick={addResource}
              disabled={!selectedResource}
              className="w-fit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Liste des ressources assignées */}
          {taskResources.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ressources assignées ({taskResources.length})
              </h4>
              
              <div className="space-y-2">
                {taskResources.map((tr, index) => (
                  <div key={tr.resourceId} className="flex items-center justify-between p-3 bg-blue-50 rounded-md border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{tr.resourceName}</div>
                        <div className="text-sm text-gray-500">
                          {tr.charge}% • {tr.heures}h
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeResource(tr.resourceId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avertissement surcharge */}
          {getTotalCharge() > 100 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center gap-2 text-orange-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Attention :</span>
                <span>La charge totale ({getTotalCharge()}%) dépasse 100%</span>
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
            onClick={saveAssignments}
            disabled={taskResources.length === 0 || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <User className="h-4 w-4 mr-2" />
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
