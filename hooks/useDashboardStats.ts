"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface DashboardStats {
  sitesActifs: number
  collaborateurs: number
  affairesEnCours: number
  tachesActives: number
  loading: boolean
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    sitesActifs: 0,
    collaborateurs: 0,
    affairesEnCours: 0,
    tachesActives: 0,
    loading: true
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }))
      const supabase = createClient()

      // Charger les sites actifs
      const { count: sitesCount } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Actif')

      // Charger les collaborateurs actifs
      const { count: collaborateursCount } = await supabase
        .from('ressources')
        .select('*', { count: 'exact', head: true })
        .eq('actif', true)

      // Charger les affaires en cours
      const { count: affairesCount } = await supabase
        .from('affaires')
        .select('*', { count: 'exact', head: true })
        .in('statut', ['Soumise', 'Validee', 'En_cours'])

      // Charger les tâches actives
      const { count: tachesCount } = await supabase
        .from('planning_taches')
        .select('*', { count: 'exact', head: true })
        .in('statut', ['En_cours', 'A_faire'])

      setStats({
        sitesActifs: sitesCount || 0,
        collaborateurs: collaborateursCount || 0,
        affairesEnCours: affairesCount || 0,
        tachesActives: tachesCount || 0,
        loading: false
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return { stats, refreshStats: loadStats }
}
