"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Task {
  id: string
  libelle_tache: string
  affaire_id?: string
  lot_id?: string
  site_id?: string
  date_debut_plan?: string
  date_fin_plan?: string
  date_debut_reelle?: string
  date_fin_reelle?: string
  effort_plan_h?: number
  effort_reel_h?: number
  avancement_pct: number
  statut: string
  type_tache?: string
  competence?: string
  ressource_ids?: string[]
  created_by?: string
  date_creation: string
  updated_at: string
  expanded?: boolean
  // Relations
  affaire?: {
    nom: string
    code_affaire: string
  }
  site?: {
    nom: string
    code_site: string
  }
  ressources?: Array<{
    id: string
    nom: string
    prenom: string
  }>
  enfants?: Task[]
  // Colonnes migration 039
  level?: number
  parent_id?: string
  order_index?: number
  is_milestone?: boolean
  manual?: boolean
  template_origin_id?: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('planning_taches')
        .select(`
          id,
          libelle_tache,
          affaire_id,
          lot_id,
          site_id,
          date_debut_plan,
          date_fin_plan,
          date_debut_reelle,
          date_fin_reelle,
          effort_plan_h,
          effort_reel_h,
          avancement_pct,
          statut,
          type_tache,
          competence,
          ressource_ids,
          created_by,
          date_creation,
          updated_at,
          level,
          parent_id,
          order_index,
          is_milestone,
          manual,
          template_origin_id
        `)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Organiser les tâches en hiérarchie
      const tasksMap = new Map<string, Task>()
      const rootTasks: Task[] = []

      data?.forEach((task: any) => {
        const taskWithRelations: Task = {
          ...task,
          enfants: []
        }
        tasksMap.set(task.id, taskWithRelations)
      })

      // Construire la hiérarchie
      tasksMap.forEach((task) => {
        if (task.parent_id) {
          const parent = tasksMap.get(task.parent_id)
          if (parent) {
            parent.enfants = parent.enfants || []
            parent.enfants.push(task)
          }
        } else {
          rootTasks.push(task)
        }
      })

      setTasks(rootTasks)
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
      toast.error("Erreur lors du chargement des tâches")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('planning_taches')
        .insert([{
          libelle_tache: taskData.libelle_tache,
          affaire_id: taskData.affaire_id,
          lot_id: taskData.lot_id,
          site_id: taskData.site_id,
          date_debut_plan: taskData.date_debut_plan,
          date_fin_plan: taskData.date_fin_plan,
          effort_plan_h: taskData.effort_plan_h,
          avancement_pct: taskData.avancement_pct || 0,
          statut: taskData.statut || 'Non lancé',
          type_tache: taskData.type_tache || 'Autre',
          competence: taskData.competence
        }])
        .select()
        .single()

      if (error) throw error

      toast.success("Tâche créée avec succès")
      await loadTasks()
      return data
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error("Erreur lors de la création de la tâche")
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('planning_taches')
        .update({
          libelle_tache: updates.libelle_tache,
          date_debut_plan: updates.date_debut_plan,
          date_fin_plan: updates.date_fin_plan,
          date_debut_reelle: updates.date_debut_reelle,
          date_fin_reelle: updates.date_fin_reelle,
          effort_plan_h: updates.effort_plan_h,
          effort_reel_h: updates.effort_reel_h,
          avancement_pct: updates.avancement_pct,
          statut: updates.statut,
          type_tache: updates.type_tache,
          competence: updates.competence,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success("Tâche mise à jour")
      await loadTasks()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error("Erreur lors de la mise à jour")
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('planning_taches')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Tâche supprimée")
      await loadTasks()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression")
      throw error
    }
  }

  const createSubTask = async (parentId: string, taskData: Partial<Task>) => {
    try {
      const supabase = createClient()

      // Créer une sous-tâche simple (la hiérarchie via parent_id n'est pas supportée dans la base actuelle)
      const { data, error} = await supabase
        .from('planning_taches')
        .insert([{
          libelle_tache: taskData.libelle_tache,
          affaire_id: taskData.affaire_id,
          lot_id: taskData.lot_id,
          site_id: taskData.site_id,
          date_debut_plan: taskData.date_debut_plan,
          date_fin_plan: taskData.date_fin_plan,
          effort_plan_h: taskData.effort_plan_h,
          avancement_pct: taskData.avancement_pct || 0,
          statut: taskData.statut || 'Non lancé',
          type_tache: taskData.type_tache || 'Autre',
          competence: taskData.competence
        }])
        .select()
        .single()

      if (error) throw error

      toast.success("Sous-tâche créée")
      await loadTasks()
      return data
    } catch (error) {
      console.error('Erreur lors de la création de la sous-tâche:', error)
      toast.error("Erreur lors de la création de la sous-tâche")
      throw error
    }
  }

  const assignResource = async (taskId: string, resourceId: string, charge: number) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('taches_ressources')
        .upsert([{
          tache_id: taskId,
          ressource_id: resourceId,
          charge_h: charge
        }])

      if (error) throw error

      toast.success("Ressource assignée")
      await loadTasks()
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      toast.error("Erreur lors de l'assignation de la ressource")
      throw error
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return {
    tasks,
    loading,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    assignResource
  }
}
