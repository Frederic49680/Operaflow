"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"
import { LotsFinanciersTable } from "./LotsFinanciersTable"

interface AffaireFormModalProps {
  children: React.ReactNode
  affaireId?: string
  onClose?: () => void
}

interface Site {
  id: string
  nom: string
  code_site: string
}

interface Client {
  id: string
  nom_client: string
}

interface Ressource {
  id: string
  nom: string
  prenom: string
}

export function AffaireFormModal({ children, affaireId, onClose }: AffaireFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [typeAffaire, setTypeAffaire] = useState("Forfait")
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // États pour le calcul de capacité BPU
  const [nbRessources, setNbRessources] = useState(2)
  const [heuresSemaine, setHeuresSemaine] = useState(35)
  const [periodeDebut, setPeriodeDebut] = useState("")
  const [periodeFin, setPeriodeFin] = useState("")
  
  // États pour les données chargées
  const [sites, setSites] = useState<Site[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  // État pour les données de l'affaire en édition
  const [affaireData, setAffaireData] = useState<any>(null)
  
  // États pour les valeurs des Select
  const [selectedSite, setSelectedSite] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedResponsable, setSelectedResponsable] = useState<string>("")
  const [selectedCompetence, setSelectedCompetence] = useState<string>("")
  const [selectedStatut, setSelectedStatut] = useState<string>("Brouillon")
  
  // États pour les valeurs des Input
  const [nom, setNom] = useState<string>("")
  const [codeAffaire, setCodeAffaire] = useState<string>("")
  const [numCommande, setNumCommande] = useState<string>("")
  const [montant, setMontant] = useState<string>("")
  const [dateDebut, setDateDebut] = useState<string>("")
  const [dateFin, setDateFin] = useState<string>("")
  
  // Calcul automatique de la capacité
  const heuresCapacite = useMemo(() => {
    if (typeAffaire !== "BPU" || !periodeDebut || !periodeFin) return 0
    
    const debut = new Date(periodeDebut)
    const fin = new Date(periodeFin)
    const diffTime = Math.abs(fin.getTime() - debut.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const nbSemaines = Math.ceil(diffDays / 7)
    
    return nbRessources * heuresSemaine * nbSemaines
  }, [typeAffaire, nbRessources, heuresSemaine, periodeDebut, periodeFin])
  
  // Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    // Champs obligatoires de base
    if (!nom || !codeAffaire || !selectedSite || !selectedClient || !selectedResponsable) {
      return false
    }
    
    // Montant obligatoire
    if (!montant || parseFloat(montant) <= 0) {
      return false
    }
    
    // Pour BPU, vérifier les dates de période
    if (typeAffaire === "BPU" && (!periodeDebut || !periodeFin)) {
      return false
    }
    
    return true
  }, [nom, codeAffaire, selectedSite, selectedClient, selectedResponsable, montant, typeAffaire, periodeDebut, periodeFin])
  
  // Message d'erreur pour les champs manquants
  const validationMessage = useMemo(() => {
    if (isFormValid) return null
    
    const missingFields = []
    if (!nom) missingFields.push("Nom de l'affaire")
    if (!codeAffaire) missingFields.push("Code affaire")
    if (!selectedSite) missingFields.push("Site")
    if (!selectedClient) missingFields.push("Client")
    if (!selectedResponsable) missingFields.push("Responsable")
    if (!montant || parseFloat(montant) <= 0) missingFields.push("Montant")
    if (typeAffaire === "BPU" && !periodeDebut) missingFields.push("Date début période")
    if (typeAffaire === "BPU" && !periodeFin) missingFields.push("Date fin période")
    
    return `Champs obligatoires manquants : ${missingFields.join(", ")}`
  }, [isFormValid, nom, codeAffaire, selectedSite, selectedClient, selectedResponsable, montant, typeAffaire, periodeDebut, periodeFin])
  
  // Réinitialiser les états quand le modal se ferme
  useEffect(() => {
    if (!open) {
      // Réinitialiser tous les états
      setNom("")
      setCodeAffaire("")
      setNumCommande("")
      setMontant("")
      setDateDebut("")
      setDateFin("")
      setSelectedSite("")
      setSelectedClient("")
      setSelectedResponsable("")
      setSelectedCompetence("")
      setSelectedStatut("Brouillon")
      setTypeAffaire("Forfait")
      setNbRessources(2)
      setHeuresSemaine(35)
      setPeriodeDebut("")
      setPeriodeFin("")
      setAffaireData(null)
    }
  }, [open])
  
  // Charger les données de l'affaire en mode édition
  useEffect(() => {
    if (!open || !affaireId) return
    
    const loadAffaire = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('affaires')
        .select('*')
        .eq('id', affaireId)
        .single()
      
      if (data && !error) {
        setAffaireData(data)
        // Pré-remplir les champs
        setNom(data.nom || "")
        setCodeAffaire(data.code_affaire || "")
        setNumCommande(data.num_commande || "")
        setMontant(data.montant_total_ht?.toString() || "")
        setDateDebut(data.date_debut || "")
        setDateFin(data.date_fin_prevue || "")
        setSelectedSite(data.site_id || "")
        setSelectedClient(data.client_id || "")
        setSelectedResponsable(data.responsable_id || "")
        setSelectedCompetence(data.competence_principale || "")
        setSelectedStatut(data.statut || "Brouillon")
        setTypeAffaire(data.type_affaire || "Forfait")
        setNbRessources(data.nb_ressources_ref || 2)
        setHeuresSemaine(data.heures_semaine_ref || 35)
        setPeriodeDebut(data.periode_debut || "")
        setPeriodeFin(data.periode_fin || "")
      }
    }
    
    loadAffaire()
  }, [open, affaireId])
  
  // Charger les données quand le modal s'ouvre
  useEffect(() => {
    if (!open) return
    
    const loadData = async () => {
      setLoadingData(true)
      const supabase = createClient()
      
      try {
        // Charger les sites
        const { data: sitesData, error: sitesError } = await supabase
          .from('sites')
          .select('id, nom, code_site')
          .in('statut', ['Actif', 'En pause'])
          .order('nom')
        
        if (sitesError) throw sitesError
        setSites(sitesData || [])
        
        // Charger les clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, nom_client')
          .eq('actif', true)
          .order('nom_client')
        
        if (clientsError) throw clientsError
        setClients(clientsData || [])
        
        // Charger les ressources
        const { data: ressourcesData, error: ressourcesError } = await supabase
          .from('ressources')
          .select('id, nom, prenom')
          .eq('actif', true)
          .order('nom')
        
        if (ressourcesError) throw ressourcesError
        setRessources(ressourcesData || [])
        
        // Si en mode édition, charger les données de l'affaire
        if (affaireId) {
          const response = await fetch(`/api/affaires/${affaireId}`)
          if (response.ok) {
            const affaire = await response.json()
            setAffaireData(affaire)
            
            // Mettre à jour tous les champs du formulaire
            setNom(affaire.nom || "")
            setCodeAffaire(affaire.code_affaire || "")
            setNumCommande(affaire.num_commande || "")
            setMontant(affaire.montant_total_ht?.toString() || "")
            setDateDebut(affaire.date_debut || "")
            setDateFin(affaire.date_fin_prevue || "")
            setSelectedSite(affaire.site_id || "")
            setSelectedClient(affaire.client_id || "")
            setSelectedResponsable(affaire.responsable_id || "")
            setSelectedCompetence(affaire.competence_principale || "")
            setSelectedStatut(affaire.statut || "Brouillon")
            setTypeAffaire(affaire.type_affaire || "Forfait")
            
            if (affaire.type_affaire === "BPU") {
              setNbRessources(affaire.nb_ressources_ref || 2)
              setHeuresSemaine(affaire.heures_semaine_ref || 35)
              setPeriodeDebut(affaire.periode_debut || "")
              setPeriodeFin(affaire.periode_fin || "")
            }
          }
        }
      } catch (error) {
        console.error('Erreur chargement données:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    loadData()
  }, [open, affaireId])
  
  // Ouvrir automatiquement le modal si affaireId est fourni
  useEffect(() => {
    if (affaireId) {
      setOpen(true)
    }
  }, [affaireId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Utiliser les états pour construire les données
      const data = {
        code_affaire: codeAffaire,
        nom: nom,
        site_id: selectedSite,
        responsable_id: selectedResponsable,
        client_id: selectedClient,
        competence_principale: selectedCompetence,
        num_commande: numCommande,
        type_affaire: typeAffaire,
        montant_total_ht: montant ? parseFloat(montant) : null,
        // Pour BPU, utiliser les dates de période ; sinon les dates classiques
        date_debut: typeAffaire === "BPU" ? periodeDebut : dateDebut,
        date_fin_prevue: typeAffaire === "BPU" ? periodeFin : dateFin,
        statut: selectedStatut,
        // Champs BPU
        nb_ressources_ref: typeAffaire === "BPU" ? nbRessources : null,
        heures_semaine_ref: typeAffaire === "BPU" ? heuresSemaine : null,
        periode_debut: typeAffaire === "BPU" ? periodeDebut : null,
        periode_fin: typeAffaire === "BPU" ? periodeFin : null,
      }

      console.log("Données à envoyer:", data)

      // Envoyer à l'API (POST pour création, PUT pour modification)
      const url = affaireId ? `/api/affaires/${affaireId}` : "/api/affaires"
      const method = affaireId ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Erreur création affaire:", error)
        console.error("Status:", response.status)
        setToast({ type: 'error', message: "Erreur lors de la création de l'affaire : " + (error.error || "Erreur inconnue") })
        return
      }

      const result = await response.json()
      console.log(`✅ Affaire ${affaireId ? 'modifiée' : 'créée'} avec succès:`, result)
      console.log("ID affaire:", result.data?.id)

      // Afficher un message de succès
      setToast({ type: 'success', message: `Affaire ${affaireId ? 'modifiée' : 'créée'} avec succès !` })

      // Fermer le modal et déclencher un événement de rafraîchissement
      setOpen(false)
      setAffaireData(null)
      if (onClose) {
        onClose()
      }
      window.dispatchEvent(new Event('affaire-created'))
    } catch (error) {
      console.error("Erreur:", error)
      setToast({ type: 'error', message: "Erreur lors de la création de l'affaire" })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen && onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {affaireId ? "Modifier l'affaire" : "Nouvelle affaire"}
          </DialogTitle>
          <DialogDescription>
            {affaireId
              ? "Modifiez les informations de l'affaire"
              : "Créez une nouvelle affaire avec son découpage financier"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="informations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informations">Informations</TabsTrigger>
              <TabsTrigger value="lots">Lots financiers</TabsTrigger>
            </TabsList>

            {/* Onglet Informations */}
            <TabsContent value="informations" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="nom" className="text-slate-700 font-medium">
                  Nom de l'affaire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  placeholder="Ex: Modernisation poste HTA - Site E-03A"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code_affaire" className="text-slate-700 font-medium">
                    Code affaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code_affaire"
                    name="code_affaire"
                    placeholder="AFF-2025-001"
                    required
                    value={codeAffaire}
                    onChange={(e) => setCodeAffaire(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="num_commande" className="text-slate-700 font-medium">
                    N° de commande
                  </Label>
                  <Input
                    id="num_commande"
                    name="num_commande"
                    placeholder="CMD-2025-123"
                    value={numCommande}
                    onChange={(e) => setNumCommande(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="site" className="text-slate-700 font-medium">
                    Site <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="site" 
                    required 
                    disabled={loadingData} 
                    value={selectedSite}
                    onValueChange={setSelectedSite}
                  >
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner un site"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.code_site} - {site.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client" className="text-slate-700 font-medium">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="client" 
                    required 
                    disabled={loadingData} 
                    value={selectedClient}
                    onValueChange={setSelectedClient}
                  >
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom_client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="responsable" className="text-slate-700 font-medium">
                    Responsable <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    name="responsable" 
                    required 
                    disabled={loadingData} 
                    value={selectedResponsable}
                    onValueChange={setSelectedResponsable}
                  >
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ressources.map((ressource) => (
                        <SelectItem key={ressource.id} value={ressource.id}>
                          {ressource.prenom} {ressource.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="competence" className="text-slate-700 font-medium">
                    Compétence principale
                  </Label>
                  <Select 
                    name="competence" 
                    value={selectedCompetence}
                    onValueChange={setSelectedCompetence}
                  >
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type_affaire" className="text-slate-700 font-medium">
                    Type d'affaire <span className="text-red-500">*</span>
                  </Label>
                  <Select required value={typeAffaire} onValueChange={setTypeAffaire}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BPU">
                        <div className="flex items-center gap-2">
                          <span>BPU</span>
                          <Badge variant="outline" className="text-xs">Bordereau Prix Unitaire</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="Forfait">Forfait</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="montant" className="text-slate-700 font-medium">
                    Montant total HT <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="montant"
                    name="montant"
                    type="number"
                    placeholder="150000"
                    required
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Champs spécifiques BPU */}
              {typeAffaire === "BPU" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-600">BPU</Badge>
                    <span className="text-sm font-medium text-blue-900">Paramètres spécifiques BPU</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nb_ressources_ref" className="text-slate-700 font-medium text-sm">
                        Nb. ressources référence
                      </Label>
                      <Input
                        id="nb_ressources_ref"
                        name="nb_ressources_ref"
                        type="number"
                        placeholder="2"
                        value={nbRessources}
                        onChange={(e) => setNbRessources(parseInt(e.target.value) || 2)}
                        min="1"
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="heures_semaine_ref" className="text-slate-700 font-medium text-sm">
                        Heures/semaine référence
                      </Label>
                      <Input
                        id="heures_semaine_ref"
                        name="heures_semaine_ref"
                        type="number"
                        placeholder="35"
                        value={heuresSemaine}
                        onChange={(e) => setHeuresSemaine(parseFloat(e.target.value) || 35)}
                        min="1"
                        max="168"
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="periode_debut" className="text-slate-700 font-medium text-sm">
                        Période début
                      </Label>
                      <Input
                        id="periode_debut"
                        name="periode_debut"
                        type="date"
                        value={periodeDebut}
                        onChange={(e) => setPeriodeDebut(e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="periode_fin" className="text-slate-700 font-medium text-sm">
                        Période fin
                      </Label>
                      <Input
                        id="periode_fin"
                        name="periode_fin"
                        type="date"
                        value={periodeFin}
                        onChange={(e) => setPeriodeFin(e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="heures_capacite" className="text-slate-700 font-medium text-sm">
                        Capacité totale (h) - Auto
                      </Label>
                      <Input
                        id="heures_capacite"
                        name="heures_capacite"
                        type="number"
                        value={heuresCapacite}
                        disabled
                        className="border-slate-300 bg-slate-100"
                      />
                      <p className="text-xs text-slate-500">
                        = {nbRessources} × {heuresSemaine}h/sem × {periodeDebut && periodeFin ? Math.ceil(Math.abs(new Date(periodeFin).getTime() - new Date(periodeDebut).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0} semaines
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Prochaine étape :</strong> Après la création de l'affaire, vous pourrez importer le CSV BPU via le bouton "Importer BPU" sur la fiche affaire.
                    </p>
                  </div>
                </div>
              )}

              {/* Dates début/fin - masquées pour BPU (utilisent les dates de période) */}
              {typeAffaire !== "BPU" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date_debut" className="text-slate-700 font-medium">
                      Date début
                    </Label>
                    <Input
                      id="date_debut"
                      name="date_debut"
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date_fin" className="text-slate-700 font-medium">
                      Date fin prévue
                    </Label>
                    <Input
                      id="date_fin"
                      name="date_fin"
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

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
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                      <SelectItem value="A_planifier">À planifier</SelectItem>
                      <SelectItem value="Validee">Validée</SelectItem>
                      <SelectItem value="Cloturee">Clôturée</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </TabsContent>

            {/* Onglet Lots financiers */}
            <TabsContent value="lots" className="space-y-4 mt-4">
              {affaireId ? (
                <LotsFinanciersTable affaireId={affaireId} />
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Découpage financier</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Définissez les lots financiers de l'affaire. Les lots seront créés après la création de l'affaire.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <span className="text-blue-600">💡</span>
                      Vous pourrez ajouter et gérer les lots après la création de l'affaire
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex-col gap-3">
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
                {loading ? "Enregistrement..." : affaireId ? "Modifier l'affaire" : "Créer l'affaire"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Toast notifications */}
      {toast && toast.type === 'success' && (
        <SuccessToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {toast && toast.type === 'error' && (
        <ErrorToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </Dialog>
  )
}

