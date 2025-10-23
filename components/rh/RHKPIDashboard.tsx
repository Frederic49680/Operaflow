"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Target, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"

interface KPIData {
  totalResources: number
  activeResources: number
  totalRoles: number
  totalCompetencies: number
  assignmentsConfirmed: number
  assignmentsProvisional: number
  assignmentsPending: number
  averageScore: number
  topCompetencies: Array<{
    competency: string
    count: number
    percentage: number
  }>
  roleDistribution: Array<{
    role: string
    count: number
    percentage: number
  }>
  assignmentTrends: Array<{
    month: string
    confirmed: number
    provisional: number
  }>
}

export default function RHKPIDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIData()
  }, [])

  const loadKPIData = async () => {
    try {
      const supabase = createClient()
      
      // Charger les données de base
      const [
        { data: resources },
        { data: roles },
        { data: competencies },
        { data: assignments },
        { data: provisionalAssignments },
        { data: resourceCompetencies },
        { data: resourceRoles }
      ] = await Promise.all([
        supabase.from('ressources').select('id, actif'),
        supabase.from('roles').select('code'),
        supabase.from('competencies').select('code'),
        supabase.from('assignments').select('id, status'),
        supabase.from('provisional_assignments').select('id, status'),
        supabase.from('resource_competencies').select('competency_code'),
        supabase.from('resource_roles').select('role_code')
      ])

      // Calculer les statistiques
      const totalResources = resources?.length || 0
      const activeResources = resources?.filter(r => r.actif).length || 0
      const totalRoles = roles?.length || 0
      const totalCompetencies = competencies?.length || 0
      
      const assignmentsConfirmed = assignments?.filter(a => a.status === 'CONFIRMED').length || 0
      const assignmentsProvisional = provisionalAssignments?.filter(a => a.status === 'PENDING').length || 0
      const assignmentsPending = provisionalAssignments?.filter(a => a.status === 'PENDING').length || 0

      // Distribution des compétences
      const competencyCounts = resourceCompetencies?.reduce((acc, rc) => {
        acc[rc.competency_code] = (acc[rc.competency_code] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topCompetencies = Object.entries(competencyCounts)
        .map(([competency, count]) => ({
          competency,
          count,
          percentage: (count / totalResources) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Distribution des rôles
      const roleCounts = resourceRoles?.reduce((acc, rr) => {
        acc[rr.role_code] = (acc[rr.role_code] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const roleDistribution = Object.entries(roleCounts)
        .map(([role, count]) => ({
          role,
          count,
          percentage: (count / totalResources) * 100
        }))
        .sort((a, b) => b.count - a.count)

      setKpiData({
        totalResources,
        activeResources,
        totalRoles,
        totalCompetencies,
        assignmentsConfirmed,
        assignmentsProvisional,
        assignmentsPending,
        averageScore: 75, // À calculer avec les vrais scores
        topCompetencies,
        roleDistribution,
        assignmentTrends: [] // À implémenter avec des données historiques
      })
    } catch (error) {
      console.error('Erreur lors du chargement des KPI:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Chargement des indicateurs...</div>
  }

  if (!kpiData) {
    return <div className="p-6">Erreur lors du chargement des données</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau de Bord RH</h2>
        <Badge variant="outline" className="text-sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Indicateurs de performance
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressources Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeResources}</div>
            <p className="text-xs text-muted-foreground">
              sur {kpiData.totalResources} total
            </p>
            <Progress 
              value={(kpiData.activeResources / kpiData.totalResources) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rôles & Compétences</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              rôles • {kpiData.totalCompetencies} compétences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affectations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.assignmentsConfirmed}</div>
            <p className="text-xs text-muted-foreground">
              confirmées • {kpiData.assignmentsPending} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Adéquation ressources/tâches
            </p>
            <Progress value={kpiData.averageScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Compétences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 5 Compétences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.topCompetencies.map((comp, index) => (
                <div key={comp.competency} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comp.competency}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {comp.count} personnes
                      </span>
                      <Badge variant="outline">
                        {comp.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={comp.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution des Rôles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribution des Rôles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.roleDistribution.map((role) => (
                <div key={role.role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.role}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {role.count} personnes
                      </span>
                      <Badge variant="outline">
                        {role.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={role.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData.assignmentsPending > 0 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Affectations en attente</p>
                    <p className="text-xs text-muted-foreground">
                      {kpiData.assignmentsPending} demandes à valider
                    </p>
                  </div>
                </div>
              )}
              
              {kpiData.activeResources < kpiData.totalResources && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Users className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Ressources inactives</p>
                    <p className="text-xs text-muted-foreground">
                      {kpiData.totalResources - kpiData.activeResources} collaborateurs inactifs
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taux d'occupation</span>
                <Badge variant="default">85%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfaction</span>
                <Badge variant="default">4.2/5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Formation</span>
                <Badge variant="default">78%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Valider les affectations en attente
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Mettre à jour les compétences
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                Planifier les formations
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
