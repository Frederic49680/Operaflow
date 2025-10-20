"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"

interface CollaborateurDesactivationModalProps {
  collaborateurId: string
  collaborateurNom: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CollaborateurDesactivationModal({
  collaborateurId,
  collaborateurNom,
  open,
  onOpenChange,
  onSuccess
}: CollaborateurDesactivationModalProps) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [dateSortie, setDateSortie] = useState(() => {
    // Préremplir avec la date du jour
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [motif, setMotif] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dateSortie) {
      setToast({ type: 'error', message: 'La date de sortie est obligatoire' })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Appeler la fonction Supabase pour désactivation complète
      const { data, error } = await supabase
        .rpc('fn_desactiver_ressource', {
          p_ressource_id: collaborateurId,
          p_date_sortie: dateSortie,
          p_motif: motif || null
        })

      if (error) throw error

      if (data && data.success) {
        const nbTaches = data.nb_taches_impactees || 0
        let message = `Collaborateur désactivé avec succès`
        
        if (nbTaches > 0) {
          message += `. ${nbTaches} tâche(s) à réaffecter. Une alerte a été envoyée au planificateur.`
        }
        
        setToast({ type: 'success', message })
      } else {
        setToast({ type: 'error', message: 'Erreur lors de la désactivation' })
      }

      // Réinitialiser le formulaire
      setDateSortie(new Date().toISOString().split('T')[0])
      setMotif("")
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Erreur désactivation collaborateur:', error)
      setToast({ type: 'error', message: 'Erreur lors de la désactivation du collaborateur' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setDateSortie(new Date().toISOString().split('T')[0])
    setMotif("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Désactiver un collaborateur
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de désactiver <strong>{collaborateurNom}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-sm text-red-800">
            <strong>⚠️ Attention :</strong> La désactivation d'un collaborateur est une action importante.
            Le collaborateur ne sera plus visible dans les listes actives et ne pourra plus être affecté aux tâches.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="date_sortie" className="text-slate-700 font-medium">
                Date de sortie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_sortie"
                type="date"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
                required
                className="border-slate-300 focus:border-red-500 focus:ring-red-500/20"
              />
              <p className="text-xs text-slate-500">
                Date à laquelle le collaborateur quitte l'entreprise
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motif" className="text-slate-700 font-medium">
                Motif de la désactivation (optionnel)
              </Label>
              <textarea
                id="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: Fin de contrat, démission, licenciement..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-red-500 focus:ring-red-500/20 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || !dateSortie}
            >
              {loading ? "Désactivation..." : "Confirmer la désactivation"}
            </Button>
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

