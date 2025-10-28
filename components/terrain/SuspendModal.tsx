"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Pause } from "lucide-react"

interface SuspendModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskName: string
  onSuccess?: () => void
}

interface User {
  id: string
  prenom: string
  nom: string
  email: string
}

export default function SuspendModal({ isOpen, onClose, taskId, taskName, onSuccess }: SuspendModalProps) {
  const [motif, setMotif] = useState("")
  const [dureeEstimee, setDureeEstimee] = useState("")
  const [responsableId, setResponsableId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      } else {
        console.error("Erreur chargement utilisateurs:", response.statusText)
        // Fallback: utiliser des utilisateurs statiques connus
        setUsers([
          {
            id: "63c54430-fc5a-4b96-b893-e66b8e747b3a",
            prenom: "Admin",
            nom: "OperaFlow",
            email: "admin@operaflow.com"
          }
        ])
        console.log("Utilisation des utilisateurs de fallback")
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
      // Fallback: utiliser des utilisateurs statiques connus
      setUsers([
        {
          id: "63c54430-fc5a-4b96-b893-e66b8e747b3a",
          prenom: "Admin",
          nom: "OperaFlow",
          email: "admin@operaflow.com"
        }
      ])
      console.log("Utilisation des utilisateurs de fallback")
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async () => {
    if (!motif.trim()) {
      toast.error("Le motif de suspension est obligatoire")
      return
    }

    if (!responsableId) {
      toast.error("Le responsable de la décision est obligatoire")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/terrain/suspend-activite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: taskId,
          motif: motif.trim(),
          responsable_id: responsableId,
          duree_estimee: dureeEstimee ? parseInt(dureeEstimee) : null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Activité suspendue avec succès")
        setMotif("")
        setDureeEstimee("")
        setResponsableId("")
        onClose()
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.message || "Erreur lors de la suspension")
      }
    } catch (error) {
      console.error("Error suspending activity:", error)
      toast.error("Erreur lors de la suspension")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-orange-500" />
            Suspendre l'activité
          </DialogTitle>
          <DialogDescription>
            Suspension de l'activité : <strong>{taskName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motif">Motif de suspension *</Label>
            <Textarea
              id="motif"
              placeholder="Ex: Ressource affectée temporairement ailleurs, Changement de priorité..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duree">Durée estimée de suspension (jours)</Label>
            <Input
              id="duree"
              type="number"
              min="1"
              placeholder="À titre indicatif"
              value={dureeEstimee}
              onChange={(e) => setDureeEstimee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable de la décision *</Label>
            <Select value={responsableId} onValueChange={setResponsableId} disabled={loadingUsers}>
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Chargement..." : "Sélectionner le responsable"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.prenom} {user.nom} ({user.email})
                  </SelectItem>
                ))}
                {users.length === 0 && !loadingUsers && (
                  <SelectItem value="no-users" disabled>
                    Aucun utilisateur trouvé
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !motif.trim() || !responsableId}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? "Suspension..." : "Suspendre l'activité"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
