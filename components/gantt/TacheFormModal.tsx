"use client"

import { useState, useMemo, useEffect } from "react"
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
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface TacheFormModalProps {
  children: React.ReactNode
  tacheId?: string
  onSuccess?: () => void
}

export function TacheFormModal({ children, tacheId, onSuccess }: TacheFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // États pour les champs du formulaire
  const [libelle, setLibelle] = useState("")
  const [selectedAffaire, setSelectedAffaire] = useState("")
  const [selectedLot, setSelectedLot] = useState("")
  const [typeTache, setTypeTache] = useState("Exécution")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [avancement, setAvancement] = useState("0")
  const [selectedStatut, setSelectedStatut] = useState("Non lancé")
  
  // États pour les données chargées
  const [affaires, setAffaires] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Charger les affaires et lots quand le modal s'ouvre
  useEffect(() => {
    if (!open) return
    
    const loadData = async () => {
      setLoadingData(true)
      const supabase = createClient()
      
      try {
        // Charger les affaires
        const { data: affairesData } = await supabase
          .from('affaires')
          .select('id, code_affaire, nom')
          .in('statut', ['Validee', 'A_planifier'])
          .order('nom')
        setAffaires(affairesData || [])
        
        // Charger les lots si une affaire est sélectionnée
        if (selectedAffaire) {
          const { data: lotsData } = await supabase
            .from('affaires_lots_financiers')
            .select('id, libelle')
            .eq('affaire_id', selectedAffaire)
            .order('libelle')
          setLots(lotsData || [])
        }
      } catch (error) {
        console.error('Erreur chargement données:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    loadData()
  }, [open, selectedAffaire])

  // Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    return libelle.trim() !== '' && 
           selectedAffaire !== '' && 
           dateDebut !== '' && 
           dateFin !== ''
  }, [libelle, selectedAffaire, dateDebut, dateFin])

  // Message d'erreur pour les champs manquants
  const validationMessage = useMemo(() => {
    if (isFormValid) return null
    
    const missingFields = []
    if (!libelle.trim()) missingFields.push("Libellé de la tâche")
    if (!selectedAffaire) missingFields.push("Affaire")
    if (!dateDebut) missingFields.push("Date de début")
    if (!dateFin) missingFields.push("Date de fin")
    
    return `Champs obligatoires manquants : ${missingFields.join(", ")}`
  }, [isFormValid, libelle, selectedAffaire, dateDebut, dateFin])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const tacheData = {
        libelle_tache: libelle,
        affaire_id: selectedAffaire,
        lot_id: selectedLot || null,
        type_tache: typeTache,
        date_debut_plan: dateDebut,
        date_fin_plan: dateFin,
        effort_plan_h: 0,
        competence: null,
        avancement_pct: parseFloat(avancement) || 0,
        statut: selectedStatut,
      }

      const { error } = await supabase
        .from('planning_taches')
        .insert([tacheData])

      if (error) throw error

      toast.success("Tâche créée avec succès")
      setOpen(false)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error)
      toast.error("Erreur lors de la création de la tâche")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {tacheId ? "Modifier la tâche" : "Nouvelle tâche"}
          </DialogTitle>
          <DialogDescription>
            {tacheId
              ? "Modifiez les informations de la tâche"
              : "Créez une nouvelle tâche de planification"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Affaire et Lot */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="affaire" className="text-slate-700 font-medium">
                  Affaire <span className="text-red-500">*</span>
                </Label>
                <Select 
                  name="affaire" 
                  required
                  value={selectedAffaire}
                  onValueChange={setSelectedAffaire}
                  disabled={loadingData}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {affaires.map((affaire) => (
                      <SelectItem key={affaire.id} value={affaire.id}>
                        {affaire.code_affaire} - {affaire.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lot" className="text-slate-700 font-medium">
                  Lot financier
                </Label>
                <Select 
                  name="lot"
                  value={selectedLot}
                  onValueChange={setSelectedLot}
                  disabled={loadingData || !selectedAffaire}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder={!selectedAffaire ? "Sélectionner d'abord une affaire" : "Sélectionner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Libellé et Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="libelle" className="text-slate-700 font-medium">
                  Libellé de la tâche <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="libelle"
                  name="libelle"
                  placeholder="Études préliminaires"
                  required
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-slate-700 font-medium">
                  Type
                </Label>
                <Select 
                  name="type"
                  value={typeTache}
                  onValueChange={setTypeTache}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Préparation">Préparation</SelectItem>
                    <SelectItem value="Exécution">Exécution</SelectItem>
                    <SelectItem value="Contrôle">Contrôle</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date_debut" className="text-slate-700 font-medium">
                  Date début <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_debut"
                  name="date_debut"
                  type="date"
                  required
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date_fin" className="text-slate-700 font-medium">
                  Date fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_fin"
                  name="date_fin"
                  type="date"
                  required
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Effort et Compétence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="effort" className="text-slate-700 font-medium">
                  Effort prévu (h)
                </Label>
                <Input
                  id="effort"
                  name="effort"
                  type="number"
                  placeholder="40"
                  disabled
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competence" className="text-slate-700 font-medium">
                  Compétence requise
                </Label>
                <Select name="competence" disabled>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Électricité">Électricité</SelectItem>
                    <SelectItem value="CVC">CVC</SelectItem>
                    <SelectItem value="Automatisme">Automatisme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Avancement et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="avancement" className="text-slate-700 font-medium">
                  Avancement (%)
                </Label>
                <Input
                  id="avancement"
                  name="avancement"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={avancement}
                  onChange={(e) => setAvancement(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut" className="text-slate-700 font-medium">
                  Statut <span className="text-red-500">*</span>
                </Label>
                <Select 
                  name="statut" 
                  required 
                  value={selectedStatut}
                  onValueChange={setSelectedStatut}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non lancé">Non lancé</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="Bloqué">Bloqué</SelectItem>
                    <SelectItem value="Reporté">Reporté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3">
            {/* Message de validation */}
            {!isFormValid && validationMessage && (
              <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 flex items-center gap-2">
                  <span className="text-orange-600">⚠️</span>
                  {validationMessage}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex-1"
                disabled={loading || !isFormValid}
              >
                {loading ? "Enregistrement..." : tacheId ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

