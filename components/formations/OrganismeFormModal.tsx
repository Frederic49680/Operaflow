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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, X } from "lucide-react"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

interface Organisme {
  id?: string
  nom?: string
  siret?: string
  contact?: string
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  domaines?: string[]
  agrement?: string
  actif?: boolean
}

interface OrganismeFormModalProps {
  organisme?: Organisme | null
  onClose?: () => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function OrganismeFormModal({ organisme, onClose, onSuccess, children }: OrganismeFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  const [formData, setFormData] = useState<Organisme>({
    nom: '',
    siret: '',
    contact: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    domaines: [],
    agrement: '',
    actif: true
  })

  const [domaineInput, setDomaineInput] = useState('')

  // Domaines prédéfinis
  const domainesPredefinis = [
    'Électricité',
    'CVC',
    'Plomberie',
    'Chauffage',
    'Climatisation',
    'Sécurité Incendie',
    'Sûreté',
    'Éclairage',
    'Domotique',
    'Maintenance',
    'Sécurité au Travail',
    'Habilitation Électrique',
    'NR 12',
    'NR 13',
    'Autre'
  ]

  useEffect(() => {
    if (organisme) {
      setFormData(organisme)
    }
  }, [organisme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom) {
      setToast({ type: 'error', message: 'Le nom est obligatoire' })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      if (organisme?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('organismes_formation')
          .update(formData)
          .eq('id', organisme.id)

        if (error) throw error
        setToast({ type: 'success', message: 'Organisme mis à jour avec succès !' })
      } else {
        // Création
        const { error } = await supabase
          .from('organismes_formation')
          .insert([formData])

        if (error) throw error
        setToast({ type: 'success', message: 'Organisme créé avec succès !' })
      }

      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
      setFormData({
        nom: '',
        siret: '',
        contact: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        domaines: [],
        agrement: '',
        actif: true
      })
      setDomaineInput('')
      window.dispatchEvent(new Event('organisme-created'))
      if (onClose) onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  const addDomaine = (domaine?: string) => {
    const domaineToAdd = domaine || domaineInput.trim()
    if (domaineToAdd && !formData.domaines?.includes(domaineToAdd)) {
      setFormData({
        ...formData,
        domaines: [...(formData.domaines || []), domaineToAdd]
      })
      setDomaineInput('')
    }
  }

  const removeDomaine = (domaine: string) => {
    setFormData({
      ...formData,
      domaines: formData.domaines?.filter(d => d !== domaine) || []
    })
  }

  const toggleDomaine = (domaine: string) => {
    if (formData.domaines?.includes(domaine)) {
      removeDomaine(domaine)
    } else {
      addDomaine(domaine)
    }
  }

  return (
    <>
      {children && (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      )}
      
      <Dialog open={open || !!organisme} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen && onClose) onClose()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {organisme?.id ? 'Modifier l\'organisme' : 'Nouvel organisme'}
            </DialogTitle>
            <DialogDescription>
              {organisme?.id ? 'Modifiez les informations de l\'organisme' : 'Ajoutez un nouvel organisme de formation'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom de l'organisme"
                required
              />
            </div>

            {/* SIRET */}
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="12345678901234"
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nom du contact"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@organisme.fr"
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Adresse */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="123 rue de la Formation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code_postal">Code Postal</Label>
                <Input
                  id="code_postal"
                  value={formData.code_postal}
                  onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                  placeholder="75001"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Domaines */}
            <div className="space-y-3">
              <Label>Domaines de formation</Label>
              
              {/* Boutons domaines prédéfinis */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Domaines disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {domainesPredefinis.map((domaine) => {
                    const isSelected = formData.domaines?.includes(domaine)
                    return (
                      <Button
                        key={domaine}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDomaine(domaine)}
                        className={`transition-all ${
                          isSelected 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {isSelected && <X className="h-3 w-3 mr-1" />}
                        {domaine}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Ajouter un domaine personnalisé */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-slate-600">Ou ajouter un domaine personnalisé</p>
                <div className="flex gap-2">
                  <Input
                    value={domaineInput}
                    onChange={(e) => setDomaineInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addDomaine()
                      }
                    }}
                    placeholder="Ex: Formation sur mesure..."
                  />
                  <Button 
                    type="button" 
                    onClick={() => addDomaine()} 
                    variant="outline"
                    disabled={!domaineInput.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Domaines sélectionnés */}
              {formData.domaines && formData.domaines.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium text-slate-600">
                    Domaines sélectionnés ({formData.domaines.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.domaines.map((domaine, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        onClick={() => removeDomaine(domaine)}
                      >
                        {domaine}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Agrément */}
            <div className="space-y-2">
              <Label htmlFor="agrement">N° d'agrément</Label>
              <Input
                id="agrement"
                value={formData.agrement}
                onChange={(e) => setFormData({ ...formData, agrement: e.target.value })}
                placeholder="12345678901"
              />
            </div>

            {/* Actif */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="actif"
                checked={formData.actif}
                onCheckedChange={(checked) => setFormData({ ...formData, actif: !!checked })}
              />
              <Label htmlFor="actif" className="cursor-pointer">
                Organisme actif
              </Label>
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

// Import manquant
import { Badge } from "@/components/ui/badge"

