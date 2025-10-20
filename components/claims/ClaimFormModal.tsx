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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ClaimFormModalProps {
  children: React.ReactNode
  claimId?: string
}

export function ClaimFormModal({ children, claimId }: ClaimFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implémenter la logique de sauvegarde
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {claimId ? "Modifier la réclamation" : "Nouvelle réclamation"}
          </DialogTitle>
          <DialogDescription>
            {claimId
              ? "Modifiez les informations de la réclamation"
              : "Déclarez une nouvelle réclamation"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Type et Affaire */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-slate-700 font-medium">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interne">Interne</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Sous-traitant">Sous-traitant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="affaire" className="text-slate-700 font-medium">
                  Affaire <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">AFF-2025-001 - EDF Réseaux</SelectItem>
                    <SelectItem value="2">AFF-2025-002 - Engie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Titre et Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="titre" className="text-slate-700 font-medium">
                  Titre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titre"
                  placeholder="Retard fournisseur"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categorie" className="text-slate-700 font-medium">
                  Catégorie
                </Label>
                <Select>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retard chantier">Retard chantier</SelectItem>
                    <SelectItem value="Travaux supplémentaires">Travaux supplémentaires</SelectItem>
                    <SelectItem value="Non-conformité">Non-conformité</SelectItem>
                    <SelectItem value="Matériel">Matériel</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Détaillez la réclamation..."
                rows={4}
                required
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Montants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="montant_estime" className="text-slate-700 font-medium">
                  Montant estimé (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="montant_estime"
                  type="number"
                  placeholder="2000"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="montant_final" className="text-slate-700 font-medium">
                  Montant final (€)
                </Label>
                <Input
                  id="montant_final"
                  type="number"
                  placeholder="0"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Responsable et Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="responsable" className="text-slate-700 font-medium">
                  Responsable <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interne">Interne</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Sous-traitant">Sous-traitant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date_detection" className="text-slate-700 font-medium">
                  Date de détection <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_detection"
                  type="date"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Impact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  id="impact_financier"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="impact_financier" className="text-slate-700 font-medium cursor-pointer">
                  Impact financier
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="impact_planning"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="impact_planning" className="text-slate-700 font-medium cursor-pointer">
                  Impact planning
                </Label>
              </div>
            </div>

            {/* Statut */}
            <div className="grid gap-2">
              <Label htmlFor="statut" className="text-slate-700 font-medium">
                Statut <span className="text-red-500">*</span>
              </Label>
              <Select required defaultValue="Ouvert">
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ouvert">Ouvert</SelectItem>
                  <SelectItem value="En analyse">En analyse</SelectItem>
                  <SelectItem value="Validé">Validé</SelectItem>
                  <SelectItem value="Transmis">Transmis</SelectItem>
                  <SelectItem value="Clos">Clos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : claimId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

