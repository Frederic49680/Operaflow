"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface ResourceConflict {
  id: string
  ressource_id: string
  ressource_nom: string
  ressource_prenom: string
  task_id: string
  libelle_tache: string
  conflict_type: string
  conflict_details: any
  severity: string
  resolved: boolean
  created_at: string
}

export default function ConflictDetector() {
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    severity: "all",
    type: "all",
    resolved: false
  })

  useEffect(() => {
    loadConflicts()
  }, [])

  useEffect(() => {
    let filtered = conflicts

    if (filter.severity !== "all") {
      filtered = filtered.filter(conflict => conflict.severity === filter.severity)
    }

    if (filter.type !== "all") {
      filtered = filtered.filter(conflict => conflict.conflict_type === filter.type)
    }

    if (filter.resolved) {
      filtered = filtered.filter(conflict => conflict.resolved)
    } else {
      filtered = filtered.filter(conflict => !conflict.resolved)
    }

    setConflicts(filtered)
  }, [conflicts, filter])

  const loadConflicts = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('v_resource_conflicts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setConflicts(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des conflits:', error)
      toast.error("Erreur lors du chargement des conflits")
    } finally {
      setLoading(false)
    }
  }

  const handleResolveConflict = async (conflictId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_conflicts')
        .update({ 
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', conflictId)

      if (error) throw error

      toast.success("Conflit résolu")
      loadConflicts()
    } catch (error) {
      console.error('Erreur lors de la résolution:', error)
      toast.error("Erreur lors de la résolution")
    }
  }

  const handleUnresolveConflict = async (conflictId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_conflicts')
        .update({ 
          resolved: false,
          resolved_at: null
        })
        .eq('id', conflictId)

      if (error) throw error

      toast.success("Conflit réactivé")
      loadConflicts()
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error)
      toast.error("Erreur lors de la réactivation")
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'overallocation': return 'Sur-affectation'
      case 'absence': return 'Absence'
      case 'competence_mismatch': return 'Inadéquation compétence'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des conflits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Détection de Conflits
            </CardTitle>
            <Button onClick={loadConflicts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les types</option>
              <option value="overallocation">Sur-affectation</option>
              <option value="absence">Absence</option>
              <option value="competence_mismatch">Inadéquation compétence</option>
            </select>

            <select
              value={filter.resolved ? "resolved" : "unresolved"}
              onChange={(e) => setFilter({ ...filter, resolved: e.target.value === "resolved" })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="unresolved">Non résolus</option>
              <option value="resolved">Résolus</option>
            </select>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des conflits */}
      <div className="space-y-4">
        {conflicts.map((conflict) => (
          <Card key={conflict.id} className={`${conflict.resolved ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getSeverityIcon(conflict.severity)}
                    <Badge className={getSeverityColor(conflict.severity)}>
                      {conflict.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {getConflictTypeLabel(conflict.conflict_type)}
                    </Badge>
                    {conflict.resolved && (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Résolu
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">
                    {conflict.libelle_tache}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{conflict.ressource_prenom} {conflict.ressource_nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(conflict.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>ID: {conflict.task_id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Détails du conflit */}
                  {conflict.conflict_details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Détails :</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(conflict.conflict_details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {conflict.resolved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnresolveConflict(conflict.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Réactiver
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveConflict(conflict.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Résoudre
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun conflit */}
      {conflicts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {filter.resolved 
                ? "Aucun conflit résolu trouvé" 
                : "Aucun conflit détecté"}
            </p>
            <p className="text-sm text-gray-400">
              Les conflits de ressources apparaîtront automatiquement ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
