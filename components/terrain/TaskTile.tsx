"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Play, 
  Pause, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  History,
  Building2,
  User,
  TrendingUp
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface TaskTileProps {
  task: any
  onStatusChange?: (taskId: string, newStatus: string) => void
  onProgressChange?: (taskId: string, progress: number) => void
}

export default function TaskTile({ task, onStatusChange, onProgressChange }: TaskTileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [comment, setComment] = useState("")
  const [progress, setProgress] = useState(task.avancement_pct || 0)
  const [showDailyReport, setShowDailyReport] = useState(false)
  const [reportMode, setReportMode] = useState<"manual" | "auto">("auto")
  const [manualProgress, setManualProgress] = useState(0)

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "Non lancé":
      case "À lancer":
        return {
          label: "À lancer",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: Play,
          actions: ["Lancer", "Reporter", "Prolonger"],
        }
      case "En cours":
        return {
          label: "En cours",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: Clock,
          actions: ["Terminer", "Suspendre", "Prolonger"],
        }
      case "Suspendu":
        return {
          label: "Suspendu",
          color: "bg-slate-100 text-slate-800 border-slate-300",
          icon: Pause,
          actions: ["Relancer", "Reporter", "Prolonger"],
        }
      case "Reporté":
        return {
          label: "Reporté",
          color: "bg-orange-100 text-orange-800 border-orange-300",
          icon: Calendar,
          actions: ["Relancer", "Prolonger"],
        }
      case "Prolongé":
        return {
          label: "Prolongé",
          color: "bg-purple-100 text-purple-800 border-purple-300",
          icon: AlertCircle,
          actions: ["Terminer", "Suspendre"],
        }
      case "Terminé":
        return {
          label: "Terminé",
          color: "bg-green-100 text-green-800 border-green-300",
          icon: CheckCircle2,
          actions: [],
        }
      default:
        return {
          label: statut,
          color: "bg-slate-100 text-slate-800 border-slate-300",
          icon: Clock,
          actions: [],
        }
    }
  }

  const statusConfig = getStatusConfig(task.statut)
  const StatusIcon = statusConfig.icon

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch("/api/terrain/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: task.tache_id,
          statut_reel: newStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Tâche passée à "${newStatus}"`)
        if (onStatusChange) {
          onStatusChange(task.tache_id, newStatus)
        }
      } else {
        toast.error(result.message || "Erreur lors du changement de statut")
      }
    } catch (error) {
      console.error("Error changing status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress)
    if (onProgressChange) {
      onProgressChange(task.tache_id, newProgress)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      const response = await fetch("/api/terrain/add-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: task.tache_id,
          commentaire: comment,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Commentaire ajouté")
        setComment("")
      } else {
        toast.error(result.message || "Erreur lors de l'ajout du commentaire")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Erreur lors de l'ajout du commentaire")
    }
  }

  // Calculer l'avancement automatique basé sur les jours
  const calculateAutoProgress = () => {
    const dateDebut = new Date(task.date_debut_plan)
    const dateFin = new Date(task.date_fin_plan)
    const dateActuelle = new Date()
    
    // Nombre total de jours entre début et fin
    const totalDays = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
    
    // Nombre de jours écoulés depuis le début
    const daysElapsed = Math.ceil((dateActuelle.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
    
    // Avancement en % (minimum 0, maximum 100)
    const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100))
    
    return Math.round(progress)
  }

  const handleDailyReport = async () => {
    try {
      const finalProgress = reportMode === "auto" ? calculateAutoProgress() : manualProgress
      
      const response = await fetch("/api/terrain/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_id: task.tache_id,
          avancement_pct: finalProgress,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Avancement mis à jour : ${finalProgress}%`)
        setProgress(finalProgress)
        if (onProgressChange) {
          onProgressChange(task.tache_id, finalProgress)
        }
        setShowDailyReport(false)
        // Réinitialiser les valeurs
        setReportMode("auto")
        setManualProgress(0)
      } else {
        toast.error(result.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Error reporting daily progress:", error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  return (
    <Card className={`p-4 hover:shadow-lg transition-all duration-300 ${statusConfig.color}`}>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className="h-5 w-5" />
            <h3 className="font-semibold text-lg">{task.libelle_tache}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{task.site_code}</span>
            </div>
            {task.responsable_execution_nom && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{task.responsable_execution_prenom} {task.responsable_execution_nom}</span>
              </div>
            )}
          </div>
        </div>
        <Badge className={`${statusConfig.color} border-2`}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(task.date_debut_plan).toLocaleDateString()} → {new Date(task.date_fin_plan).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progression */}
      {task.statut === "En cours" && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Avancement</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => handleProgressChange(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      )}

      {/* Alertes */}
      {task.nb_blocages_actifs > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Site en blocage général — tâches gelées</span>
          </div>
        </div>
      )}

      {task.confirmation_en_attente > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Confirmer la reprise</span>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      {statusConfig.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Bouton "Déclarer la journée" pour les tâches En cours */}
          {task.statut === "En cours" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDailyReport(true)}
              className="border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Déclarer la journée
            </Button>
          )}
          
          {statusConfig.actions.includes("Lancer") && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("En cours")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Lancer
            </Button>
          )}
          {statusConfig.actions.includes("Terminer") && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("Terminé")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Terminer
            </Button>
          )}
          {statusConfig.actions.includes("Suspendre") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("Suspendu")}
            >
              <Pause className="h-4 w-4 mr-1" />
              Suspendre
            </Button>
          )}
          {statusConfig.actions.includes("Relancer") && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("En cours")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Relancer
            </Button>
          )}
          {statusConfig.actions.includes("Reporter") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("Reporté")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Reporter
            </Button>
          )}
          {statusConfig.actions.includes("Prolonger") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("Prolongé")}
            >
              <Clock className="h-4 w-4 mr-1" />
              Prolonger
            </Button>
          )}
        </div>
      )}

      {/* Commentaire */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Commentaire</span>
        </div>
        <Textarea
          placeholder="Ajouter un commentaire..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[80px] mb-2"
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={!comment.trim()}
          className="w-full"
        >
          Ajouter
        </Button>
      </div>

      {/* Historique */}
      <Button
        size="sm"
        variant="ghost"
        className="w-full mt-2"
        onClick={() => setIsEditing(!isEditing)}
      >
        <History className="h-4 w-4 mr-2" />
        Voir l'historique
      </Button>

      {/* Modale de déclaration journalière */}
      <Dialog open={showDailyReport} onOpenChange={setShowDailyReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déclarer l'avancement du jour</DialogTitle>
            <DialogDescription>
              Choisissez le mode de calcul de l'avancement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={reportMode} onValueChange={(value) => setReportMode(value as "manual" | "auto")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">Calcul automatique</div>
                    <div className="text-sm text-muted-foreground">
                      Basé sur les jours écoulés ({task.date_debut_plan && task.date_fin_plan && 
                        Math.ceil((new Date(task.date_fin_plan).getTime() - new Date(task.date_debut_plan).getTime()) / (1000 * 60 * 60 * 24))
                      } jours au total)
                    </div>
                    <div className="text-sm font-semibold text-blue-600 mt-1">
                      Avancement: {calculateAutoProgress()}%
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">Saisie manuelle</div>
                    <div className="text-sm text-muted-foreground">
                      Définissez l'avancement de 0 à 100%
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {reportMode === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="manual-progress">Avancement (%)</Label>
                <Input
                  id="manual-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={manualProgress}
                  onChange={(e) => setManualProgress(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={manualProgress}
                    onChange={(e) => setManualProgress(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{manualProgress}%</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDailyReport(false)}>
                Annuler
              </Button>
              <Button onClick={handleDailyReport}>
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

