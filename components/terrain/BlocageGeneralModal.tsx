"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Building2, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"

interface BlocageGeneralModalProps {
  sites?: any[]
  affaires?: any[]
}

export default function BlocageGeneralModal({ sites = [], affaires = [] }: BlocageGeneralModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scopeLevel, setScopeLevel] = useState<"site" | "affaire">("site")
  const [siteId, setSiteId] = useState("")
  const [affaireId, setAffaireId] = useState("")
  const [cause, setCause] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!cause || !startAt || !endAt) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (scopeLevel === "site" && !siteId) {
      toast.error("Veuillez sélectionner un site")
      return
    }

    if (scopeLevel === "affaire" && !affaireId) {
      toast.error("Veuillez sélectionner une affaire")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/terrain/apply-blocage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          affaire_id: affaireId,
          cause,
          start_at: startAt,
          end_at: endAt,
          scope_level: scopeLevel,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Blocage appliqué avec succès", {
          description: `${result.nb_taches_suspendues} tâches ont été suspendues`,
        })
        setIsOpen(false)
        resetForm()
      } else {
        toast.error(result.message || "Erreur lors de l'application du blocage")
      }
    } catch (error) {
      console.error("Error applying blocage:", error)
      toast.error("Erreur lors de l'application du blocage")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setScopeLevel("site")
    setSiteId("")
    setAffaireId("")
    setCause("")
    setStartAt("")
    setEndAt("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Blocage général
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Déclarer un blocage général
          </DialogTitle>
          <DialogDescription>
            Geler toutes les tâches d'un site ou d'une affaire (grève, accès, météo)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Niveau de blocage */}
          <div className="space-y-2">
            <Label>Niveau de blocage</Label>
            <Select value={scopeLevel} onValueChange={(value: "site" | "affaire") => setScopeLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="affaire">Affaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélection site ou affaire */}
          {scopeLevel === "site" ? (
            <div className="space-y-2">
              <Label>Site concerné</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.code_site} - {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Affaire concernée</Label>
              <Select value={affaireId} onValueChange={setAffaireId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une affaire" />
                </SelectTrigger>
                <SelectContent>
                  {affaires.map((affaire) => (
                    <SelectItem key={affaire.id} value={affaire.id}>
                      {affaire.code_affaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cause */}
          <div className="space-y-2">
            <Label>Cause du blocage</Label>
            <Select value={cause} onValueChange={setCause}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une cause" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grève">Grève</SelectItem>
                <SelectItem value="Accès bloqué">Accès bloqué</SelectItem>
                <SelectItem value="Météo">Météo</SelectItem>
                <SelectItem value="Matériel">Matériel</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Début</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          {/* Avertissement */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Attention !</p>
                <p>
                  Toutes les tâches planifiées ou en cours sur ce {scopeLevel} seront suspendues pendant cette période.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Application..." : "Appliquer le blocage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

