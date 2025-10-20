"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface SendToPlanificationButtonProps {
  affaireId: string
  currentStatut: string
  onStatusChange?: (newStatut: string) => void
}

export default function SendToPlanificationButton({
  affaireId,
  currentStatut,
  onStatusChange,
}: SendToPlanificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSendToPlanification = async () => {
    // Vérifier que l'affaire est en état "Brouillon"
    if (currentStatut !== "Brouillon") {
      toast.error("Cette affaire ne peut pas être envoyée à la planification")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/affaires/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affaire_id: affaireId,
          statut: "Soumise",
        }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.message || "Erreur lors de l'envoi à la planification")
        return
      }

      toast.success("Affaire envoyée à la planification avec succès", {
        description: "Elle est maintenant visible pour les planificateurs",
        icon: <CheckCircle2 className="h-5 w-5" />,
      })

      if (onStatusChange) {
        onStatusChange("Soumise")
      }
    } catch (error) {
      console.error("Error sending to planification:", error)
      toast.error("Erreur lors de l'envoi à la planification")
    } finally {
      setIsLoading(false)
    }
  }

  // Ne pas afficher le bouton si l'affaire n'est pas en "Brouillon"
  if (currentStatut !== "Brouillon") {
    return null
  }

  return (
    <Button
      onClick={handleSendToPlanification}
      disabled={isLoading}
      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-md hover:shadow-lg transition-all"
    >
      <Send className="h-4 w-4 mr-2" />
      {isLoading ? "Envoi..." : "Envoyer à la planification"}
    </Button>
  )
}

