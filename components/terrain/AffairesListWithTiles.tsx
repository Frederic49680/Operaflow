"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Building2, 
  User,
  TrendingUp,
  Calendar
} from "lucide-react"
import TaskTile from "./TaskTile"

interface AffairesListWithTilesProps {
  siteId?: string
}

export default function AffairesListWithTiles({ siteId }: AffairesListWithTilesProps) {
  const [affaires, setAffaires] = useState<any[]>([])
  const [selectedAffaire, setSelectedAffaire] = useState<string | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Charger les affaires
  useEffect(() => {
    loadAffaires()
  }, [siteId, loadAffaires])

  // Charger les tâches de l'affaire sélectionnée
  useEffect(() => {
    if (selectedAffaire) {
      loadTasks(selectedAffaire)
    }
  }, [selectedAffaire])

  const loadAffaires = async () => {
    setIsLoading(true)
    try {
      const url = siteId 
        ? `/api/terrain/affaires?site_id=${siteId}`
        : "/api/terrain/affaires"
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setAffaires(result.data)
      }
    } catch (error) {
      console.error("Error loading affaires:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async (affaireId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/terrain/tasks?affaire_id=${affaireId}`)
      const result = await response.json()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenAffaire = (affaireId: string) => {
    setSelectedAffaire(affaireId)
  }

  const handleBackToList = () => {
    setSelectedAffaire(null)
    setTasks([])
  }

  const filteredAffaires = affaires.filter((affaire) =>
    affaire.code_affaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affaire.site_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedAffaire) {
    // Vue tuiles
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList}>
            ← Retour à la liste
          </Button>
          <h3 className="text-lg font-semibold">Tâches de l'affaire</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskTile
                key={task.tache_id}
                task={task}
                onStatusChange={(taskId, newStatus) => {
                  setTasks(tasks.map((t) => 
                    t.tache_id === taskId ? { ...t, statut: newStatus } : t
                  ))
                }}
                onProgressChange={(taskId, progress) => {
                  setTasks(tasks.map((t) => 
                    t.tache_id === taskId ? { ...t, avancement_pct: progress } : t
                  ))
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Vue liste
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Affaires planifiées</CardTitle>
            <CardDescription>
              Liste des affaires avec tâches du jour
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAffaires.map((affaire) => (
              <div
                key={affaire.affaire_id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleOpenAffaire(affaire.affaire_id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{affaire.code_affaire}</h4>
                    <Badge variant="secondary">
                      {affaire.dernier_statut_global || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{affaire.site_nom}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{affaire.responsable_prenom} {affaire.responsable_nom}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{affaire.affaire_avancement}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{affaire.nb_taches_jour} tâches</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

