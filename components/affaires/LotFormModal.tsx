'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface LotFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  affaireId: string
  lot?: {
    id: string
    libelle: string
    montant_ht: number
    mode_facturation: string
    echeance_prevue: string
    numero_commande?: string
    commentaire?: string
  }
}

export function LotFormModal({ open, onClose, onSuccess, affaireId, lot }: LotFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    libelle: lot?.libelle || '',
    montant_ht: lot?.montant_ht || 0,
    mode_facturation: lot?.mode_facturation || 'a_l_avancement',
    echeance_prevue: lot?.echeance_prevue || '',
    numero_commande: lot?.numero_commande || '',
    commentaire: lot?.commentaire || ''
  })

  // Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    return formData.libelle.trim() !== '' && 
           formData.montant_ht > 0 && 
           formData.echeance_prevue !== ''
  }, [formData])

  // Message d'erreur pour les champs manquants
  const validationMessage = useMemo(() => {
    if (isFormValid) return null
    
    const missingFields = []
    if (!formData.libelle.trim()) missingFields.push("Libellé du lot")
    if (!formData.montant_ht || formData.montant_ht <= 0) missingFields.push("Montant HT")
    if (!formData.echeance_prevue) missingFields.push("Échéance prévue")
    
    return `Champs obligatoires manquants : ${missingFields.join(", ")}`
  }, [isFormValid, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = lot 
        ? `/api/affaires/lots`
        : `/api/affaires/lots`

      const method = lot ? 'PUT' : 'POST'
      const body = lot 
        ? { id: lot.id, ...formData, affaire_id: affaireId }
        : { ...formData, affaire_id: affaireId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(lot ? 'Lot modifié avec succès' : 'Lot créé avec succès')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde du lot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {lot ? 'Modifier le lot' : 'Ajouter un lot financier'}
          </DialogTitle>
          <DialogDescription>
            {lot ? 'Modifiez les informations du lot financier' : 'Créez un nouveau lot financier pour cette affaire'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="libelle">Libellé du lot *</Label>
              <Input
                id="libelle"
                name="libelle"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                required
                placeholder="Ex: Lot 1 - Étude et conception"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="montant_ht">Montant HT (€) *</Label>
              <Input
                id="montant_ht"
                name="montant_ht"
                type="number"
                step="0.01"
                min="0"
                value={formData.montant_ht}
                onChange={(e) => setFormData({ ...formData, montant_ht: parseFloat(e.target.value) || 0 })}
                required
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mode_facturation">Mode de facturation *</Label>
              <Select
                value={formData.mode_facturation}
                onValueChange={(value) => setFormData({ ...formData, mode_facturation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_l_avancement">À l'avancement</SelectItem>
                  <SelectItem value="a_la_reception">À la réception</SelectItem>
                  <SelectItem value="echeancier">Échéancier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="echeance_prevue">Échéance prévue *</Label>
              <Input
                id="echeance_prevue"
                name="echeance_prevue"
                type="date"
                value={formData.echeance_prevue}
                onChange={(e) => setFormData({ ...formData, echeance_prevue: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="numero_commande">Numéro de commande client</Label>
              <Input
                id="numero_commande"
                name="numero_commande"
                value={formData.numero_commande}
                onChange={(e) => setFormData({ ...formData, numero_commande: e.target.value })}
                placeholder="Ex: CMD-2025-001"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="commentaire">Commentaire</Label>
              <Input
                id="commentaire"
                name="commentaire"
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                placeholder="Commentaire libre"
              />
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !isFormValid} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lot ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

