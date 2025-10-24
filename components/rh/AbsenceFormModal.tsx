"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface AbsenceFormModalProps {
  children?: React.ReactNode
  absenceId?: string
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  onAbsenceCreated?: (absenceData: any) => void
}

interface Ressource {
  id: string
  nom: string
  prenom: string
  site_id: {
    code_site: string
    nom: string
  }
}

// Motifs prédéfinis en dehors du composant pour éviter les re-créations
const MOTIFS_PREDEFINIS = [
  "Vacances",
  "Maladie", 
  "Formation professionnelle",
  "Congé maternité/paternité",
  "Congé sans solde",
  "Grève",
  "Accident du travail",
  "Arrêt maladie longue durée"
]

export function AbsenceFormModal({ 
  children, 
  absenceId, 
  onClose, 
  open: openProp, 
  onOpenChange,
  onSuccess,
  onError,
  onAbsenceCreated
}: AbsenceFormModalProps) {
  const [openInternal, setOpenInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Utiliser la prop open si fournie, sinon l'état interne
  const open = openProp !== undefined ? openProp : openInternal
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setOpenInternal(value)
    }
  }
  
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [loadingRessources, setLoadingRessources] = useState(false)
  
  // États pour tous les champs du formulaire
  const [formData, setFormData] = useState({
    ressource_id: "",
    date_debut: "",
    date_fin: "",
    motif: ""
  })
  
  const [motifPersonnalise, setMotifPersonnalise] = useState("")
  const [showMotifPersonnalise, setShowMotifPersonnalise] = useState(false)

  // Stabiliser la fonction loadRessources
  const loadRessources = useCallback(async () => {
    try {
      setLoadingRessources(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('ressources')
        .select(`
          id,
          nom,
          prenom,
          site_id:sites!ressources_site_id_fkey (
            code_site,
            nom
          )
        `)
        .eq('actif', true)
        .order('nom')

      if (error) throw error
      
      // Transformer les données pour que site_id soit un objet unique
      const transformedData = (data || []).map((r: any) => ({
        ...r,
        site_id: Array.isArray(r.site_id) ? r.site_id[0] : r.site_id
      }))
      
      setRessources(transformedData as any)
    } catch (err) {
      console.error('Erreur chargement ressources:', err)
      if (onError) onError('Erreur lors du chargement des collaborateurs')
    } finally {
      setLoadingRessources(false)
    }
  }, []) // Retirer onError des dépendances

  // Charger les ressources actives
  useEffect(() => {
    if (open) {
      loadRessources()
    }
  }, [open, loadRessources])

  const loadAbsenceData = useCallback(async () => {
    if (!absenceId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('id', absenceId)
        .single()

      if (error) throw error

      // Utiliser le champ 'motif' pour le motif
      const motif = data.motif || ""
      const isMotifPredefini = MOTIFS_PREDEFINIS.includes(motif)

      setFormData({
        ressource_id: data.ressource_id || "",
        date_debut: data.date_debut || "",
        date_fin: data.date_fin || "",
        motif: motif
      })

      // Si le motif n'est pas prédéfini, afficher le champ personnalisé
      if (motif && !isMotifPredefini) {
        setShowMotifPersonnalise(true)
        setMotifPersonnalise(motif)
      } else {
        setShowMotifPersonnalise(false)
        setMotifPersonnalise("")
      }
    } catch (err) {
      console.error('Erreur chargement absence:', err)
      if (onError) onError('Erreur lors du chargement de l\'absence')
    }
  }, [absenceId]) // Retirer onError et MOTIFS_PREDEFINIS des dépendances

  // Charger les données de l'absence si édition
  useEffect(() => {
    if (open && absenceId) {
      loadAbsenceData()
    } else if (open && !absenceId) {
      // Réinitialiser le formulaire pour une nouvelle absence
      setFormData({
        ressource_id: "",
        date_debut: "",
        date_fin: "",
        motif: ""
      })
      setShowMotifPersonnalise(false)
      setMotifPersonnalise("")
    }
  }, [open, absenceId, loadAbsenceData])

  const handleMotifClick = (motif: string) => {
    setFormData({ ...formData, motif })
    setShowMotifPersonnalise(false)
    setMotifPersonnalise("")
  }

  const handleMotifPersonnaliseChange = (value: string) => {
    setMotifPersonnalise(value)
    setFormData({ ...formData, motif: value })
  }

  const handleDeleteAbsence = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAbsence = async () => {
    if (!absenceId) return

    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('absences')
        .delete()
        .eq('id', absenceId)

      if (error) throw error

      if (onSuccess) onSuccess('Absence supprimée avec succès !')
      
      // Déclencher l'événement de rafraîchissement
      window.dispatchEvent(new Event('absence-deleted'))
      
      setShowDeleteConfirm(false)
      setOpen(false)
      if (onClose) onClose()
    } catch (err: any) {
      console.error('Erreur suppression absence:', err)
      if (onError) onError(err.message || 'Erreur lors de la suppression de l\'absence')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Protection contre la double soumission
    if (loading) return
    
    setLoading(true)

    try {
      // Validation : au moins un motif doit être sélectionné
      const motifFinal = showMotifPersonnalise && motifPersonnalise ? motifPersonnalise : formData.motif
      if (!motifFinal || motifFinal.trim() === '') {
        if (onError) onError('Veuillez sélectionner ou saisir un motif')
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // Calculer le statut automatiquement
      const aujourdHui = new Date()
      aujourdHui.setHours(0, 0, 0, 0)
      const dateDebut = new Date(formData.date_debut)
      const dateFin = new Date(formData.date_fin)
      
      let statut = 'à venir'
      if (dateDebut <= aujourdHui && dateFin >= aujourdHui) {
        statut = 'en cours'
      } else if (dateFin < aujourdHui) {
        statut = 'passée'
      }

      // Récupérer le site du collaborateur
      const ressource = ressources.find(r => r.id === formData.ressource_id)
      const site = ressource?.site_id?.code_site || ''

      // Validation des champs obligatoires
      if (!formData.ressource_id || formData.ressource_id.trim() === '') {
        if (onError) onError('Veuillez sélectionner un collaborateur')
        setLoading(false)
        return
      }

      const data = {
        ressource_id: formData.ressource_id,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        motif: motifFinal,  // Le motif détaillé dans le champ motif
        statut,
        site
      }

      // Ajouter le type seulement pour la création (pas pour la mise à jour)
      const dataWithType = absenceId ? data : { ...data, type: "Autre" }

      if (absenceId) {
        // Mise à jour
        console.log('Données de mise à jour:', data)
        const { error } = await supabase
          .from('absences')
          .update(data)
          .eq('id', absenceId)

        if (error) throw error
        
        if (onSuccess) onSuccess('Absence modifiée avec succès !')
        
        // Déclencher l'événement de rafraîchissement
        window.dispatchEvent(new Event('absence-updated'))
      } else {
        // Création
        const { error } = await supabase
          .from('absences')
          .insert(dataWithType)

        if (error) throw error
        
        if (onSuccess) onSuccess('Absence créée avec succès !')
        
        // Déclencher l'événement de rafraîchissement
        window.dispatchEvent(new Event('absence-created'))
      }

      // Réinitialiser le formulaire
      setFormData({
        ressource_id: "",
        date_debut: "",
        date_fin: "",
        motif: ""
      })
      setShowMotifPersonnalise(false)
      setMotifPersonnalise("")

      setOpen(false)
      if (onClose) onClose()
    } catch (err: any) {
      console.error('Erreur sauvegarde absence:', err)
      if (onError) onError(err.message || 'Erreur lors de la sauvegarde de l\'absence')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {absenceId ? "Modifier l'absence" : "Nouvelle absence"}
          </DialogTitle>
          <DialogDescription>
            {absenceId
              ? "Modifiez les informations de l'absence"
              : "Déclarez une nouvelle absence pour un collaborateur"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Collaborateur */}
            <div className="grid gap-2">
              <Label htmlFor="ressource" className="text-slate-700 font-medium">
                Collaborateur <span className="text-red-500">*</span>
              </Label>
              <Select 
                required
                value={formData.ressource_id}
                onValueChange={(value) => setFormData({ ...formData, ressource_id: value })}
                disabled={loadingRessources}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder={loadingRessources ? "Chargement..." : "Sélectionner un collaborateur"} />
                </SelectTrigger>
                <SelectContent>
                  {ressources.map((ressource) => (
                    <SelectItem key={ressource.id} value={ressource.id}>
                      {ressource.prenom} {ressource.nom} ({ressource.site_id?.code_site || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date_debut" className="text-slate-700 font-medium">
                  Date début <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_debut"
                  type="date"
                  required
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date_fin" className="text-slate-700 font-medium">
                  Date fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_fin"
                  type="date"
                  required
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Motif */}
            <div className="grid gap-3">
              <Label className="text-slate-700 font-medium">
                Motif de l'absence <span className="text-red-500">*</span>
              </Label>
              
              {/* Motifs prédéfinis */}
              <div className="grid grid-cols-2 gap-2">
                {MOTIFS_PREDEFINIS.map((motif) => (
                  <Button
                    key={motif}
                    type="button"
                    variant={formData.motif === motif && !showMotifPersonnalise ? "default" : "outline"}
                    className={`justify-start h-auto py-2 px-3 text-sm ${
                      formData.motif === motif && !showMotifPersonnalise
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleMotifClick(motif)}
                  >
                    <span className="truncate">{motif}</span>
                  </Button>
                ))}
              </div>
              
              {/* Bouton "Autre motif" */}
              {!showMotifPersonnalise && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => setShowMotifPersonnalise(true)}
                >
                  + Autre motif
                </Button>
              )}
              
              {/* Champ motif personnalisé */}
              {showMotifPersonnalise && (
                <div className="grid gap-2">
                  <Input
                    placeholder="Saisissez un motif personnalisé..."
                    value={motifPersonnalise}
                    onChange={(e) => handleMotifPersonnaliseChange(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setShowMotifPersonnalise(false)
                      setMotifPersonnalise("")
                      setFormData({ ...formData, motif: "" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div>
                {absenceId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAbsence}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : absenceId ? "Modifier" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Modal de confirmation de suppression */}
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Cette action est irréversible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-slate-700">
            Êtes-vous sûr de vouloir supprimer cette absence ? Cette action ne peut pas être annulée.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDeleteAbsence}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}