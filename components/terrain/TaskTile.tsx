"use client"

import { useState, useEffect } from "react"
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
  TrendingUp,
  RotateCcw,
  Plus,
  AlertTriangle
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import SuspendModal from "./SuspendModal"
import ReprendModal from "./ReprendModal"
import ReportModal from "./ReportModal"
import ProlongModal from "./ProlongModal"

interface TaskTileProps {
  task: any
  onStatusChange?: (taskId: string, newStatus: string) => void
  onProgressChange?: (taskId: string, progress: number) => void
  onDailyReport?: () => void
}

export default function TaskTile({ task, onStatusChange, onProgressChange, onDailyReport }: TaskTileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [comment, setComment] = useState("")
  const [progress, setProgress] = useState(task.avancement_pct || 0)
  const [currentStatus, setCurrentStatus] = useState(task.statut || "Non lancé")
  const [showDailyReport, setShowDailyReport] = useState(false)
  const [reportMode, setReportMode] = useState<"manual" | "auto">("auto")
  const [manualProgress, setManualProgress] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [hasDailyReportToday, setHasDailyReportToday] = useState(false)
  
  // États pour les nouvelles modales
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReprendModal, setShowReprendModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showProlongModal, setShowProlongModal] = useState(false)

  // Mettre à jour le statut local quand la prop change
  useEffect(() => {
    setCurrentStatus(task.statut || "Non lancé")
  }, [task.statut])

  // Vérifier si une remontée journalière a déjà été faite aujourd'hui
  useEffect(() => {
    const checkDailyReport = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/terrain/history?tache_id=${task.tache_id}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const hasReportToday = result.data.some((entry: any) => 
            entry.date_saisie === today && entry.avancement_pct > 0
          )
          setHasDailyReportToday(hasReportToday)
        }
      } catch (error) {
        console.error("Error checking daily report:", error)
      }
    }
    
    checkDailyReport()
  }, [task.tache_id])

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

  const statusConfig = getStatusConfig(currentStatus)
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
        setCurrentStatus(newStatus) // Mettre à jour le statut local immédiatement
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
        setHasDailyReportToday(true) // Marquer qu'une remontée a été faite aujourd'hui
        if (onProgressChange) {
          onProgressChange(task.tache_id, finalProgress)
        }
        if (onDailyReport) {
          onDailyReport() // Notifier le parent pour mettre à jour les stats
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

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/terrain/history?tache_id=${task.tache_id}`)
      const result = await response.json()
      
      if (result.success) {
        setHistoryData(result.data)
        setShowHistory(true)
      } else {
        toast.error(result.message || "Erreur lors du chargement de l'historique")
      }
    } catch (error) {
      console.error("Error loading history:", error)
      toast.error("Erreur lors du chargement de l'historique")
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

      {/* Dates et jours actifs */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(task.date_debut_plan).toLocaleDateString()} → {new Date(task.date_fin_plan).toLocaleDateString()}</span>
        </div>
        {task.jours_actifs !== undefined && task.jours_actifs > 0 && (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock className="h-4 w-4" />
            <span>{task.jours_actifs} jour{task.jours_actifs > 1 ? 's' : ''} actif{task.jours_actifs > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Progression */}
      {currentStatus === "En cours" && (
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

      {/* Alertes et informations de statut */}
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

      {/* Informations de suspension */}
      {currentStatus === "Suspendu" && task.motif_suspension && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-700 text-sm mb-1">
            <Pause className="h-4 w-4" />
            <span className="font-medium">Suspendu depuis le {task.date_suspension ? new Date(task.date_suspension).toLocaleDateString() : 'N/A'}</span>
          </div>
          <p className="text-xs text-orange-600">{task.motif_suspension}</p>
        </div>
      )}

      {/* Informations de report */}
      {currentStatus === "Reporté" && task.motif_report && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 text-sm mb-1">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Reporté - Reprise prévue le {task.date_report ? new Date(task.date_report).toLocaleDateString() : 'N/A'}</span>
          </div>
          <p className="text-xs text-yellow-600">{task.motif_report}</p>
        </div>
      )}

      {/* Informations de prolongation */}
      {currentStatus === "Prolongé" && task.motif_prolongation && (
        <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 text-purple-700 text-sm mb-1">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Prolongé de {task.duree_sup || 0} jour{(task.duree_sup || 0) > 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-purple-600">{task.motif_prolongation}</p>
        </div>
      )}

      {/* Actions rapides selon PRD v2 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Bouton "Déclarer la journée" pour les tâches En cours */}
        {currentStatus === "En cours" && !hasDailyReportToday && (
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
        
        {/* ▶️ Lancer - Visible si statut = Non lancé */}
        {currentStatus === "Non lancé" && (
          <Button
            size="sm"
            onClick={() => handleStatusChange("En cours")}
            className="bg-green-500 hover:bg-green-600"
          >
            <Play className="h-4 w-4 mr-1" />
            Lancer
          </Button>
        )}
        
        {/* ⏸️ Suspendre - Visible si statut = En cours */}
        {currentStatus === "En cours" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSuspendModal(true)}
            className="border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            <Pause className="h-4 w-4 mr-1" />
            Suspendre
          </Button>
        )}
        
        {/* 🔁 Reprendre - Visible si statut = Suspendu ou Reporté */}
        {(currentStatus === "Suspendu" || currentStatus === "Reporté") && (
          <Button
            size="sm"
            onClick={() => setShowReprendModal(true)}
            className="bg-green-500 hover:bg-green-600"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reprendre
          </Button>
        )}
        
        {/* 🟨 Reporter - Visible si statut = En cours */}
        {currentStatus === "En cours" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReportModal(true)}
            className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reporter
          </Button>
        )}
        
        {/* 🟥 Claim - Visible si statut = Reporté / Bloqué */}
        {(currentStatus === "Reporté" || currentStatus === "Bloqué") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {/* TODO: Ouvrir modal Claim */}}
            className="border-red-500 text-red-700 hover:bg-red-50"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Claim
          </Button>
        )}
        
        {/* ➕ Prolonger - Visible si statut = En cours ou Suspendu */}
        {(currentStatus === "En cours" || currentStatus === "Suspendu") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProlongModal(true)}
            className="border-green-500 text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Prolonger
          </Button>
        )}
        
        {/* Terminer - Visible si statut = En cours */}
        {currentStatus === "En cours" && (
          <Button
            size="sm"
            onClick={() => handleStatusChange("Terminé")}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Terminer
          </Button>
        )}
        
        {/* Actions legacy pour compatibilité */}
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
        onClick={loadHistory}
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

      {/* Modale d'historique */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des remontées - {task.libelle_tache}</DialogTitle>
            <DialogDescription>
              Historique complet des modifications de statut et d'avancement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {historyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun historique disponible pour cette tâche
              </div>
            ) : (
              <div className="space-y-3">
                {historyData.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(entry.date_saisie).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <Badge className={`${
                        entry.statut_reel === 'Terminée' ? 'bg-green-100 text-green-800' :
                        entry.statut_reel === 'En cours' ? 'bg-blue-100 text-blue-800' :
                        entry.statut_reel === 'Suspendue' ? 'bg-slate-100 text-slate-800' :
                        entry.statut_reel === 'Reportée' ? 'bg-orange-100 text-orange-800' :
                        entry.statut_reel === 'Prolongée' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.statut_reel}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Avancement:</span> {entry.avancement_pct || 0}%
                      </div>
                      <div>
                        <span className="font-medium">Heures métal:</span> {entry.heures_metal || 0}h
                      </div>
                      {entry.nb_present && (
                        <div>
                          <span className="font-medium">Présents:</span> {entry.nb_present}
                        </div>
                      )}
                      {entry.motif && (
                        <div>
                          <span className="font-medium">Motif:</span> {entry.motif}
                        </div>
                      )}
                    </div>
                    
                    {entry.commentaire && (
                      <div className="bg-slate-50 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Commentaire</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.commentaire}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Enregistré le {new Date(entry.date_creation).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales PRD v2 */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        taskId={task.tache_id}
        taskName={task.libelle_tache}
        onSuccess={() => {
          if (onStatusChange) onStatusChange(task.tache_id, "Suspendu")
          setCurrentStatus("Suspendu")
        }}
      />

      <ReprendModal
        isOpen={showReprendModal}
        onClose={() => setShowReprendModal(false)}
        taskId={task.tache_id}
        taskName={task.libelle_tache}
        onSuccess={() => {
          if (onStatusChange) onStatusChange(task.tache_id, "En cours")
          setCurrentStatus("En cours")
        }}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        taskId={task.tache_id}
        taskName={task.libelle_tache}
        onSuccess={() => {
          if (onStatusChange) onStatusChange(task.tache_id, "Reporté")
          setCurrentStatus("Reporté")
        }}
      />

      <ProlongModal
        isOpen={showProlongModal}
        onClose={() => setShowProlongModal(false)}
        taskId={task.tache_id}
        taskName={task.libelle_tache}
        currentEndDate={task.date_fin_plan}
        onSuccess={() => {
          // Recharger les données de la tâche pour voir la nouvelle date de fin
          if (onStatusChange) onStatusChange(task.tache_id, currentStatus)
        }}
      />
    </Card>
  )
}

