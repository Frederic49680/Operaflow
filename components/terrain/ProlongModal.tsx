"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus } from "lucide-react"

interface ProlongModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
  currentEndDate?: string
  onSuccess?: () => void
}

export default function ProlongModal({ isOpen, onClose, taskId, taskName, currentEndDate, onSuccess }: ProlongModalProps) {
  const [motif, setMotif] = useState("")
  const [dureeSupplementaire, setDureeSupplementaire] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const calculateNewEndDate = () => {
    if (!dureeSupplementaire || !currentEndDate) return ""
    
    const currentDate = new Date(currentEndDate)
    const additionalDays = parseInt(dureeSupplementaire)
    const newDate = new Date(currentDate.getTime() + additionalDays * 24 * 60 * 60 * 1000)
    
    return newDate.toISOString().split("T")[0]
  }

  const handleSubmit = async () => {
    if (!motif.trim()) {
      toast.error("Le motif de prolongation est obligatoire")
      return
    }

    if (!dureeSupplementaire || parseInt(dureeSupplementaire) <= 0) {
      toast.error("La durée supplémentaire doit être positive")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/terrain/prolonge-activite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: taskId,
          motif: motif.trim(),
          duree_supplementaire: parseInt(dureeSupplementaire)
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Activité prolongée de ${dureeSupplementaire} jours avec succès`)
        setMotif("")
        setDureeSupplementaire("")
        onClose()
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.message || "Erreur lors de la prolongation")
      }
    } catch (error) {
      console.error("Error extending activity:", error)
      toast.error("Erreur lors de la prolongation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Prolonger l'activité
          </DialogTitle>
          <DialogDescription>
            Prolongation de l'activité : <strong>{taskName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motif">Motif de prolongation *</Label>
            <Textarea
              id="motif"
              placeholder="Ex: Travaux supplémentaires, Modification client..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duree">Durée supplémentaire (jours) *</Label>
            <Input
              id="duree"
              type="number"
              min="1"
              placeholder="Nombre de jours ouvrés à ajouter"
              value={dureeSupplementaire}
              onChange={(e) => setDureeSupplementaire(e.target.value)}
            />
          </div>

          {currentEndDate && dureeSupplementaire && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <div><strong>Date de fin actuelle :</strong> {new Date(currentEndDate).toLocaleDateString('fr-FR')}</div>
                <div><strong>Nouvelle date de fin :</strong> {new Date(calculateNewEndDate()).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !motif.trim() || !dureeSupplementaire}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Prolongation..." : "Valider prolongation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
