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
import { Loader2 } from "lucide-react"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

interface Plan {
  id?: string
  collaborateur_id?: string
  formation_id?: string
  organisme_id?: string
  semaine_iso?: string
  date_debut?: string
  date_fin?: string
  modalite?: string
  statut?: string
  cout_prevu_ht?: number
  cout_realise_ht?: number
  commentaire?: string
}

interface Ressource {
  id: string
  nom: string
  prenom: string
  site_id?: string
}

interface Formation {
  id: string
  code: string
  libelle: string
}

interface Organisme {
  id: string
  nom: string
}

interface Tarif {
  id: string
  formation_id: string
  organisme_id: string
  modalite?: string
  cout_unitaire?: number
  cout_session?: number
  capacite_max?: number
  frais_deplacement?: number
  tva?: number
}

interface SemaineFormationModalProps {
  plan?: Plan | null
  onClose?: () => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function SemaineFormationModal({ plan, onClose, onSuccess, children }: SemaineFormationModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [organismes, setOrganismes] = useState<Organisme[]>([])
  const [semainesISO, setSemainesISO] = useState<Array<{ value: string, label: string }>>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [tarifsDisponibles, setTarifsDisponibles] = useState<Tarif[]>([])
  const [selectedTarifId, setSelectedTarifId] = useState<string>('')
  
  const [formData, setFormData] = useState<Plan>({
    collaborateur_id: '',
    formation_id: '',
    organisme_id: '',
    semaine_iso: '',
    date_debut: '',
    date_fin: '',
    modalite: 'Présentiel',
    statut: 'Prévisionnel',
    cout_prevu_ht: 0,
    cout_realise_ht: 0,
    commentaire: ''
  })

  // Fonction pour obtenir le numéro de semaine ISO
  const getISOWeek = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Fonction pour obtenir le lundi d'une semaine ISO
  const getMondayOfISOWeek = (year: number, week: number): Date => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7)
    const dow = simple.getDay()
    const ISOweekStart = simple
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
    }
    return ISOweekStart
  }

  // Générer les semaines ISO de l'année
  const generateISOweeks = (year: number) => {
    const weeks: Array<{ value: string, label: string }> = []
    
    for (let week = 1; week <= 52; week++) {
      const monday = getMondayOfISOWeek(year, week)
      const weekValue = `${year}-W${week.toString().padStart(2, '0')}`
      const weekLabel = `Semaine ${week} (${monday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})`
      weeks.push({ value: weekValue, label: weekLabel })
    }
    
    setSemainesISO(weeks)
  }

  useEffect(() => {
    loadData()
    
    if (plan) {
      setFormData(plan)
      // Extraire l'année de la semaine ISO existante
      const match = plan.semaine_iso?.match(/^(\d{4})-W(\d{2})$/)
      if (match) {
        setSelectedYear(parseInt(match[1]))
      }
    } else {
      // Calculer la semaine ISO courante pour une nouvelle formation
      const today = new Date()
      const currentWeek = getISOWeek(today)
      const currentYear = today.getFullYear()
      const weekValue = `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`
      
      // Calculer le lundi de la semaine courante
      const monday = getMondayOfISOWeek(currentYear, currentWeek)
      
      setFormData(prev => ({
        ...prev,
        semaine_iso: weekValue,
        date_debut: monday.toISOString().split('T')[0]
      }))
      setSelectedYear(currentYear)
    }
  }, [plan])

  // Générer les semaines ISO quand l'année change
  useEffect(() => {
    generateISOweeks(selectedYear)
  }, [selectedYear, generateISOweeks])

  // Calculer automatiquement la date de fin en fonction de la durée
  useEffect(() => {
    if (formData.date_debut && formData.formation_id) {
      const selectedFormation = formations.find(f => f.id === formData.formation_id)
      if (selectedFormation) {
        // Récupérer la durée depuis la formation (duree_jours ou duree_heures)
        const supabase = createClient()
        supabase
          .from('formations_catalogue')
          .select('duree_jours, duree_heures')
          .eq('id', formData.formation_id)
          .single()
          .then(({ data }) => {
            if (data) {
              // Utiliser duree_jours si disponible, sinon calculer à partir de duree_heures (7h/jour)
              let daysToAdd = 0
              if (data.duree_jours) {
                daysToAdd = data.duree_jours
              } else if (data.duree_heures) {
                daysToAdd = Math.ceil(data.duree_heures / 7) // 7 heures = 1 jour
              }
              
              if (daysToAdd > 0 && formData.date_debut) {
                const startDate = new Date(formData.date_debut)
                const endDate = new Date(startDate)
                // Ajouter les jours (si 1 jour, on reste sur le lundi, si 5 jours, on va au vendredi)
                endDate.setDate(startDate.getDate() + daysToAdd - 1)
                
                setFormData(prev => ({
                  ...prev,
                  date_fin: endDate.toISOString().split('T')[0]
                }))
              }
            }
          })
      }
    }
  }, [formData.date_debut, formData.formation_id, formations])

  // Calculer la date de début à partir de la semaine ISO
  useEffect(() => {
    if (formData.semaine_iso && !plan?.id) { // Seulement pour les nouvelles formations
      const match = formData.semaine_iso.match(/^(\d{4})-W(\d{2})$/)
      if (match) {
        const year = parseInt(match[1])
        const week = parseInt(match[2])
        const monday = getMondayOfISOWeek(year, week)
        
        setFormData(prev => ({
          ...prev,
          date_debut: monday.toISOString().split('T')[0]
        }))
      }
    }
  }, [formData.semaine_iso, plan?.id])

  // Charger les tarifs disponibles quand formation et organisme sont sélectionnés
  useEffect(() => {
    if (formData.formation_id && formData.organisme_id) {
      const supabase = createClient()
      supabase
        .from('formations_tarifs')
        .select('*')
        .eq('formation_id', formData.formation_id)
        .eq('organisme_id', formData.organisme_id)
        .eq('actif', true)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setTarifsDisponibles(data)
          }
        })
    } else {
      setTarifsDisponibles([])
      setSelectedTarifId('')
    }
  }, [formData.formation_id, formData.organisme_id])

  // Appliquer le tarif sélectionné au coût prévu
  useEffect(() => {
    if (selectedTarifId && tarifsDisponibles.length > 0) {
      const tarif = tarifsDisponibles.find(t => t.id === selectedTarifId)
      if (tarif) {
        // Prioriser le prix unitaire, sinon utiliser le prix session
        let cout = 0
        if (tarif.cout_unitaire) {
          cout = tarif.cout_unitaire
        } else if (tarif.cout_session) {
          cout = tarif.cout_session
        }
        
        // Ajouter les frais de déplacement si présents
        if (tarif.frais_deplacement) {
          cout += tarif.frais_deplacement
        }
        
        setFormData(prev => ({
          ...prev,
          cout_prevu_ht: cout
        }))
      }
    } else if (!selectedTarifId) {
      // Réinitialiser à 0 si aucun tarif sélectionné
      setFormData(prev => ({
        ...prev,
        cout_prevu_ht: 0
      }))
    }
  }, [selectedTarifId, tarifsDisponibles])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Charger ressources
      const { data: ressourcesData, error: ressourcesError } = await supabase
        .from('ressources')
        .select('id, nom, prenom, site_id')
        .eq('actif', true)
        .order('nom')
      
      if (ressourcesError) throw ressourcesError
      setRessources(ressourcesData || [])
      
      // Charger formations
      const { data: formationsData, error: formationsError } = await supabase
        .from('formations_catalogue')
        .select('id, code, libelle')
        .eq('actif', true)
        .order('libelle')
      
      if (formationsError) throw formationsError
      setFormations(formationsData || [])
      
      // Charger organismes
      const { data: organismesData, error: organismesError } = await supabase
        .from('organismes_formation')
        .select('id, nom')
        .eq('actif', true)
        .order('nom')
      
      if (organismesError) throw organismesError
      setOrganismes(organismesData || [])
    } catch (err) {
      console.error('Erreur chargement données:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.collaborateur_id || !formData.formation_id || !formData.organisme_id) {
      setToast({ type: 'error', message: 'La ressource, la formation et l\'organisme sont obligatoires' })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Préparer les données à envoyer (sans les objets joints)
      const dataToSave = {
        collaborateur_id: formData.collaborateur_id,
        formation_id: formData.formation_id,
        organisme_id: formData.organisme_id,
        semaine_iso: formData.semaine_iso,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        modalite: formData.modalite,
        statut: formData.statut,
        cout_prevu_ht: formData.cout_prevu_ht,
        cout_realise_ht: formData.cout_realise_ht,
        commentaire: formData.commentaire
      }

      if (plan?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('plan_formation_ressource')
          .update(dataToSave)
          .eq('id', plan.id)

        if (error) throw error
        setToast({ type: 'success', message: 'Semaine de formation mise à jour avec succès !' })
      } else {
        // Création
        const { error } = await supabase
          .from('plan_formation_ressource')
          .insert([dataToSave])

        if (error) throw error
        setToast({ type: 'success', message: 'Semaine de formation créée avec succès !' })
      }

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
      setFormData({
        collaborateur_id: '',
        formation_id: '',
        organisme_id: '',
        semaine_iso: '',
        date_debut: '',
        date_fin: '',
        modalite: 'Présentiel',
        statut: 'Prévisionnel',
        cout_prevu_ht: 0,
        cout_realise_ht: 0,
        commentaire: ''
      })
      window.dispatchEvent(new Event('plan-created'))
      if (onClose) onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {children && (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      )}
      
      <Dialog open={open || !!plan} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && onClose) onClose()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {plan?.id ? 'Modifier la formation planifiée' : 'Planifier une formation'}
            </DialogTitle>
            <DialogDescription>
              {plan?.id ? 'Modifiez les informations de la formation planifiée' : 'Planifiez une formation pour une ressource'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ressource */}
            <div className="space-y-2">
              <Label htmlFor="collaborateur_id">Ressource *</Label>
              <select
                id="collaborateur_id"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.collaborateur_id}
                onChange={(e) => setFormData({ ...formData, collaborateur_id: e.target.value })}
                required
              >
                <option value="">Sélectionner une ressource</option>
                {ressources.map(res => (
                  <option key={res.id} value={res.id}>
                    {res.prenom} {res.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Formation */}
            <div className="space-y-2">
              <Label htmlFor="formation_id">Formation *</Label>
              <select
                id="formation_id"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.formation_id}
                onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })}
                required
              >
                <option value="">Sélectionner une formation</option>
                {formations.map(formation => (
                  <option key={formation.id} value={formation.id}>
                    {formation.code} - {formation.libelle}
                  </option>
                ))}
              </select>
            </div>

            {/* Organisme */}
            <div className="space-y-2">
              <Label htmlFor="organisme_id">Organisme *</Label>
              <select
                id="organisme_id"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.organisme_id}
                onChange={(e) => setFormData({ ...formData, organisme_id: e.target.value })}
                required
              >
                <option value="">Sélectionner un organisme</option>
                {organismes.map(org => (
                  <option key={org.id} value={org.id}>{org.nom}</option>
                ))}
              </select>
            </div>

            {/* Tarif disponible */}
            {tarifsDisponibles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="tarif_id">Tarif applicable</Label>
                <select
                  id="tarif_id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTarifId}
                  onChange={(e) => setSelectedTarifId(e.target.value)}
                >
                  <option value="">Sélectionner un tarif (optionnel)</option>
                  {tarifsDisponibles.map(tarif => {
                    let prix = '-'
                    let typePrix = ''
                    
                    if (tarif.cout_unitaire && tarif.cout_session) {
                      // Tarif mixte
                      prix = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tarif.cout_unitaire)
                      typePrix = `(unitaire)`
                    } else if (tarif.cout_unitaire) {
                      // Tarif unitaire uniquement
                      prix = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tarif.cout_unitaire)
                      typePrix = `(unitaire)`
                    } else if (tarif.cout_session) {
                      // Tarif groupe uniquement
                      prix = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tarif.cout_session)
                      typePrix = `(groupe)`
                    }
                    
                    return (
                      <option key={tarif.id} value={tarif.id}>
                        {tarif.modalite} - {prix} {typePrix} {tarif.capacite_max ? `- max ${tarif.capacite_max} pers.` : ''}
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-slate-500">
                  Le coût prévu sera calculé automatiquement selon le tarif sélectionné
                </p>
              </div>
            )}

            {/* Année et Semaine ISO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annee">Année</Label>
                <select
                  id="annee"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value)
                    setSelectedYear(newYear)
                    // Réinitialiser la semaine ISO
                    setFormData(prev => ({ ...prev, semaine_iso: '' }))
                  }}
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semaine_iso">Semaine ISO *</Label>
                <select
                  id="semaine_iso"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.semaine_iso}
                  onChange={(e) => setFormData({ ...formData, semaine_iso: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une semaine</option>
                  {semainesISO.map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 -mt-2">
              La date de début sera calculée automatiquement au lundi de la semaine sélectionnée
            </p>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date début (Lundi)</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Positionnée automatiquement au lundi de la semaine
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date fin (calculée)</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Calculée automatiquement selon la durée de la formation
                </p>
              </div>
            </div>

            {/* Modalité et Statut */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <select
                  id="statut"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                >
                  <option value="Prévisionnel">Prévisionnel</option>
                  <option value="Validé">Validé</option>
                  <option value="Réalisé">Réalisé</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>

            {/* Coûts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cout_prevu_ht">Coût prévu HT (€)</Label>
                <Input
                  id="cout_prevu_ht"
                  type="number"
                  step="0.01"
                  value={formData.cout_prevu_ht}
                  onChange={(e) => setFormData({ ...formData, cout_prevu_ht: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">
                  {selectedTarifId ? 'Calculé automatiquement depuis le tarif sélectionné' : 'Sélectionnez un tarif pour calculer automatiquement'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cout_realise_ht">Coût réalisé HT (€)</Label>
                <Input
                  id="cout_realise_ht"
                  type="number"
                  step="0.01"
                  value={formData.cout_realise_ht}
                  onChange={(e) => setFormData({ ...formData, cout_realise_ht: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea
                id="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Notes sur cette semaine de formation..."
                rows={3}
              />
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

