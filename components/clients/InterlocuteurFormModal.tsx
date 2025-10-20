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

interface InterlocuteurFormModalProps {
  children: React.ReactNode
  interlocuteurId?: string
}

export function InterlocuteurFormModal({ children, interlocuteurId }: InterlocuteurFormModalProps) {
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
            {interlocuteurId ? "Modifier le contact" : "Nouveau contact"}
          </DialogTitle>
          <DialogDescription>
            {interlocuteurId
              ? "Modifiez les informations du contact"
              : "Ajoutez un nouveau contact client"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nom" className="text-slate-700 font-medium">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  placeholder="Dupont"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prenom" className="text-slate-700 font-medium">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prenom"
                  placeholder="Jean"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Client et Fonction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client" className="text-slate-700 font-medium">
                  Client <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">EDF Réseaux</SelectItem>
                    <SelectItem value="2">Engie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fonction" className="text-slate-700 font-medium">
                  Fonction
                </Label>
                <Input
                  id="fonction"
                  placeholder="Responsable Technique"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Type et Site */}
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
                    <SelectItem value="Technique">Technique</SelectItem>
                    <SelectItem value="Administratif">Administratif</SelectItem>
                    <SelectItem value="Facturation">Facturation</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site" className="text-slate-700 font-medium">
                  Site
                </Label>
                <Select>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">E-03A - Site Est</SelectItem>
                    <SelectItem value="2">O-05B - Site Ouest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telephone" className="text-slate-700 font-medium">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Disponibilité */}
            <div className="grid gap-2">
              <Label htmlFor="disponibilite" className="text-slate-700 font-medium">
                Disponibilité
              </Label>
              <Input
                id="disponibilite"
                placeholder="8h-17h"
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Notes internes..."
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
              {loading ? "Enregistrement..." : interlocuteurId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

