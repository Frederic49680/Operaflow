"use client"

import React, { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock } from "lucide-react"

interface InterventionData {
  id: string
  tranche: number
  systeme_elementaire: string
  systeme?: string
  type_maintenance?: string
  etat_reel: string
  heures_presence: number
  heures_suspension: number
  heures_metal: number
  motif?: string
  description?: string
}

interface MaintenanceFormModalProps {
  children: React.ReactNode
  interventionId?: string
  interventionData?: InterventionData
  onClose?: () => void
}

export function MaintenanceFormModal({ 
  children, 
  interventionId, 
  interventionData,
  onClose 
}: MaintenanceFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isInWindow, setIsInWindow] = useState(true)
  
  // États du formulaire
  const [tranche, setTranche] = useState(interventionData?.tranche.toString() || "")
  const [systemeElementaire, setSystemeElementaire] = useState(interventionData?.systeme_elementaire || "")
  const [systeme, setSysteme] = useState(interventionData?.systeme || "")
  const [typeMaintenance, setTypeMaintenance] = useState(interventionData?.type_maintenance || "")
  const [etatReel, setEtatReel] = useState(interventionData?.etat_reel || "")
  const [heuresPresence, setHeuresPresence] = useState(interventionData?.heures_presence.toString() || "")
  const [heuresSuspension, setHeuresSuspension] = useState(interventionData?.heures_suspension.toString() || "")
  const [motif, setMotif] = useState(interventionData?.motif || "")
  const [description, setDescription] = useState(interventionData?.description || "")

  // Calculer les heures métal automatiquement
  const heuresMetal = React.useMemo(() => {
    const presence = parseFloat(heuresPresence) || 0
    const suspension = parseFloat(heuresSuspension) || 0
    return Math.max(0, presence - suspension)
  }, [heuresPresence, heuresSuspension])

  // Ouvrir le modal automatiquement si des données sont fournies (mode édition)
  useEffect(() => {
    if (interventionData) {
      setOpen(true)
    }
  }, [interventionData])

  // Vérifier la fenêtre de saisie (14h-18h)
  useEffect(() => {
    const checkTimeWindow = () => {
      const now = new Date()
      setCurrentTime(now)
      const hour = now.getHours()
      setIsInWindow(hour >= 14 && hour < 18)
    }

    checkTimeWindow()
    const interval = setInterval(checkTimeWindow, 60000) // Vérifier chaque minute

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implémenter la logique de sauvegarde
    const data = {
      id: interventionId,
      tranche: parseInt(tranche),
      systeme_elementaire: systemeElementaire,
      systeme: systeme,
      type_maintenance: typeMaintenance,
      etat_reel: etatReel,
      heures_presence: parseFloat(heuresPresence),
      heures_suspension: parseFloat(heuresSuspension),
      heures_metal: heuresMetal,
      motif: motif,
      description: description,
    }

    console.log("Données à sauvegarder:", data)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    setOpen(false)
    if (onClose) onClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {interventionId ? "Modifier l'intervention" : "Nouvelle intervention"}
          </DialogTitle>
          <DialogDescription>
            {interventionId
              ? "Modifiez les informations de l'intervention"
              : "Enregistrez une intervention de maintenance (14h-18h)"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Alerte fenêtre horaire */}
            {!isInWindow && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Fenêtre de saisie : 14h00 - 18h00 (actuellement {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
                </AlertDescription>
              </Alert>
            )}

            {/* Tranche (0..9) */}
            <div className="grid gap-2">
              <Label htmlFor="tranche" className="text-slate-700 font-medium">
                Tranche <span className="text-red-500">*</span>
              </Label>
              <Select value={tranche} onValueChange={setTranche} required>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner (0-9)" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Tranche {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Système Élémentaire (obligatoire) et Système (optionnel) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="systeme_elementaire" className="text-slate-700 font-medium">
                  Système Élémentaire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="systeme_elementaire"
                  value={systemeElementaire}
                  onChange={(e) => setSystemeElementaire(e.target.value)}
                  placeholder="LAA001BT"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Identifiant technique autonome</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="systeme" className="text-slate-700 font-medium">
                  Système (optionnel)
                </Label>
                <Input
                  id="systeme"
                  value={systeme}
                  onChange={(e) => setSysteme(e.target.value)}
                  placeholder="Élec / IEG / CVC"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Domaine technique</p>
              </div>
            </div>

            {/* Type maintenance (texte libre) et État */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type_maintenance" className="text-slate-700 font-medium">
                  Type maintenance
                </Label>
                <Input
                  id="type_maintenance"
                  value={typeMaintenance}
                  onChange={(e) => setTypeMaintenance(e.target.value)}
                  placeholder="Décharge semestriel / Contrôle / Correctif..."
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Texte libre</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="etat_reel" className="text-slate-700 font-medium">
                  État <span className="text-red-500">*</span>
                </Label>
                <Select value={etatReel} onValueChange={setEtatReel} required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non_lancee">Non lancée</SelectItem>
                    <SelectItem value="En_cours">En cours</SelectItem>
                    <SelectItem value="Termine">Terminée</SelectItem>
                    <SelectItem value="Prolongee">Prolongée</SelectItem>
                    <SelectItem value="Reportee">Reportée</SelectItem>
                    <SelectItem value="Suspendue">Suspendue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Heures */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="heures_presence" className="text-slate-700 font-medium">
                  Heures présence
                </Label>
                <Input
                  id="heures_presence"
                  type="number"
                  step="0.5"
                  value={heuresPresence}
                  onChange={(e) => setHeuresPresence(e.target.value)}
                  placeholder="4"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heures_suspension" className="text-slate-700 font-medium">
                  Heures suspension
                </Label>
                <Input
                  id="heures_suspension"
                  type="number"
                  step="0.5"
                  value={heuresSuspension}
                  onChange={(e) => setHeuresSuspension(e.target.value)}
                  placeholder="0"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heures_metal" className="text-slate-700 font-medium">
                  Heures métal (auto)
                </Label>
                <Input
                  id="heures_metal"
                  type="number"
                  step="0.5"
                  value={heuresMetal > 0 ? heuresMetal.toFixed(1) : ""}
                  disabled
                  className="border-slate-300 bg-slate-100"
                />
                <p className="text-xs text-slate-500">= Présence - Suspension</p>
              </div>
            </div>

            {/* Motif (si Suspendue) */}
            <div className="grid gap-2">
              <Label htmlFor="motif" className="text-slate-700 font-medium">
                Motif <span className="text-orange-500">*</span> <span className="text-xs text-slate-500">(si Suspendue)</span>
              </Label>
              <Textarea
                id="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Décrivez le motif de suspension..."
                rows={2}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détaillez l'intervention..."
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
              {loading ? "Enregistrement..." : interventionId ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

