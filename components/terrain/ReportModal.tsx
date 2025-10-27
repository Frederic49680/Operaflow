"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
  onSuccess?: () => void
}

export default function ReportModal({ isOpen, onClose, taskId, taskName, onSuccess }: ReportModalProps) {
  const [motif, setMotif] = useState("")
  const [nouvelleDate, setNouvelleDate] = useState("")
  const [besoinClaim, setBesoinClaim] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!motif.trim()) {
      toast.error("Le motif du report est obligatoire")
      return
    }

    if (!nouvelleDate) {
      toast.error("La nouvelle date est obligatoire")
      return
    }

    // Vérifier que la nouvelle date est dans le futur
    const today = new Date().toISOString().split("T")[0]
    if (nouvelleDate <= today) {
      toast.error("La nouvelle date doit être dans le futur")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/terrain/reporte-activite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: taskId,
          motif: motif.trim(),
          nouvelle_date: nouvelleDate,
          besoin_claim: besoinClaim
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Activité reportée avec succès")
        setMotif("")
        setNouvelleDate("")
        setBesoinClaim(false)
        onClose()
        if (onSuccess) onSuccess()
        
        // Si un claim est nécessaire, ouvrir la modale de claim
        if (besoinClaim) {
          // TODO: Ouvrir la modale de claim
          toast.info("Ouverture de la modale de claim...")
        }
      } else {
        toast.error(result.message || "Erreur lors du report")
      }
    } catch (error) {
      console.error("Error reporting activity:", error)
      toast.error("Erreur lors du report")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-yellow-500" />
            Reporter l'activité
          </DialogTitle>
          <DialogDescription>
            Report de l'activité : <strong>{taskName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motif">Motif du report *</Label>
            <Textarea
              id="motif"
              placeholder="Ex: Attente matériel, Accès chantier refusé..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nouvelle-date">Nouvelle date estimée *</Label>
            <Input
              id="nouvelle-date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={nouvelleDate}
              onChange={(e) => setNouvelleDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="besoin-claim"
              checked={besoinClaim}
              onCheckedChange={(checked) => setBesoinClaim(checked as boolean)}
            />
            <Label htmlFor="besoin-claim" className="text-sm">
              Besoin d'un Claim ?
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !motif.trim() || !nouvelleDate}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isLoading ? "Report..." : "Enregistrer le report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
