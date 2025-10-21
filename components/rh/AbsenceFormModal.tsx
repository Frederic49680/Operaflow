"use client"

import { useState, useEffect, useCallback } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  
  // Motifs prédéfinis
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
  
  const [motifPersonnalise, setMotifPersonnalise] = useState("")
  const [showMotifPersonnalise, setShowMotifPersonnalise] = useState(false)

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
          site_id:sites!inner (
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
  }, [])

  // Charger les ressources actives
  useEffect(() => {
    if (open) {
      loadRessources()
    }
  }, [open, loadRessources])

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
    }
  }, [open, absenceId, loadAbsenceData])

  const loadAbsenceData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('id', absenceId)
        .single()

      if (error) throw error

      // Utiliser le champ 'type' pour le motif (ou 'motif' en fallback)
      const motif = data.type || data.motif || ""
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
  }, [absenceId, onError])

  const handleMotifClick = (motif: string) => {
    setFormData({ ...formData, motif })
    setShowMotifPersonnalise(false)
    setMotifPersonnalise("")
  }

  const handleMotifPersonnaliseChange = (value: string) => {
    setMotifPersonnalise(value)
    setFormData({ ...formData, motif: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

      const data = {
        ressource_id: formData.ressource_id,
        type: motifFinal,  // Utiliser le champ 'type' pour stocker le motif
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        motif: motifFinal,  // Garder aussi dans motif pour compatibilité
        statut,
        site
      }

      if (absenceId) {
        // Mise à jour
        const { error } = await supabase
          .from('absences')
          .update(data)
          .eq('id', absenceId)

        if (error) throw error
        
        if (onSuccess) onSuccess('Absence modifiée avec succès !')
        
        // Vérifier et créer une alerte visite médicale si nécessaire
        if (onAbsenceCreated) {
          await onAbsenceCreated(data)
        }
        
        // Déclencher l'événement de rafraîchissement
        window.dispatchEvent(new Event('absence-updated'))
        
        // Actualiser la page après un court délai (invisible pour l'utilisateur)
        setTimeout(() => {
          window.location.reload()
        }, 100)
      } else {
        // Création
        const { error } = await supabase
          .from('absences')
          .insert(data)

        if (error) throw error
        
        if (onSuccess) onSuccess('Absence créée avec succès !')
        
        // Vérifier et créer une alerte visite médicale si nécessaire
        if (onAbsenceCreated) {
          await onAbsenceCreated(data)
        }
        
        // Déclencher l'événement de rafraîchissement
        window.dispatchEvent(new Event('absence-created'))
        
        // Actualiser la page après un court délai (invisible pour l'utilisateur)
        setTimeout(() => {
          window.location.reload()
        }, 100)
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

