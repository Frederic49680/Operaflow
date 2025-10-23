"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Calendar, DollarSign } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  affaire: {
    code_affaire: string
    nom: string
  }
  tasksCount: number
  lotsCount: number
  isLoading?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  affaire,
  tasksCount,
  lotsCount,
  isLoading = false
}: DeleteConfirmationModalProps) {
  const hasDependencies = tasksCount > 0 || lotsCount > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmation de suppression
          </DialogTitle>
          <DialogDescription className="text-base">
            Vous êtes sur le point de supprimer l'affaire <strong>"{affaire.code_affaire}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations sur l'affaire */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{affaire.nom}</h4>
            <p className="text-sm text-gray-600">Code: {affaire.code_affaire}</p>
          </div>

          {/* Alertes sur les dépendances */}
          {hasDependencies && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-800">
                    Cette affaire contient des données liées :
                  </p>
                  <div className="space-y-1 text-sm text-red-700">
                    {tasksCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{tasksCount} tâche(s) planifiée(s)</span>
                      </div>
                    )}
                    {lotsCount > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{lotsCount} lot(s) financier(s)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Toutes ces données seront également supprimées !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message de confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              {hasDependencies 
                ? "Êtes-vous sûr de vouloir supprimer cette affaire et toutes ses données liées ? Cette action est irréversible."
                : "Êtes-vous sûr de vouloir supprimer cette affaire ? Cette action est irréversible."
              }
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isLoading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
