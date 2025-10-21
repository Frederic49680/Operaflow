'use client'

import { useState, useMemo, useEffect } from 'react'
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
  const [montantTotalAffaire, setMontantTotalAffaire] = useState(0)
  const [pourcentage, setPourcentage] = useState<number | ''>('')
  const [modeCalcul, setModeCalcul] = useState<'montant' | 'pourcentage'>('montant')
  const [lotsExistants, setLotsExistants] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    libelle: '',
    montant_ht: 0,
    mode_facturation: 'a_l_avancement',
    echeance_prevue: '',
    numero_commande: '',
    commentaire: ''
  })

  // Charger le montant total de l'affaire et les lots existants
  useEffect(() => {
    if (open && affaireId) {
      const loadAffaire = async () => {
        try {
          const response = await fetch(`/api/affaires/${affaireId}`)
          const data = await response.json()
          setMontantTotalAffaire(data.montant_total_ht || 0)
          
          // Charger les lots existants
          const lotsResponse = await fetch(`/api/affaires/lots?affaire_id=${affaireId}`)
          const lotsResult = await lotsResponse.json()
          if (lotsResult.success) {
            setLotsExistants(lotsResult.data || [])
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'affaire:', error)
        }
      }
      loadAffaire()
    }
  }, [open, affaireId])

  // Calculer le montant HT à partir du pourcentage
  useEffect(() => {
    if (modeCalcul === 'pourcentage' && pourcentage !== '' && montantTotalAffaire > 0) {
      const montantCalcule = (montantTotalAffaire * Number(pourcentage)) / 100
      setFormData(prev => ({ ...prev, montant_ht: montantCalcule }))
    }
  }, [pourcentage, montantTotalAffaire, modeCalcul])

  // Réinitialiser le formulaire quand le modal s'ouvre ou quand le lot change
  useEffect(() => {
    if (open) {
      setFormData({
        libelle: lot?.libelle || '',
        montant_ht: lot?.montant_ht || 0,
        mode_facturation: lot?.mode_facturation || 'a_l_avancement',
        echeance_prevue: lot?.echeance_prevue || '',
        numero_commande: lot?.numero_commande || '',
        commentaire: lot?.commentaire || ''
      })
      
      // Si on modifie un lot, calculer le pourcentage initial
      if (lot && montantTotalAffaire > 0) {
        const pourcentageCalcule = ((lot.montant_ht / montantTotalAffaire) * 100).toFixed(2)
        setPourcentage(Number(pourcentageCalcule))
        setModeCalcul('pourcentage')
      } else {
        setPourcentage('')
        setModeCalcul('montant')
      }
    }
  }, [open, lot, montantTotalAffaire])

  // Calculer le pourcentage total des lots existants (hors le lot en cours de modification)
  const pourcentageTotal = useMemo(() => {
    if (montantTotalAffaire === 0) return 0
    
    const lotsAutres = lotsExistants.filter(l => l.id !== lot?.id)
    const totalMontantAutres = lotsAutres.reduce((sum, l) => sum + l.montant_ht, 0)
    return (totalMontantAutres / montantTotalAffaire) * 100
  }, [lotsExistants, lot, montantTotalAffaire])

  // Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    const montantValide = modeCalcul === 'montant' 
      ? formData.montant_ht > 0 
      : pourcentage !== '' && Number(pourcentage) > 0 && Number(pourcentage) <= 100
    
    // Vérifier que le pourcentage total ne dépasse pas 100%
    const pourcentageTotalValide = modeCalcul === 'pourcentage'
      ? (pourcentageTotal + Number(pourcentage)) <= 100
      : true
    
    // echeance_prevue n'est plus obligatoire (date actuelle par défaut)
    return formData.libelle.trim() !== '' && 
           montantValide && 
           pourcentageTotalValide
  }, [formData, modeCalcul, pourcentage, pourcentageTotal])

  // Message d'erreur pour les champs manquants
  const validationMessage = useMemo(() => {
    if (isFormValid) return null
    
    const missingFields = []
    if (!formData.libelle.trim()) missingFields.push("Libellé du lot")
    if (modeCalcul === 'montant' && (!formData.montant_ht || formData.montant_ht <= 0)) {
      missingFields.push("Montant HT")
    } else if (modeCalcul === 'pourcentage') {
      if (!pourcentage || Number(pourcentage) <= 0 || Number(pourcentage) > 100) {
        missingFields.push("Pourcentage valide (0-100%)")
      }
      if (pourcentageTotal + Number(pourcentage) > 100) {
        missingFields.push(`Somme des pourcentages dépasse 100% (actuellement ${pourcentageTotal.toFixed(1)}% + ${Number(pourcentage).toFixed(1)}% = ${(pourcentageTotal + Number(pourcentage)).toFixed(1)}%)`)
      }
    }
    
    return `Champs obligatoires manquants : ${missingFields.join(", ")}`
  }, [isFormValid, formData, modeCalcul, pourcentage, pourcentageTotal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = lot 
        ? `/api/affaires/lots`
        : `/api/affaires/lots`

      const method = lot ? 'PUT' : 'POST'
      
      // Préparer les données en utilisant la date actuelle si echeance_prevue est vide
      const dataToSend = {
        ...formData,
        echeance_prevue: formData.echeance_prevue || new Date().toISOString().split('T')[0], // Date actuelle si vide
        numero_commande: formData.numero_commande || null,
        commentaire: formData.commentaire || null,
        affaire_id: affaireId
      }
      
      const body = lot 
        ? { id: lot.id, ...dataToSend }
        : dataToSend

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
      
      // Notifier le parent pour rafraîchir la liste
      onSuccess()
      
      // Recharger les lots existants pour mettre à jour le pourcentage total
      const lotsResponse = await fetch(`/api/affaires/lots?affaire_id=${affaireId}`)
      const lotsResult = await lotsResponse.json()
      if (lotsResult.success) {
        setLotsExistants(lotsResult.data || [])
      }
      
      // Réinitialiser le formulaire pour permettre une nouvelle saisie
      setFormData({
        libelle: '',
        montant_ht: 0,
        mode_facturation: 'a_l_avancement',
        echeance_prevue: '',
        numero_commande: '',
        commentaire: ''
      })
      setPourcentage('')
      setModeCalcul('montant')
      
      // Le modal reste ouvert pour créer d'autres lots
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
            {lot ? 'Modifiez les informations du lot financier' : 'Créez un nouveau lot financier. Le modal reste ouvert pour ajouter plusieurs lots.'}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="montant_ht">Montant HT (€) *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={modeCalcul === 'montant' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      // Si on était en mode pourcentage, on garde le montant calculé
                      if (modeCalcul === 'pourcentage' && formData.montant_ht > 0) {
                        // Le montant est déjà calculé, on ne fait rien
                      }
                      setModeCalcul('montant')
                      setPourcentage('')
                    }}
                  >
                    Montant
                  </Button>
                  <Button
                    type="button"
                    variant={modeCalcul === 'pourcentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      // Calculer le pourcentage à partir du montant actuel
                      if (montantTotalAffaire > 0 && formData.montant_ht > 0) {
                        const pourcentageCalcule = ((formData.montant_ht / montantTotalAffaire) * 100).toFixed(2)
                        setPourcentage(Number(pourcentageCalcule))
                      }
                      setModeCalcul('pourcentage')
                    }}
                  >
                    %
                  </Button>
                </div>
              </div>
              
              {modeCalcul === 'montant' ? (
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
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    id="pourcentage"
                    name="pourcentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={pourcentage}
                    onChange={(e) => setPourcentage(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="10"
                    className="col-span-1"
                  />
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">% de</span>
                    <span className="text-sm font-semibold">
                      {montantTotalAffaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <span className="text-sm text-muted-foreground">=</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formData.montant_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Indicateur de budget total de l'affaire avec barre de pourcentage */}
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-blue-700 font-medium">Budget total de l'affaire :</span>
                  <span className="text-blue-900 font-bold">
                    {montantTotalAffaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                
                {/* Barre de pourcentage */}
                {modeCalcul === 'pourcentage' && (
                  <>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-blue-600">Pourcentage utilisé :</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${(pourcentageTotal + Number(pourcentage)) > 100 ? 'text-red-600' : 'text-green-600'}`}>
                          {(pourcentageTotal + Number(pourcentage)).toFixed(1)}%
                        </span>
                        <span className="text-blue-400">/</span>
                        <span className="font-bold text-blue-900">100%</span>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (pourcentageTotal + Number(pourcentage)) > 100 
                            ? 'bg-red-500' 
                            : (pourcentageTotal + Number(pourcentage)) > 90 
                              ? 'bg-orange-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((pourcentageTotal + Number(pourcentage)), 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-blue-600">
                      Autres lots : {pourcentageTotal.toFixed(1)}% • Ce lot : {Number(pourcentage).toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
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
              <Label htmlFor="echeance_prevue">
                Échéance prévue
                <span className="text-xs text-muted-foreground ml-1">(optionnel - géré par le Gantt)</span>
              </Label>
              <Input
                id="echeance_prevue"
                name="echeance_prevue"
                type="date"
                value={formData.echeance_prevue}
                onChange={(e) => setFormData({ ...formData, echeance_prevue: e.target.value })}
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
                Fermer
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

