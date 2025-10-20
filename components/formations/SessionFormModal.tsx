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
import { Loader2, X } from "lucide-react"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

interface Session {
  id?: string
  formation_id?: string
  organisme_id?: string
  site_id?: string
  lieu?: string
  date_debut?: string
  date_fin?: string
  capacite?: number
  cout_session_ht?: number
  statut?: string
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

interface Site {
  id: string
  nom: string
}

interface SessionFormModalProps {
  session?: Session | null
  onClose?: () => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function SessionFormModal({ session, onClose, onSuccess, children }: SessionFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [formations, setFormations] = useState<Formation[]>([])
  const [organismes, setOrganismes] = useState<Organisme[]>([])
  const [sites, setSites] = useState<Site[]>([])
  
  const [formData, setFormData] = useState<Session>({
    formation_id: '',
    organisme_id: '',
    site_id: '',
    lieu: '',
    date_debut: '',
    date_fin: '',
    capacite: 10,
    cout_session_ht: 0,
    statut: 'Ouverte'
  })

  useEffect(() => {
    loadData()
    if (session) {
      setFormData({
        ...session,
        lieu: session.lieu || '',
        site_id: session.site_id || '',
        capacite: session.capacite || 10,
        cout_session_ht: session.cout_session_ht || 0
      })
    }
  }, [session])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
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
      
      // Charger sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, nom')
        .in('statut', ['Actif', 'En pause'])
        .order('nom')
      
      if (sitesError) throw sitesError
      setSites(sitesData || [])
    } catch (err) {
      console.error('Erreur chargement données:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.formation_id || !formData.organisme_id) {
      setToast({ type: 'error', message: 'La formation et l\'organisme sont obligatoires' })
      return
    }

    if (!formData.date_debut || !formData.date_fin) {
      setToast({ type: 'error', message: 'Les dates de début et fin sont obligatoires' })
      return
    }

    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setToast({ type: 'error', message: 'La date de fin doit être postérieure à la date de début' })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Préparer les données à envoyer
      const dataToSave = {
        formation_id: formData.formation_id,
        organisme_id: formData.organisme_id,
        site_id: formData.site_id || null,
        lieu: formData.lieu || null,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        capacite: formData.capacite || 10,
        cout_session_ht: formData.cout_session_ht || null,
        statut: formData.statut || 'Ouverte'
      }

      if (session?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('formations_sessions')
          .update(dataToSave)
          .eq('id', session.id)

        if (error) throw error
        setToast({ type: 'success', message: 'Session mise à jour avec succès !' })
      } else {
        // Création
        const { error } = await supabase
          .from('formations_sessions')
          .insert([dataToSave])

        if (error) throw error
        setToast({ type: 'success', message: 'Session créée avec succès !' })
      }

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
      setFormData({
        formation_id: '',
        organisme_id: '',
        site_id: '',
        lieu: '',
        date_debut: '',
        date_fin: '',
        capacite: 10,
        cout_session_ht: 0,
        statut: 'Ouverte'
      })
      window.dispatchEvent(new Event('session-created'))
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
      
      <Dialog open={open || !!session} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && onClose) onClose()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {session?.id ? 'Modifier la session' : 'Nouvelle session'}
            </DialogTitle>
            <DialogDescription>
              {session?.id ? 'Modifiez les informations de la session' : 'Créez une nouvelle session de formation collective'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formation et Organisme */}
            <div className="grid grid-cols-2 gap-4">
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
                  {formations.map(form => (
                    <option key={form.id} value={form.id}>
                      {form.code} - {form.libelle}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            {/* Site et Lieu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_id">Site (optionnel)</Label>
                <select
                  id="site_id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                >
                  <option value="">Sélectionner un site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieu">Lieu (optionnel)</Label>
                <Input
                  id="lieu"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  placeholder="Ex: Salle de formation, Adresse..."
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de début *</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin *</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Capacité et Coût */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacite">Capacité (personnes)</Label>
                <Input
                  id="capacite"
                  type="number"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cout_session_ht">Coût session (HT)</Label>
                <Input
                  id="cout_session_ht"
                  type="number"
                  step="0.01"
                  value={formData.cout_session_ht}
                  onChange={(e) => setFormData({ ...formData, cout_session_ht: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <select
                id="statut"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              >
                <option value="Ouverte">Ouverte</option>
                <option value="Fermée">Fermée</option>
                <option value="Réalisée">Réalisée</option>
                <option value="Annulée">Annulée</option>
              </select>
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

