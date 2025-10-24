"use client"

import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect, useCallback } from "react"

interface ModuleStats {
  collaborateursActifs: number
  rolesHierarchiques: number
  formationsEnCours: number
  sitesActifs: number
  affectationsActives: number
  systemeConfigure: boolean
}

export function RHModuleStats() {
  const [stats, setStats] = useState<ModuleStats>({
    collaborateursActifs: 0,
    rolesHierarchiques: 0,
    formationsEnCours: 0,
    sitesActifs: 0,
    affectationsActives: 0,
    systemeConfigure: false,
  })
  const [loading, setLoading] = useState(true)

  const fetchModuleStats = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Collaborateurs actifs
      const { count: collaborateursActifs, error: collabError } = await supabase
        .from('ressources')
        .select('id', { count: 'exact', head: true })
        .eq('actif', true)
        .not('is_admin', 'eq', true)

      if (collabError) throw collabError

      // Rôles hiérarchiques (compter les rôles uniques)
      const { data: rolesData, error: rolesError } = await supabase
        .from('ressources')
        .select('role_principal')
        .eq('actif', true)
        .not('is_admin', 'eq', true)
        .not('role_principal', 'is', null)

      if (rolesError) throw rolesError

      const rolesUniques = new Set(rolesData?.map(r => r.role_principal).filter(Boolean))
      const rolesHierarchiques = rolesUniques.size

      // Sites actifs
      const { count: sitesActifs, error: sitesError } = await supabase
        .from('sites')
        .select('id', { count: 'exact', head: true })
        .eq('statut', 'Actif')

      if (sitesError) throw sitesError

      // Formations en cours
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
        console.log('Table formations pas encore créée')
      }

      // Affectations actives
      let affectationsActives = 0
      try {
        const { count: affectationsCount, error: affectationsError } = await supabase
          .from('taches_ressources')
          .select('id', { count: 'exact', head: true })

        if (!affectationsError) {
          affectationsActives = affectationsCount || 0
        }
      } catch (error) {
        console.log('Table affectations pas encore créée')
      }

      // Vérifier si le système est configuré (au moins 1 site et 1 collaborateur)
      const systemeConfigure = (sitesActifs || 0) > 0 && (collaborateursActifs || 0) > 0

      setStats({
        collaborateursActifs: collaborateursActifs || 0,
        rolesHierarchiques,
        formationsEnCours,
        sitesActifs: sitesActifs || 0,
        affectationsActives,
        systemeConfigure,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques des modules:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModuleStats()

    // Écouter les événements de mise à jour
    const handleRefresh = () => fetchModuleStats()
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
  }, [fetchModuleStats])

  if (loading) {
    return {
      collaborateursActifs: "...",
      rolesHierarchiques: "...",
      formationsEnCours: "...",
      sitesActifs: "...",
      affectationsActives: "...",
      systemeConfigure: "...",
    }
  }

  return {
    collaborateursActifs: `${stats.collaborateursActifs} collaborateurs actifs`,
    rolesHierarchiques: `${stats.rolesHierarchiques} rôles hiérarchiques`,
    formationsEnCours: `${stats.formationsEnCours} formations en cours`,
    sitesActifs: `${stats.sitesActifs} sites actifs`,
    affectationsActives: `${stats.affectationsActives} affectations actives`,
    systemeConfigure: stats.systemeConfigure ? "Système configuré" : "Configuration requise",
  }
}
