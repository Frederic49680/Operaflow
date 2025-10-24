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
import { Trash2 } from "lucide-react"

interface Site {
  id: string
  code_site: string
  nom: string
}

interface Client {
  id: string
  nom_client: string
}

interface InterlocuteurFormModalProps {
  children?: React.ReactNode
  interlocuteurId?: string
  onClose?: () => void
}

export function InterlocuteurFormModal({ children, interlocuteurId, onClose }: InterlocuteurFormModalProps) {
  const [open, setOpen] = useState(!!interlocuteurId)
  const [loading, setLoading] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingSites, setLoadingSites] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)
  
  // États pour la création de nouveau client
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    nom_client: "",
    siret: "",
    adresse: "",
    code_postal: "",
    ville: "",
    telephone: "",
    email: "",
    categorie: "MOA"
  })
  const [creatingClient, setCreatingClient] = useState(false)
  
  // États du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    client_id: "",
    fonction: "",
    type_interlocuteur: "",
    site_id: "",
    email: "",
    telephone: "",
    disponibilite: "",
    notes: "",
    actif: true
  })

  // Charger les sites
  const loadSites = useCallback(async () => {
    setLoadingSites(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sites')
      .select('id, code_site, nom')
      .in('statut', ['Actif', 'En pause'])
      .order('nom')
    
    if (error) {
      console.error('Erreur chargement sites:', error)
    } else {
      setSites(data || [])
    }
    setLoadingSites(false)
  }, [])

  // Charger les clients
  const loadClients = useCallback(async () => {
    setLoadingClients(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clients')
      .select('id, nom_client')
      .eq('actif', true)
      .order('nom_client')
    
    if (error) {
      console.error('Erreur chargement clients:', error)
    } else {
      setClients(data || [])
    }
    setLoadingClients(false)
  }, [])

  // Charger les données de l'interlocuteur existant
  const loadInterlocuteurData = useCallback(async () => {
    if (!interlocuteurId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('interlocuteurs')
        .select('*')
        .eq('id', interlocuteurId)
        .single()
      
      if (error) throw error
      
      if (data) {
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          fonction: data.fonction || '',
          type_interlocuteur: data.type_interlocuteur || 'Autre',
          email: data.email || '',
          telephone: data.telephone || '',
          client_id: data.client_id || '',
          site_id: data.site_id || '',
          disponibilite: data.disponibilite || '',
          notes: data.notes || '',
          actif: data.actif ?? true
        })
      }
    } catch (error) {
      console.error('Erreur chargement interlocuteur:', error)
    }
  }, [interlocuteurId])

  // Supprimer l'interlocuteur
  const handleDeleteInterlocuteur = async () => {
    if (!interlocuteurId) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('interlocuteurs')
        .delete()
        .eq('id', interlocuteurId)
      
      if (error) throw error
      
      setOpen(false)
      onClose?.()
      
      // Déclencher un événement pour rafraîchir le tableau
      window.dispatchEvent(new CustomEvent('interlocuteur-deleted'))
      
    } catch (error) {
      console.error('Erreur suppression interlocuteur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les données quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      loadSites()
      loadClients()
      if (interlocuteurId) {
        loadInterlocuteurData()
      }
    }
  }, [open, loadSites, loadClients, loadInterlocuteurData, interlocuteurId])

  // Créer un nouveau client
  const createNewClient = async () => {
    setCreatingClient(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...newClientData,
          actif: true
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Recharger la liste des clients
      await loadClients()
      
      // Sélectionner automatiquement le nouveau client
      setFormData(prev => ({ ...prev, client_id: data.id }))
      
      // Déclencher un événement pour rafraîchir le tableau
      window.dispatchEvent(new CustomEvent('client-created'))
      
      // Fermer le formulaire de nouveau client
      setShowNewClientForm(false)
      
      // Réinitialiser les données du nouveau client
      setNewClientData({
        nom_client: "",
        siret: "",
        adresse: "",
        code_postal: "",
        ville: "",
        telephone: "",
        email: "",
        categorie: "MOA"
      })
      
    } catch (error) {
      console.error('Erreur création client:', error)
    } finally {
      setCreatingClient(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      if (interlocuteurId) {
        // Mode édition
        const { error } = await supabase
          .from('interlocuteurs')
          .update(formData)
          .eq('id', interlocuteurId)
        
        if (error) throw error
      } else {
        // Mode création
        const { error } = await supabase
          .from('interlocuteurs')
          .insert([formData])
        
        if (error) throw error
      }

      setOpen(false)
      onClose?.()
      
      // Déclencher un événement pour rafraîchir le tableau
      window.dispatchEvent(new CustomEvent('interlocuteur-created'))
      
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        client_id: "",
        fonction: "",
        type_interlocuteur: "",
        site_id: "",
        email: "",
        telephone: "",
        disponibilite: "",
        notes: "",
        actif: true
      })
    } catch (error) {
      console.error('Erreur sauvegarde interlocuteur:', error)
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
            {interlocuteurId ? "Modifier le contact" : "Nouveau contact"}
          </DialogTitle>
          <DialogDescription>
            {interlocuteurId
              ? "Modifiez les informations du contact"
              : "Ajoutez un nouveau contact client"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nom" className="text-slate-700 font-medium">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="Dupont"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prenom" className="text-slate-700 font-medium">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prenom"
                  placeholder="Jean"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Client et Fonction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="client" className="text-slate-700 font-medium">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewClientForm(true)}
                    className="text-xs"
                  >
                    + Nouveau client
                  </Button>
                </div>
                <Select 
                  required 
                  value={formData.client_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionner"} />
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
              <div className="grid gap-2">
                <Label htmlFor="fonction" className="text-slate-700 font-medium">
                  Fonction
                </Label>
                <Input
                  id="fonction"
                  placeholder="Responsable Technique"
                  value={formData.fonction}
                  onChange={(e) => setFormData(prev => ({ ...prev, fonction: e.target.value }))}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Type et Site */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-slate-700 font-medium">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select 
                  required 
                  value={formData.type_interlocuteur}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type_interlocuteur: value }))}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technique">Technique</SelectItem>
                    <SelectItem value="Administratif">Administratif</SelectItem>
                    <SelectItem value="Facturation">Facturation</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site" className="text-slate-700 font-medium">
                  Site
                </Label>
                <Select 
                  value={formData.site_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, site_id: value }))}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder={loadingSites ? "Chargement..." : "Sélectionner (optionnel)"} />
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
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telephone" className="text-slate-700 font-medium">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Disponibilité */}
            <div className="grid gap-2">
              <Label htmlFor="disponibilite" className="text-slate-700 font-medium">
                Disponibilité
              </Label>
              <Input
                id="disponibilite"
                placeholder="8h-17h"
                value={formData.disponibilite}
                onChange={(e) => setFormData(prev => ({ ...prev, disponibilite: e.target.value }))}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Notes internes..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {interlocuteurId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cet interlocuteur ?')) {
                      handleDeleteInterlocuteur()
                    }
                  }}
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
                {loading ? "Enregistrement..." : interlocuteurId ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Modal pour créer un nouveau client */}
      <Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Nouveau client
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau client pour l'ajouter à la liste
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nom du client */}
            <div className="grid gap-2">
              <Label htmlFor="nom_client" className="text-slate-700 font-medium">
                Nom du client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom_client"
                placeholder="Ex: TotalEnergies"
                value={newClientData.nom_client}
                onChange={(e) => setNewClientData(prev => ({ ...prev, nom_client: e.target.value }))}
                className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            {/* SIRET et Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="siret" className="text-slate-700 font-medium">
                  SIRET
                </Label>
                <Input
                  id="siret"
                  placeholder="12345678901234"
                  value={newClientData.siret}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, siret: e.target.value }))}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categorie" className="text-slate-700 font-medium">
                  Catégorie
                </Label>
                <Select 
                  value={newClientData.categorie}
                  onValueChange={(value) => setNewClientData(prev => ({ ...prev, categorie: value }))}
                >
                  <SelectTrigger className="border-slate-300 focus:border-green-500 focus:ring-green-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOA">MOA</SelectItem>
                    <SelectItem value="MOE">MOE</SelectItem>
                    <SelectItem value="Exploitant">Exploitant</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Adresse */}
            <div className="grid gap-2">
              <Label htmlFor="adresse" className="text-slate-700 font-medium">
                Adresse
              </Label>
              <Input
                id="adresse"
                placeholder="123 rue de la Paix"
                value={newClientData.adresse}
                onChange={(e) => setNewClientData(prev => ({ ...prev, adresse: e.target.value }))}
                className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            {/* Code postal et Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code_postal" className="text-slate-700 font-medium">
                  Code postal
                </Label>
                <Input
                  id="code_postal"
                  placeholder="75001"
                  value={newClientData.code_postal}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, code_postal: e.target.value }))}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ville" className="text-slate-700 font-medium">
                  Ville
                </Label>
                <Input
                  id="ville"
                  placeholder="Paris"
                  value={newClientData.ville}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, ville: e.target.value }))}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Téléphone et Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telephone_client" className="text-slate-700 font-medium">
                  Téléphone
                </Label>
                <Input
                  id="telephone_client"
                  placeholder="01 23 45 67 89"
                  value={newClientData.telephone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, telephone: e.target.value }))}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email_client" className="text-slate-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email_client"
                  type="email"
                  placeholder="contact@client.com"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewClientForm(false)}
              disabled={creatingClient}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={createNewClient}
              disabled={creatingClient || !newClientData.nom_client}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {creatingClient ? "Création..." : "Créer le client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

