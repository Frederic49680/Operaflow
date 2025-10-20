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

interface RemonteeFormModalProps {
  children: React.ReactNode
  remonteeId?: string
}

export function RemonteeFormModal({ children, remonteeId }: RemonteeFormModalProps) {
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {remonteeId ? "Modifier la remontée" : "Nouvelle remontée"}
          </DialogTitle>
          <DialogDescription>
            {remonteeId
              ? "Modifiez les informations de la remontée"
              : "Enregistrez l'état réel d'une tâche"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Tâche */}
            <div className="grid gap-2">
              <Label htmlFor="tache" className="text-slate-700 font-medium">
                Tâche <span className="text-red-500">*</span>
              </Label>
              <Select required>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner une tâche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Études préliminaires</SelectItem>
                      <SelectItem value="2">Réalisation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* État réel */}
            <div className="grid gap-2">
              <Label htmlFor="statut" className="text-slate-700 font-medium">
                État réel <span className="text-red-500">*</span>
              </Label>
              <Select required>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non lancée">Non lancée</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminée">Terminée</SelectItem>
                  <SelectItem value="Bloquée">Bloquée</SelectItem>
                  <SelectItem value="Suspendue">Suspendue</SelectItem>
                  <SelectItem value="Reportée">Reportée</SelectItem>
                  <SelectItem value="Prolongée">Prolongée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avancement */}
            <div className="grid gap-2">
              <Label htmlFor="avancement" className="text-slate-700 font-medium">
                Avancement (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="avancement"
                type="number"
                min="0"
                max="100"
                placeholder="35"
                required
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Effectifs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nb_present" className="text-slate-700 font-medium">
                  Nombre de présents <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nb_present"
                  type="number"
                  placeholder="3"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nb_planifie" className="text-slate-700 font-medium">
                  Nombre planifié
                </Label>
                <Input
                  id="nb_planifie"
                  type="number"
                  placeholder="4"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Heures */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="heures_presence" className="text-slate-700 font-medium">
                  Heures présence
                </Label>
                <Input
                  id="heures_presence"
                  type="number"
                  step="0.5"
                  placeholder="7.5"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heures_metal" className="text-slate-700 font-medium">
                  Heures métal
                </Label>
                <Input
                  id="heures_metal"
                  type="number"
                  step="0.5"
                  placeholder="5.5"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Motif */}
            <div className="grid gap-2">
              <Label htmlFor="motif" className="text-slate-700 font-medium">
                Motif / Commentaire
              </Label>
              <Textarea
                id="motif"
                placeholder="Détaillez la situation..."
                rows={3}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
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
              {loading ? "Enregistrement..." : remonteeId ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

