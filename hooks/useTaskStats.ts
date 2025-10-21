"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface TaskStats {
  totalTasks: number
  activeTasks: number
  conflicts: number
  pendingAffaires: number
}

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    activeTasks: 0,
    conflicts: 0,
    pendingAffaires: 0
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Total des tâches
      const { count: totalTasks } = await supabase
        .from('planning_taches')
        .select('*', { count: 'exact', head: true })

      // Tâches actives (en cours)
      const { count: activeTasks } = await supabase
        .from('planning_taches')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'En cours')

      // Conflits de ressources (suraffectation)
      const { data: conflictsData } = await supabase
        .from('planning_taches')
        .select(`
          id,
          taches_ressources!inner(
            ressource_id,
            charge_h
          )
        `)
        .eq('statut', 'En cours')

      // Calculer les conflits (ressources > 100%)
      let conflicts = 0
      if (conflictsData) {
        const resourceLoads = new Map<string, number>()
        
        conflictsData.forEach(task => {
          task.taches_ressources.forEach((tr: any) => {
            const current = resourceLoads.get(tr.ressource_id) || 0
            resourceLoads.set(tr.ressource_id, current + tr.charge_h)
          })
        })

        conflicts = Array.from(resourceLoads.values()).filter(load => load > 100).length
      }

      // Affaires à planifier
      const { count: pendingAffaires } = await supabase
        .from('affaires')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'A_planifier')

      setStats({
        totalTasks: totalTasks || 0,
        activeTasks: activeTasks || 0,
        conflicts,
        pendingAffaires: pendingAffaires || 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return { stats, loading, refreshStats: loadStats }
}
