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

interface Tarif {
  id?: string
  formation_id?: string
  organisme_id?: string
  modalite?: string
  cout_unitaire?: number
  cout_session?: number
  capacite_max?: number
  frais_deplacement?: number
  tva?: number
  date_debut?: string
  date_fin?: string
  actif?: boolean
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

interface TarifFormModalProps {
  tarif?: Tarif | null
  onClose?: () => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function TarifFormModal({ tarif, onClose, onSuccess, children }: TarifFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [formations, setFormations] = useState<Formation[]>([])
  const [organismes, setOrganismes] = useState<Organisme[]>([])
  const [typeTarif, setTypeTarif] = useState<'unitaire' | 'groupe' | 'mixte'>('unitaire')
  
  const [formData, setFormData] = useState<Tarif>({
    formation_id: '',
    organisme_id: '',
    modalite: 'Présentiel',
    cout_unitaire: 0,
    cout_session: 0,
    capacite_max: 0,
    frais_deplacement: 0,
    tva: 20,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    actif: true
  })

  useEffect(() => {
    loadData()
    if (tarif) {
      setFormData(tarif)
      // Déterminer le type de tarif
      if (tarif.cout_unitaire && tarif.cout_session) {
        setTypeTarif('mixte')
      } else if (tarif.cout_session) {
        setTypeTarif('groupe')
      } else {
        setTypeTarif('unitaire')
      }
    }
  }, [tarif])

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

    // Validation selon le type de tarif
    if (typeTarif === 'unitaire' && !formData.cout_unitaire) {
      setToast({ type: 'error', message: 'Le prix unitaire est obligatoire' })
      return
    }

    if (typeTarif === 'groupe' && !formData.cout_session) {
      setToast({ type: 'error', message: 'Le prix groupe est obligatoire' })
      return
    }

    if (typeTarif === 'groupe' && !formData.capacite_max) {
      setToast({ type: 'error', message: 'La capacité maximale est obligatoire pour un tarif groupe' })
      return
    }

    if (typeTarif === 'mixte' && (!formData.cout_unitaire || !formData.cout_session)) {
      setToast({ type: 'error', message: 'Les prix unitaire et groupe sont obligatoires' })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Préparer les données selon le type de tarif
      const dataToSave = {
        ...formData,
        cout_unitaire: (typeTarif === 'unitaire' || typeTarif === 'mixte') ? formData.cout_unitaire : null,
        cout_session: (typeTarif === 'groupe' || typeTarif === 'mixte') ? formData.cout_session : null,
        capacite_max: (typeTarif === 'groupe' || typeTarif === 'mixte') ? formData.capacite_max : null,
        date_fin: formData.date_fin || null
      }

      if (tarif?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('formations_tarifs')
          .update(dataToSave)
          .eq('id', tarif.id)

        if (error) throw error
        setToast({ type: 'success', message: 'Tarif mis à jour avec succès !' })
      } else {
        // Création
        const { error } = await supabase
          .from('formations_tarifs')
          .insert([dataToSave])

        if (error) throw error
        setToast({ type: 'success', message: 'Tarif créé avec succès !' })
      }

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
      setFormData({
        formation_id: '',
        organisme_id: '',
        modalite: 'Présentiel',
        cout_unitaire: 0,
        cout_session: 0,
        capacite_max: 0,
        frais_deplacement: 0,
        tva: 20,
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        actif: true
      })
      window.dispatchEvent(new Event('tarif-created'))
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
      
      <Dialog open={open || !!tarif} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && onClose) onClose()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {tarif?.id ? 'Modifier le tarif' : 'Nouveau tarif'}
            </DialogTitle>
            <DialogDescription>
              {tarif?.id ? 'Modifiez les informations du tarif' : 'Définissez un nouveau tarif de formation'}
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

            {/* Modalité */}
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

            {/* Type de tarif */}
            <div className="space-y-3">
              <Label>Type de tarif</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={typeTarif === 'unitaire' ? "default" : "outline"}
                  className={typeTarif === 'unitaire' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  onClick={() => setTypeTarif('unitaire')}
                >
                  Unitaire
                </Button>
                <Button
                  type="button"
                  variant={typeTarif === 'groupe' ? "default" : "outline"}
                  className={typeTarif === 'groupe' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  onClick={() => setTypeTarif('groupe')}
                >
                  Groupe
                </Button>
                <Button
                  type="button"
                  variant={typeTarif === 'mixte' ? "default" : "outline"}
                  className={typeTarif === 'mixte' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  onClick={() => setTypeTarif('mixte')}
                >
                  Mixte
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {typeTarif === 'unitaire' && 'Tarif par personne'}
                {typeTarif === 'groupe' && 'Tarif fixe pour un groupe (définissez la capacité maximale)'}
                {typeTarif === 'mixte' && 'Tarif unitaire ET tarif groupe (les deux disponibles)'}
              </p>
            </div>

            {/* Prix unitaire */}
            {(typeTarif === 'unitaire' || typeTarif === 'mixte') && (
              <div className="space-y-2">
                <Label htmlFor="cout_unitaire">Prix unitaire (HT) *</Label>
                <Input
                  id="cout_unitaire"
                  type="number"
                  step="0.01"
                  value={formData.cout_unitaire}
                  onChange={(e) => setFormData({ ...formData, cout_unitaire: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
            )}

            {/* Prix groupe */}
            {(typeTarif === 'groupe' || typeTarif === 'mixte') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cout_session">Prix groupe (HT) *</Label>
                  <Input
                    id="cout_session"
                    type="number"
                    step="0.01"
                    value={formData.cout_session}
                    onChange={(e) => setFormData({ ...formData, cout_session: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacite_max">Capacité maximale (personnes) *</Label>
                  <Input
                    id="capacite_max"
                    type="number"
                    value={formData.capacite_max}
                    onChange={(e) => setFormData({ ...formData, capacite_max: parseInt(e.target.value) || 0 })}
                    placeholder="10"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Nombre maximum de personnes pour ce tarif groupe
                  </p>
                </div>
              </>
            )}

            {/* TVA et Frais de déplacement */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tva">TVA (%)</Label>
                <Input
                  id="tva"
                  type="number"
                  step="0.1"
                  value={formData.tva}
                  onChange={(e) => setFormData({ ...formData, tva: parseFloat(e.target.value) || 0 })}
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frais_deplacement">Frais de déplacement (HT)</Label>
                <Input
                  id="frais_deplacement"
                  type="number"
                  step="0.01"
                  value={formData.frais_deplacement}
                  onChange={(e) => setFormData({ ...formData, frais_deplacement: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Dates de validité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Validité tarif - Début *</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500">
                  Date à partir de laquelle ce tarif est applicable
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Validité tarif - Fin (optionnel)</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Date d'expiration du tarif (laissez vide si indéterminée)
                </p>
              </div>
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

