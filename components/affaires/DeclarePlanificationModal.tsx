'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Calendar } from 'lucide-react'

interface Affaire {
  id: string
  code_affaire: string
  nom: string
  site_nom: string
  responsable_nom: string
  type_contrat: string
  montant_total_ht: number
  statut: string
  nb_lots_financiers: number
  montant_lots_ht: number
}

interface DeclarePlanificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  affaire: Affaire
}

export function DeclarePlanificationModal({ open, onClose, onSuccess, affaire }: DeclarePlanificationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: ''
  })

  // Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    return formData.date_debut !== '' && formData.date_fin !== ''
  }, [formData])

  // Message d'erreur pour les champs manquants
  const validationMessage = useMemo(() => {
    if (isFormValid) return null
    
    const missingFields = []
    if (!formData.date_debut) missingFields.push("Date de début")
    if (!formData.date_fin) missingFields.push("Date de fin")
    
    return `Champs obligatoires manquants : ${missingFields.join(", ")}`
  }, [isFormValid, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/affaires/declare-planification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affaire_id: affaire.id,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la déclaration')
      }

      toast.success('Planification déclarée avec succès')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la déclaration de planification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Déclarer la planification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">{affaire.nom}</h4>
            <p className="text-xs text-muted-foreground">{affaire.code_affaire}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="text-xs">
                {affaire.nb_lots_financiers} lot(s)
              </Badge>
              <Badge variant="outline" className="text-xs">
                {affaire.montant_lots_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date_debut">Date de début *</Label>
                <Input
                  id="date_debut"
                  name="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date_fin">Date de fin *</Label>
                <Input
                  id="date_fin"
                  name="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Action :</strong> Cette déclaration va créer :
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Une tâche parapluie pour l'affaire</li>
                    <li>{affaire.nb_lots_financiers} jalon(s) à partir des lots financiers</li>
                    <li>Changer le statut de l'affaire à "Validée"</li>
                  </ul>
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4 flex-col gap-3">
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
                <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || !isFormValid} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Calendar className="mr-2 h-4 w-4" />
                  Déclarer la planification
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

