"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

interface ReprendModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
  onSuccess?: () => void
}

export default function ReprendModal({ isOpen, onClose, taskId, taskName, onSuccess }: ReprendModalProps) {
  const [commentaire, setCommentaire] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!commentaire.trim()) {
      toast.error("Le commentaire de reprise est obligatoire")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/terrain/reprend-activite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: taskId,
          commentaire: commentaire.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Activité reprise avec succès")
        setCommentaire("")
        onClose()
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.message || "Erreur lors de la reprise")
      }
    } catch (error) {
      console.error("Error resuming activity:", error)
      toast.error("Erreur lors de la reprise")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-500" />
            Reprendre l'activité
          </DialogTitle>
          <DialogDescription>
            Reprise de l'activité : <strong>{taskName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire de reprise *</Label>
            <Textarea
              id="commentaire"
              placeholder="Ex: Matériel reçu, reprise des travaux..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !commentaire.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Reprise..." : "Reprendre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
