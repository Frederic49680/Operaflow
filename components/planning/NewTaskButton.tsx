"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { toast } from "sonner"
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
import { createClient } from "@/lib/supabase/client"

interface NewTaskButtonProps {
  onTaskCreated?: (task: any) => void
}

export default function NewTaskButton({ onTaskCreated }: NewTaskButtonProps) {
  const { createTask } = useTasks()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // État du formulaire
  const [libelleTache, setLibelleTache] = useState("")
  const [affaireId, setAffaireId] = useState("")
  const [siteId, setSiteId] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [effortH, setEffortH] = useState("8")
  const [statut, setStatut] = useState("Non lancé")
  const [typeTache, setTypeTache] = useState("Autre")
  
  // Liste des affaires et sites
  const [affaires, setAffaires] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les affaires
      const { data: affairesData, error: affairesError } = await supabase
        .from('affaires')
        .select('id, nom, code_affaire, statut')
        .in('statut', ['Brouillon', 'Soumise', 'Validée', 'Planifiée'])
        .order('nom')
      
      if (affairesError) throw affairesError
      setAffaires(affairesData || [])
      
      // Charger les sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, nom, code_site')
        .eq('statut', 'Actif')
        .order('nom')
      
      if (sitesError) throw sitesError
      setSites(sitesData || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!libelleTache) {
      toast.error("Le nom de la tâche est obligatoire")
      return
    }

    try {
      setIsCreating(true)
      
      const newTask = await createTask({
        libelle_tache: libelleTache,
        affaire_id: affaireId || undefined,
        site_id: siteId || undefined,
        date_debut_plan: dateDebut || undefined,
        date_fin_plan: dateFin || undefined,
        effort_plan_h: effortH ? parseFloat(effortH) : 8,
        avancement_pct: 0,
        statut: statut,
        type_tache: typeTache
      })
      
      onTaskCreated?.(newTask)
      setIsOpen(false)
      resetForm()
      toast.success("Tâche créée avec succès")
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error("Erreur lors de la création de la tâche")
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setLibelleTache("")
    setAffaireId("")
    setSiteId("")
    setDateDebut("")
    setDateFin("")
    setEffortH("8")
    setStatut("Non lancé")
    setTypeTache("Autre")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Nouvelle tâche
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle tâche pour un affaire
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Nom de la tâche */}
            <div className="grid gap-2">
              <Label htmlFor="libelle" className="text-slate-700 font-medium">
                Nom de la tâche <span className="text-red-500">*</span>
              </Label>
              <Input
                id="libelle"
                value={libelleTache}
                onChange={(e) => setLibelleTache(e.target.value)}
                placeholder="Ex: Études préliminaires"
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Affaire */}
            <div className="grid gap-2">
              <Label htmlFor="affaire" className="text-slate-700 font-medium">
                Affaire
              </Label>
              <Select value={affaireId} onValueChange={setAffaireId} disabled={loading}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner une affaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune affaire</SelectItem>
                  {affaires.map((aff) => (
                    <SelectItem key={aff.id} value={aff.id}>
                      {aff.code_affaire} - {aff.nom} ({aff.statut})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site */}
            <div className="grid gap-2">
              <Label htmlFor="site" className="text-slate-700 font-medium">
                Site
              </Label>
              <Select value={siteId} onValueChange={setSiteId} disabled={loading}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun site</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.code_site} - {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates et effort */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateDebut" className="text-slate-700 font-medium">
                  Date début
                </Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFin" className="text-slate-700 font-medium">
                  Date fin
                </Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Effort et type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="effort" className="text-slate-700 font-medium">
                  Effort (heures)
                </Label>
                <Input
                  id="effort"
                  type="number"
                  value={effortH}
                  onChange={(e) => setEffortH(e.target.value)}
                  placeholder="8"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-slate-700 font-medium">
                  Type
                </Label>
                <Select value={typeTache} onValueChange={setTypeTache}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
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

            {/* Statut */}
            <div className="grid gap-2">
              <Label htmlFor="statut" className="text-slate-700 font-medium">
                Statut
              </Label>
              <Select value={statut} onValueChange={setStatut}>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isCreating ? "Création..." : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
