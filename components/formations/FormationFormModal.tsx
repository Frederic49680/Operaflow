"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, X } from "lucide-react"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"

interface Formation {
  id?: string
  code?: string
  libelle?: string
  type_formation?: string
  duree_heures?: number
  duree_jours?: number
  validite_mois?: number
  modalite?: string
  prerequis?: string
  competences?: string[]
  organisme_defaut_id?: string
  actif?: boolean
}

interface Organisme {
  id: string
  nom: string
}

interface FormationFormModalProps {
  formation?: Formation | null
  onClose?: () => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function FormationFormModal({ formation, onClose, onSuccess, children }: FormationFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [organismes, setOrganismes] = useState<Organisme[]>([])
  
  const [formData, setFormData] = useState<Formation>({
    code: '',
    libelle: '',
    type_formation: 'Technique',
    duree_heures: 0,
    duree_jours: 0,
    validite_mois: null,
    modalite: 'Présentiel',
    prerequis: '',
    competences: [],
    organisme_defaut_id: '',
    actif: true
  })

  const [competenceInput, setCompetenceInput] = useState('')

  // Compétences prédéfinies
  const competencesPredefinies = [
    'Électricité',
    'CVC',
    'Plomberie',
    'Chauffage',
    'Climatisation',
    'Sécurité Incendie',
    'Sûreté',
    'Éclairage',
    'Domotique',
    'Maintenance',
    'Sécurité au Travail',
    'Habilitation Électrique',
    'NR 12',
    'NR 13',
    'Autre'
  ]

  useEffect(() => {
    loadOrganismes()
    if (formation) {
      setFormData(formation)
    }
  }, [formation])

  const loadOrganismes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organismes_formation')
        .select('id, nom')
        .eq('actif', true)
        .order('nom')
      
      if (error) throw error
      setOrganismes(data || [])
    } catch (err) {
      console.error('Erreur chargement organismes:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code || !formData.libelle) {
      setToast({ type: 'error', message: 'Le code et le libellé sont obligatoires' })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      const dataToSave = {
        ...formData,
        organisme_defaut_id: formData.organisme_defaut_id || null
      }

      if (formation?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('formations_catalogue')
          .update(dataToSave)
          .eq('id', formation.id)

        if (error) throw error
        setToast({ type: 'success', message: 'Formation mise à jour avec succès !' })
      } else {
        // Création
        const { error } = await supabase
          .from('formations_catalogue')
          .insert([dataToSave])

        if (error) throw error
        setToast({ type: 'success', message: 'Formation créée avec succès !' })
      }

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
      setFormData({
        code: '',
        libelle: '',
        type_formation: 'Technique',
        duree_heures: 0,
        duree_jours: 0,
        validite_mois: null,
        modalite: 'Présentiel',
        prerequis: '',
        competences: [],
        organisme_defaut_id: '',
        actif: true
      })
      setCompetenceInput('')
      window.dispatchEvent(new Event('formation-created'))
      if (onClose) onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  const addCompetence = (competence?: string) => {
    const competenceToAdd = competence || competenceInput.trim()
    if (competenceToAdd && !formData.competences?.includes(competenceToAdd)) {
      setFormData({
        ...formData,
        competences: [...(formData.competences || []), competenceToAdd]
      })
      setCompetenceInput('')
    }
  }

  const removeCompetence = (competence: string) => {
    setFormData({
      ...formData,
      competences: formData.competences?.filter(c => c !== competence) || []
    })
  }

  const toggleCompetence = (competence: string) => {
    if (formData.competences?.includes(competence)) {
      removeCompetence(competence)
    } else {
      addCompetence(competence)
    }
  }

  return (
    <>
      {children && (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      )}
      
      <Dialog open={open || !!formation} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && onClose) onClose()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formation?.id ? 'Modifier la formation' : 'Nouvelle formation'}
            </DialogTitle>
            <DialogDescription>
              {formation?.id ? 'Modifiez les informations de la formation' : 'Ajoutez une nouvelle formation au catalogue'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code et Libellé */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="FORM-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé *</Label>
                <Input
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  placeholder="Formation Électricité"
                  required
                />
              </div>
            </div>

            {/* Type et Modalité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_formation">Type de formation</Label>
                <select
                  id="type_formation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type_formation}
                  onChange={(e) => setFormData({ ...formData, type_formation: e.target.value })}
                >
                  <option value="Habilitante">Habilitante</option>
                  <option value="Technique">Technique</option>
                  <option value="QSE">QSE</option>
                  <option value="CACES">CACES</option>
                  <option value="SST">SST</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modalite">Modalité</Label>
                <select
                  id="modalite"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.modalite}
                  onChange={(e) => setFormData({ ...formData, modalite: e.target.value })}
                >
                  <option value="Présentiel">Présentiel</option>
                  <option value="Distanciel">Distanciel</option>
                  <option value="E-learning">E-learning</option>
                  <option value="Mixte">Mixte</option>
                </select>
              </div>
            </div>

            {/* Durée */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duree_heures">Durée (heures)</Label>
                <Input
                  id="duree_heures"
                  type="number"
                  value={formData.duree_heures}
                  onChange={(e) => setFormData({ ...formData, duree_heures: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duree_jours">Durée (jours)</Label>
                <Input
                  id="duree_jours"
                  type="number"
                  value={formData.duree_jours}
                  onChange={(e) => setFormData({ ...formData, duree_jours: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validite_mois">Validité (mois)</Label>
                <Input
                  id="validite_mois"
                  type="number"
                  value={formData.validite_mois || ''}
                  onChange={(e) => setFormData({ ...formData, validite_mois: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="36"
                />
              </div>
            </div>

            {/* Organisme par défaut */}
            <div className="space-y-2">
              <Label htmlFor="organisme_defaut_id">Organisme par défaut</Label>
              <select
                id="organisme_defaut_id"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.organisme_defaut_id}
                onChange={(e) => setFormData({ ...formData, organisme_defaut_id: e.target.value })}
              >
                <option value="">Aucun</option>
                {organismes.map(org => (
                  <option key={org.id} value={org.id}>{org.nom}</option>
                ))}
              </select>
            </div>

            {/* Prérequis */}
            <div className="space-y-2">
              <Label htmlFor="prerequis">Prérequis</Label>
              <Textarea
                id="prerequis"
                value={formData.prerequis}
                onChange={(e) => setFormData({ ...formData, prerequis: e.target.value })}
                placeholder="Prérequis pour suivre cette formation..."
                rows={3}
              />
            </div>

            {/* Compétences */}
            <div className="space-y-3">
              <Label>Compétences associées</Label>
              
              {/* Boutons compétences prédéfinies */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Compétences disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {competencesPredefinies.map((competence) => {
                    const isSelected = formData.competences?.includes(competence)
                    return (
                      <Button
                        key={competence}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCompetence(competence)}
                        className={`transition-all ${
                          isSelected 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {isSelected && <X className="h-3 w-3 mr-1" />}
                        {competence}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Ajouter une compétence personnalisée */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-slate-600">Ou ajouter une compétence personnalisée</p>
                <div className="flex gap-2">
                  <Input
                    value={competenceInput}
                    onChange={(e) => setCompetenceInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCompetence()
                      }
                    }}
                    placeholder="Ex: Formation sur mesure..."
                  />
                  <Button 
                    type="button" 
                    onClick={() => addCompetence()} 
                    variant="outline"
                    disabled={!competenceInput.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Compétences sélectionnées */}
              {formData.competences && formData.competences.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium text-slate-600">
                    Compétences sélectionnées ({formData.competences.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.competences.map((competence, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        onClick={() => removeCompetence(competence)}
                      >
                        {competence}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actif */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="actif"
                checked={formData.actif}
                onCheckedChange={(checked) => setFormData({ ...formData, actif: !!checked })}
              />
              <Label htmlFor="actif" className="cursor-pointer">
                Formation active
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  if (onClose) onClose()
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      {toast && (
        toast.type === 'success' ? (
          <SuccessToast 
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : (
          <ErrorToast 
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )
      )}
    </>
  )
}

