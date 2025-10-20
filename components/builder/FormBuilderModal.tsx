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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface FormBuilderModalProps {
  children: React.ReactNode
  formId?: string
}

export function FormBuilderModal({ children, formId }: FormBuilderModalProps) {
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formId ? "Modifier le masque" : "Nouveau masque"}
          </DialogTitle>
          <DialogDescription>
            {formId
              ? "Modifiez la définition du masque"
              : "Créez un nouveau masque de saisie dynamique"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Informations de base */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Nom du masque <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contrôle EPI"
                required
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'objectif du masque..."
                rows={3}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Aperçu du builder */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">Aperçu du masque</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Champs disponibles</span>
                    <Badge variant="outline">À configurer</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Le builder complet sera disponible dans une version future
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">📝 Texte</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">🔢 Nombre</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">📅 Date</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">📋 Liste</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">📎 Fichier</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-700">✓ Booléen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scope" className="text-slate-700 font-medium">
                  Portée
                </Label>
                <select
                  id="scope"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="global">Globale</option>
                  <option value="site">Par site</option>
                  <option value="affaire">Par affaire</option>
                  <option value="tache">Par tâche</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequence" className="text-slate-700 font-medium">
                  Fréquence
                </Label>
                <select
                  id="frequence"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="quotidien">Quotidien</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="evenement">À l'événement</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="published"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="published" className="text-slate-700 font-medium cursor-pointer">
                Publier le masque
              </Label>
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
              {loading ? "Enregistrement..." : formId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

