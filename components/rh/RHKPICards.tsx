"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Shield, Star, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect, useCallback } from "react"

interface RHStats {
  totalCollaborateurs: number
  collaborateursCeMois: number
  rolesActifs: number
  competences: number
  formationsEnCours: number
  sitesActifs: number
  affectationsActives: number
}

export function RHKPICards() {
  const [stats, setStats] = useState<RHStats>({
    totalCollaborateurs: 0,
    collaborateursCeMois: 0,
    rolesActifs: 0,
    competences: 0,
    formationsEnCours: 0,
    sitesActifs: 0,
    affectationsActives: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Collaborateurs actifs
      const { count: totalCollaborateurs, error: collabError } = await supabase
        .from('ressources')
        .select('id', { count: 'exact', head: true })
        .eq('actif', true)
        .not('is_admin', true) // Exclure l'admin

      if (collabError) throw collabError

      // Collaborateurs ajoutés ce mois
      const debutMois = new Date()
      debutMois.setDate(1)
      debutMois.setHours(0, 0, 0, 0)

      const { count: collaborateursCeMois, error: ceMoisError } = await supabase
        .from('ressources')
        .select('id', { count: 'exact', head: true })
        .eq('actif', true)
        .not('is_admin', true)
        .gte('date_creation', debutMois.toISOString())

      if (ceMoisError) throw ceMoisError

      // Rôles actifs (compter les rôles uniques utilisés)
      const { data: rolesData, error: rolesError } = await supabase
        .from('ressources')
        .select('role_principal')
        .eq('actif', true)
        .not('is_admin', true)
        .not('role_principal', null)

      if (rolesError) throw rolesError

      const rolesUniques = new Set(rolesData?.map(r => r.role_principal).filter(Boolean))
      const rolesActifs = rolesUniques.size

      // Compétences (compter les compétences uniques)
      const { data: competencesData, error: competencesError } = await supabase
        .from('competencies')
        .select('id')

      if (competencesError) throw competencesError

      // Sites actifs
      const { count: sitesActifs, error: sitesError } = await supabase
        .from('sites')
        .select('id', { count: 'exact', head: true })
        .eq('statut', 'Actif')

      if (sitesError) throw sitesError

      // Formations en cours (si la table existe)
      let formationsEnCours = 0
      try {
        const { count: formationsCount, error: formationsError } = await supabase
          .from('plan_formation_ressource')
          .select('id', { count: 'exact', head: true })
          .in('statut', ['previsionnel', 'valide', 'planifie'])

        if (!formationsError) {
          formationsEnCours = formationsCount || 0
        }
      } catch (error) {
        // Table n'existe pas encore, on garde 0
        console.log('Table formations pas encore créée')
      }

      // Affectations actives (si la table existe)
      let affectationsActives = 0
      try {
        const { count: affectationsCount, error: affectationsError } = await supabase
          .from('taches_ressources')
          .select('id', { count: 'exact', head: true })

        if (!affectationsError) {
          affectationsActives = affectationsCount || 0
        }
      } catch (error) {
        // Table n'existe pas encore, on garde 0
        console.log('Table affectations pas encore créée')
      }

      setStats({
        totalCollaborateurs: totalCollaborateurs || 0,
        collaborateursCeMois: collaborateursCeMois || 0,
        rolesActifs,
        competences: competencesData?.length || 0,
        formationsEnCours,
        sitesActifs: sitesActifs || 0,
        affectationsActives,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques RH:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Écouter les événements de mise à jour
    const handleRefresh = () => fetchStats()
    window.addEventListener('collaborateur-created', handleRefresh)
    window.addEventListener('collaborateur-updated', handleRefresh)
    window.addEventListener('collaborateur-deleted', handleRefresh)
    window.addEventListener('site-created', handleRefresh)
    window.addEventListener('site-updated', handleRefresh)

    return () => {
      window.removeEventListener('collaborateur-created', handleRefresh)
      window.removeEventListener('collaborateur-updated', handleRefresh)
      window.removeEventListener('collaborateur-deleted', handleRefresh)
      window.removeEventListener('site-created', handleRefresh)
      window.removeEventListener('site-updated', handleRefresh)
    }
  }, [fetchStats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Collaborateurs */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collaborateurs</p>
              <p className="text-2xl font-bold">{stats.totalCollaborateurs}</p>
              <p className="text-xs text-green-600">
                +{stats.collaborateursCeMois} ce mois
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rôles actifs */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rôles actifs</p>
              <p className="text-2xl font-bold">{stats.rolesActifs}</p>
              <p className="text-xs text-blue-600">Hiérarchiques</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compétences */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Compétences</p>
              <p className="text-2xl font-bold">{stats.competences}</p>
              <p className="text-xs text-purple-600">Référencées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formations */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Formations</p>
              <p className="text-2xl font-bold">{stats.formationsEnCours}</p>
              <p className="text-xs text-orange-600">En cours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
