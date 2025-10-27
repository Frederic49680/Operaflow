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
import { createClient } from "@/lib/supabase/client"

interface Resource {
  id: string
  nom: string
  prenom: string
  competences: string[]
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
  onResourceAdded?: () => void
}

export default function TaskResourceModal({
  isOpen,
  onClose,
  taskId,
  taskName,
  onResourceAdded
}: TaskResourceModalProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [taskResources, setTaskResources] = useState<TaskResource[]>([])
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [charge, setCharge] = useState<number>(100)
  const [heures, setHeures] = useState<number>(8)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Charger les ressources disponibles depuis Supabase
  useEffect(() => {
    if (isOpen) {
      loadResources()
      loadTaskResources()
    }
  }, [isOpen, taskId])

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('ressources')
        .select('id, nom, prenom, competences, site_id')
        .eq('actif', true)
        .order('nom')

      if (error) throw error

      // Charger les infos de site pour chaque ressource
      const resourcesWithSites = await Promise.all(
        (data || []).map(async (r) => {
          let site = 'Non assigné'
          if (r.site_id) {
            const { data: siteData } = await supabase
              .from('sites')
              .select('nom, code_site')
              .eq('id', r.site_id)
              .single()
            if (siteData) {
              site = `${siteData.code_site} - ${siteData.nom}`
            }
          }
          return {
            id: r.id,
            nom: r.nom,
            prenom: r.prenom,
            competences: r.competences || [],
            site: site
          }
        })
      )

      setResources(resourcesWithSites)
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
      toast.error("Erreur lors du chargement des ressources")
    } finally {
      setIsLoading(false)
    }
  }

  const loadTaskResources = async () => {
    try {
      const { data, error } = await supabase
        .from('taches_ressources')
        .select(`
          ressource_id,
          charge_h,
          ressources!inner(nom, prenom)
        `)
        .eq('tache_id', taskId)

      if (error) throw error

      const mappedResources = (data || []).map((tr: any) => ({
        resourceId: tr.ressource_id,
        resourceName: `${tr.ressources.prenom} ${tr.ressources.nom}`,
        charge: tr.charge_h || 8,
        heures: tr.charge_h || 8
      }))

      setTaskResources(mappedResources)
    } catch (error) {
      console.error('Erreur lors du chargement des assignations:', error)
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
      
      // Supprimer toutes les assignations existantes
      await supabase
        .from('taches_ressources')
        .delete()
        .eq('tache_id', taskId)

      // Insérer les nouvelles assignations
      if (taskResources.length > 0) {
        const insertData = taskResources.map(tr => ({
          tache_id: taskId,
          ressource_id: tr.resourceId,
          charge_h: tr.heures
        }))

        const { error: insertError } = await supabase
          .from('taches_ressources')
          .insert(insertData)

        if (insertError) throw insertError
      }
      
      toast.success(`${taskResources.length} ressource(s) assignée(s) avec succès`)
      
      // Recharger les tâches si callback fourni
      if (onResourceAdded) {
        onResourceAdded()
      }
      
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <User className="h-5 w-5 text-blue-600" />
            Assigner des ressources
          </DialogTitle>
          <DialogDescription>
            Assigner des ressources à la tâche "{taskName}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Statistiques */}
          {taskResources.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{taskResources.length}</div>
                <div className="text-xs text-gray-600">Ressources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalCharge()}%</div>
                <div className="text-xs text-gray-600">Charge totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getTotalHeures()}h</div>
                <div className="text-xs text-gray-600">Heures totales</div>
              </div>
            </div>
          )}

          {/* Ajouter une ressource */}
          <div className="grid gap-4 p-4 border border-slate-200 rounded-lg bg-white">
            <h4 className="font-medium flex items-center gap-2 text-slate-700">
              <Plus className="h-4 w-4" />
              Ajouter une ressource
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-slate-700">Ressource</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource} disabled={isLoading}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Sélectionner une ressource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex items-center gap-2">
                          <span>{resource.prenom} {resource.nom}</span>
                          {resource.competences && resource.competences.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {resource.competences[0]}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium text-slate-700">Heures</Label>
                <Input
                  type="number"
                  value={heures}
                  onChange={(e) => setHeures(parseInt(e.target.value) || 0)}
                  min="0"
                  max="40"
                  placeholder="8"
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              onClick={addResource}
              disabled={!selectedResource || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {/* Liste des ressources assignées */}
          {taskResources.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-slate-700">
                <Users className="h-4 w-4" />
                Ressources assignées
              </h4>
              {taskResources.map((tr) => (
                <div
                  key={tr.resourceId}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">{tr.resourceName}</div>
                      <div className="text-sm text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {tr.heures}h
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(tr.resourceId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={saveAssignments}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
