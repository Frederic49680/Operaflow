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
import { Lock, AlertCircle } from "lucide-react"

interface BPULigne {
  id: string
  code_bpu: string
  libelle: string
  systeme_elementaire: string
  unite: string
  pu: number
  pu_horaire: number
  quantite: number
  quantite_disponible: number
}

interface BPURealizationTileProps {
  affaireId: string
  tacheId: string
  codeAffaire: string
  onClose: () => void
}

export function BPURealizationTile({
  affaireId,
  tacheId,
  codeAffaire,
  onClose,
}: BPURealizationTileProps) {
  const [loading, setLoading] = useState(false)
  const [loadingLignes, setLoadingLignes] = useState(true)
  const [lignes, setLignes] = useState<BPULigne[]>([])
  
  // États du formulaire
  const [tranche, setTranche] = useState("")
  const [bpuLigneId, setBpuLigneId] = useState("")
  const [systemeElementaire, setSystemeElementaire] = useState("")
  const [typeMaintenance, setTypeMaintenance] = useState("")
  const [etatReel, setEtatReel] = useState("En_cours")
  const [heuresPresence, setHeuresPresence] = useState("")
  const [heuresSuspension, setHeuresSuspension] = useState("")
  const [motif, setMotif] = useState("")
  const [description, setDescription] = useState("")

  // Calculer les heures métal
  const heuresMetal = React.useMemo(() => {
    const presence = parseFloat(heuresPresence) || 0
    const suspension = parseFloat(heuresSuspension) || 0
    return Math.max(0, presence - suspension)
  }, [heuresPresence, heuresSuspension])

  // Charger les lignes BPU disponibles
  useEffect(() => {
    const fetchLignes = async () => {
      try {
        setLoadingLignes(true)
        const response = await fetch(`/api/bpu/lignes?affaire_id=${affaireId}`)
        if (response.ok) {
          const data = await response.json()
          setLignes(data)
        }
      } catch (error) {
        console.error("Erreur chargement lignes BPU:", error)
      } finally {
        setLoadingLignes(false)
      }
    }

    fetchLignes()
  }, [affaireId])

  // Mettre à jour système élémentaire quand ligne BPU sélectionnée
  useEffect(() => {
    if (bpuLigneId) {
      const ligne = lignes.find((l) => l.id === bpuLigneId)
      if (ligne) {
        setSystemeElementaire(ligne.systeme_elementaire || "")
        setTypeMaintenance(ligne.libelle || "")
      }
    }
  }, [bpuLigneId, lignes])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        affaire_id: affaireId,
        tache_id: tacheId,
        bpu_ligne_id: bpuLigneId,
        tranche: parseInt(tranche),
        systeme_elementaire,
        type_maintenance: typeMaintenance,
        etat_reel: etatReel,
        heures_presence: parseFloat(heuresPresence),
        heures_suspension: parseFloat(heuresSuspension),
        heures_metal: heuresMetal,
        motif: etatReel === "Reportee" ? motif : null,
        description,
      }

      const response = await fetch("/api/bpu/realizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        onClose()
        // TODO: Rafraîchir la liste des réalisations
      } else {
        console.error("Erreur création réalisation BPU")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Nouvelle réalisation BPU
          </DialogTitle>
          <DialogDescription>
            Saisie guidée pour l'affaire {codeAffaire}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Affaire verrouillée */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Affaire :</strong> {codeAffaire} (verrouillée)
              </AlertDescription>
            </Alert>

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

            {/* Ligne BPU */}
            <div className="grid gap-2">
              <Label htmlFor="bpu_ligne" className="text-slate-700 font-medium">
                Ligne BPU <span className="text-red-500">*</span>
              </Label>
              {loadingLignes ? (
                <div className="text-sm text-slate-500">Chargement des lignes...</div>
              ) : lignes.length === 0 ? (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Aucune ligne BPU disponible. Importez d'abord le BPU pour cette affaire.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={bpuLigneId} onValueChange={setBpuLigneId} required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Sélectionner une ligne BPU" />
                  </SelectTrigger>
                  <SelectContent>
                    {lignes.map((ligne) => (
                      <SelectItem key={ligne.id} value={ligne.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {ligne.code_bpu} - {ligne.libelle}
                          </span>
                          <span className="text-xs text-slate-500">
                            {ligne.systeme_elementaire} • {ligne.unite} • 
                            {ligne.quantite_disponible !== null 
                              ? ` ${ligne.quantite_disponible.toFixed(2)} dispo`
                              : " Illimité"
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Système Élémentaire (auto-rempli) */}
            <div className="grid gap-2">
              <Label htmlFor="systeme_elementaire" className="text-slate-700 font-medium">
                Système Élémentaire <span className="text-red-500">*</span>
              </Label>
              <Input
                id="systeme_elementaire"
                value={systemeElementaire}
                onChange={(e) => setSystemeElementaire(e.target.value)}
                required
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500">Auto-rempli depuis la ligne BPU</p>
            </div>

            {/* Type de maintenance (auto-rempli) */}
            <div className="grid gap-2">
              <Label htmlFor="type_maintenance" className="text-slate-700 font-medium">
                Type de maintenance
              </Label>
              <Input
                id="type_maintenance"
                value={typeMaintenance}
                onChange={(e) => setTypeMaintenance(e.target.value)}
                placeholder="Type de décharge"
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500">Auto-rempli depuis la ligne BPU</p>
            </div>

            {/* État */}
            <div className="grid gap-2">
              <Label htmlFor="etat_reel" className="text-slate-700 font-medium">
                État <span className="text-red-500">*</span>
              </Label>
              <Select value={etatReel} onValueChange={setEtatReel} required>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En_cours">En cours</SelectItem>
                  <SelectItem value="Termine">Terminée</SelectItem>
                  <SelectItem value="Reportee">Reportée</SelectItem>
                  <SelectItem value="Suspendue">Suspendue</SelectItem>
                  <SelectItem value="Prolongee">Prolongée</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Motif (si Reportée) */}
            {etatReel === "Reportee" && (
              <div className="grid gap-2">
                <Label htmlFor="motif" className="text-slate-700 font-medium">
                  Motif <span className="text-orange-500">*</span> <span className="text-xs text-slate-500">(obligatoire si Reportée)</span>
                </Label>
                <Textarea
                  id="motif"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Décrivez le motif du report..."
                  rows={2}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détaillez la réalisation..."
                rows={3}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              disabled={loading || lignes.length === 0}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

