"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { 
  Users, 
  Plus,
  UserCheck
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Ressource {
  id: string
  nom: string
  prenom: string
  role_principal?: string
  competence_principale?: string
}

interface Task {
  id: string
  libelle_tache: string
  competence?: string
  type_tache?: string
}

interface TaskAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onAssignmentComplete?: () => void
}

export default function TaskAssignmentModal({ 
  isOpen, 
  onClose, 
  task, 
  onAssignmentComplete 
}: TaskAssignmentModalProps) {
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRessource, setSelectedRessource] = useState("")
  const [charge, setCharge] = useState(100)
  const [heuresPlanifiees, setHeuresPlanifiees] = useState(8)
  const [assignments, setAssignments] = useState<Array<{
    ressource_id: string
    nom: string
    prenom: string
    charge: number
    heures: number
  }>>([])

  const loadRessources = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('ressources')
        .select('id, nom, prenom, role_principal, competence_principale')
        .eq('actif', true)
        .order('nom')

      if (error) throw error
      setRessources(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
      toast.error("Erreur lors du chargement des ressources")
    } finally {
      setLoading(false)
    }
  }

  const addRessource = () => {
    if (!selectedRessource) {
      toast.error("Veuillez sélectionner une ressource")
      return
    }

    const ressource = ressources.find(r => r.id === selectedRessource)
    if (!ressource) return

    // Vérifier si la ressource n'est pas déjà assignée
    if (assignments.find(a => a.ressource_id === selectedRessource)) {
      toast.error("Cette ressource est déjà assignée à cette tâche")
      return
    }

    setAssignments(prev => [...prev, {
      ressource_id: selectedRessource,
      nom: ressource.nom,
      prenom: ressource.prenom,
      charge,
      heures: heuresPlanifiees
    }])

    // Réinitialiser le formulaire
    setSelectedRessource("")
    setCharge(100)
    setHeuresPlanifiees(8)
  }

  const removeRessource = (ressourceId: string) => {
    setAssignments(prev => prev.filter(a => a.ressource_id !== ressourceId))
  }

  const saveAssignments = async () => {
    if (!task || assignments.length === 0) {
      toast.error("Aucune ressource assignée")
      return
    }

    try {
      const supabase = createClient()

      // Insérer les affectations dans taches_ressources
      const assignmentsData = assignments.map(assignment => ({
        tache_id: task.id,
        ressource_id: assignment.ressource_id,
        charge_h: assignment.heures,
        taux_affectation: assignment.charge,
        competence: task.competence || null
      }))

      const { error } = await supabase
        .from('taches_ressources')
        .insert(assignmentsData)

      if (error) throw error

      toast.success(`${assignments.length} ressource(s) assignée(s) avec succès`)
      onAssignmentComplete?.()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error("Erreur lors de la sauvegarde des affectations")
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRessources()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigner des ressources
          </DialogTitle>
          <DialogDescription>
            Assigner des ressources à la tâche "{task?.libelle_tache}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulaire d'ajout de ressource */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">+ Ajouter une ressource</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ressource-select">Ressource</Label>
                <Select value={selectedRessource} onValueChange={setSelectedRessource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ressource" />
                  </SelectTrigger>
                  <SelectContent>
                    {ressources.map((ressource) => (
                      <SelectItem key={ressource.id} value={ressource.id}>
                        {ressource.prenom} {ressource.nom}
                        {ressource.role_principal && ` (${ressource.role_principal})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="charge">Charge (%)</Label>
                <Input
                  id="charge"
                  type="number"
                  min="1"
                  max="100"
                  value={charge}
                  onChange={(e) => setCharge(parseInt(e.target.value) || 100)}
                />
              </div>

              <div>
                <Label htmlFor="heures">Heures planifiées</Label>
                <Input
                  id="heures"
                  type="number"
                  min="0"
                  value={heuresPlanifiees}
                  onChange={(e) => setHeuresPlanifiees(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addRessource} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {/* Liste des ressources assignées */}
          {assignments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Ressources assignées</h3>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.ressource_id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {assignment.prenom[0]}{assignment.nom[0]}
                      </div>
                      <div>
                        <p className="font-medium">{assignment.prenom} {assignment.nom}</p>
                        <p className="text-sm text-gray-600">
                          {assignment.charge}% • {assignment.heures}h
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRessource(assignment.ressource_id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Chargement des ressources...</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={saveAssignments}
            disabled={assignments.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
