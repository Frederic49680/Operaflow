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
  children: React.ReactNode
  interlocuteurId?: string
}

export function InterlocuteurFormModal({ children, interlocuteurId }: InterlocuteurFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingSites, setLoadingSites] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)
  
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
    notes: ""
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

  // Charger les données quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      loadSites()
      loadClients()
    }
  }, [open, loadSites, loadClients])

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
        notes: ""
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
                <Label htmlFor="client" className="text-slate-700 font-medium">
                  Client <span className="text-red-500">*</span>
                </Label>
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
              {loading ? "Enregistrement..." : interlocuteurId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

