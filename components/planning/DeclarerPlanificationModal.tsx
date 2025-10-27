"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface DeclarerPlanificationModalProps {
  affaire: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeclarerPlanificationModal({
  affaire,
  isOpen,
  onClose,
  onSuccess
}: DeclarerPlanificationModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [dateDebut, setDateDebut] = useState<string>("")
  const [dateFin, setDateFin] = useState<string>("")
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && affaire) {
      // Initialiser les dates depuis l'affaire
      setDateDebut(affaire.date_debut || "")
      setDateFin(affaire.date_fin_prevue || "")
      
      // Charger les templates disponibles
      loadTemplates()
    }
  }, [isOpen, affaire])

  const loadTemplates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Erreur chargement templates:', error)
    }
  }

  const handleConfirm = async () => {
    if (!dateDebut || !dateFin) {
      toast.error("Veuillez renseigner les dates de début et de fin")
      return
    }

    setLoading(true)
    
    try {
      const supabase = createClient()

      // Si template sélectionné, appliquer le template
      if (selectedTemplate) {
        // TODO: Implémenter l'application du template
        console.log("Application du template:", selectedTemplate)
      }

      // Créer la tâche parapluie si BPU
      if (affaire.type_affaire === 'BPU') {
        const { error: taskError } = await supabase
          .from('planning_taches')
          .insert({
            libelle_tache: `[PARAPLUIE BPU] ${affaire.nom}`,
            affaire_id: affaire.id,
            site_id: affaire.site_id,
            date_debut_plan: dateDebut,
            date_fin_plan: dateFin,
            effort_plan_h: affaire.heures_capacite || 0,
            effort_reel_h: 0,
            avancement_pct: 0,
            statut: 'Non lancé',
            type_tache: 'Autre',
            competence: affaire.competence_principale || null,
            ressource_ids: [],
            is_parapluie_bpu: true,
            level: 0,
            order_index: 0,
            created_by: null,
            date_creation: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (taskError) throw taskError
      }

      // Mettre à jour le statut de l'affaire
      const { error } = await supabase
        .from('affaires')
        .update({ 
          statut: 'Validée',
          date_debut: dateDebut,
          date_fin_prevue: dateFin
        })
        .eq('id', affaire.id)

      if (error) throw error

      toast.success("Planification déclarée avec succès")
      
      // Rafraîchir la page après 1 seconde pour voir les nouvelles tâches
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error("Erreur lors de la déclaration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Déclarer la Planification
          </DialogTitle>
          <DialogDescription>
            Confirmez les dates et choisissez un template optionnel pour {affaire?.nom}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de l'affaire */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-slate-800">Affaire concernée</h4>
            <div className="text-sm text-slate-600">
              <p><strong>Code:</strong> {affaire?.code_affaire}</p>
              <p><strong>Nom:</strong> {affaire?.nom}</p>
              {affaire?.type_affaire === 'BPU' && (
                <Badge className="mt-2 bg-blue-100 text-blue-800">BPU</Badge>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut" className="text-slate-700 font-medium">
                Date de début <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFin" className="text-slate-700 font-medium">
                Date de fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

                     {/* Sélection template */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-slate-700 font-medium">
              Template à appliquer (optionnel)
            </Label>
            <Select value={selectedTemplate || undefined} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Aucun template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Les templates permettent de générer automatiquement des tâches selon un modèle prédéfini
            </p>
          </div>

          {/* Info BPU */}
          {affaire?.type_affaire === 'BPU' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600">ℹ️</span>
                <span>
                  Pour les affaires BPU, une tâche parapluie sera créée automatiquement.
                  Les tâches détaillées seront ajoutées lors de la saisie maintenance.
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !dateDebut || !dateFin}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? "Traitement..." : "Confirmer la Planification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
