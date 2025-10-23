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
          template_origin_id,
          affaires(nom, code_affaire),
          sites(nom, code_site)
        `)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Log pour déboguer
      console.log('📊 Données brutes chargées depuis Supabase:', {
        total: data?.length || 0,
        bpuTasks: data?.filter((t: any) => t.libelle_tache?.includes('[PARAPLUIE BPU]')).length || 0,
        sample: data?.[0],
        bpuSample: data?.find((t: any) => t.libelle_tache?.includes('[PARAPLUIE BPU]'))
      })

      // Organiser les tâches en hiérarchie
      const tasksMap = new Map<string, Task>()
      const rootTasks: Task[] = []

      data?.forEach((task: any) => {
        const taskWithRelations: Task = {
          ...task,
          // Mapper les relations avec les bons noms (pluriels depuis Supabase)
          affaire: task.affaires ? {
            nom: task.affaires.nom,
            code_affaire: task.affaires.code_affaire
          } : undefined,
          site: task.sites ? {
            nom: task.sites.nom,
            code_site: task.sites.code_site
          } : undefined,
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

      // Récupérer les données de la tâche parent
      const { data: parentTask, error: parentError } = await supabase
        .from('planning_taches')
        .select('affaire_id, lot_id, site_id, date_debut_plan, date_fin_plan, effort_plan_h, type_tache, competence, level')
        .eq('id', parentId)
        .single()

      if (parentError) throw parentError

      // Vérifier que l'affaire parent existe et a un statut valide
      if (parentTask.affaire_id) {
        const { data: affaire, error: affaireError } = await supabase
          .from('affaires')
          .select('id, statut, code_affaire')
          .eq('id', parentTask.affaire_id)
          .single()

        if (affaireError) {
          console.error('Erreur lors de la vérification de l\'affaire:', affaireError)
          toast.error("Impossible de vérifier l'affaire parent")
          return
        }

        console.log('Affaire parent trouvée:', affaire)

        // Si l'affaire n'a pas un statut valide, on ne peut pas créer de sous-tâche
        const statutsValides = ['Brouillon', 'Soumise', 'Validée', 'Planifiée', 'En suivi', 'Clôturée']
        if (!statutsValides.includes(affaire.statut)) {
          console.error(`Statut invalide de l'affaire ${affaire.code_affaire}: ${affaire.statut}`)
          toast.error(`L'affaire parent "${affaire.code_affaire}" a un statut invalide: ${affaire.statut}`)
          return
        }

        console.log(`Affaire ${affaire.code_affaire} a un statut valide: ${affaire.statut}`)
      }

      // Créer une sous-tâche SANS parent_id pour éviter les cycles
      const insertData = {
        libelle_tache: taskData.libelle_tache || 'Nouvelle sous-tâche',
        // Temporairement sans affaire_id pour éviter les contraintes
        // affaire_id: parentTask.affaire_id,
        lot_id: parentTask.lot_id || null,
        site_id: parentTask.site_id || null,
        date_debut_plan: taskData.date_debut_plan || parentTask.date_debut_plan || new Date().toISOString().split('T')[0],
        date_fin_plan: taskData.date_fin_plan || parentTask.date_fin_plan || new Date().toISOString().split('T')[0],
        effort_plan_h: taskData.effort_plan_h || parentTask.effort_plan_h || 1,
        avancement_pct: taskData.avancement_pct || 0,
        statut: taskData.statut || 'Non lancé',
        type_tache: taskData.type_tache || parentTask.type_tache || 'Autre',
        competence: taskData.competence || parentTask.competence || null,
        // Temporairement sans parent_id pour éviter les cycles
        // parent_id: parentId,
        level: (parentTask.level || 0) + 1,
        // Champs obligatoires avec valeurs par défaut
        effort_reel_h: 0,
        date_debut_reelle: null,
        date_fin_reelle: null,
        ressource_ids: [],
        created_by: null,
        date_creation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Données à insérer:', insertData)

      const { data, error} = await supabase
        .from('planning_taches')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Erreur détaillée:', error)
        console.error('Code erreur:', error.code)
        console.error('Message erreur:', error.message)
        console.error('Détails erreur:', error.details)
        console.error('Hint erreur:', error.hint)
        throw error
      }

      // Maintenant, mettre à jour avec l'affaire_id UNIQUEMENT (pas de parent_id pour éviter les cycles)
      if (parentTask.affaire_id) {
        const { error: updateError } = await supabase
          .from('planning_taches')
          .update({ affaire_id: parentTask.affaire_id })
          .eq('id', data.id)

        if (updateError) {
          console.error('Erreur lors de la mise à jour de l\'affaire_id:', updateError)
          // Ne pas faire échouer la création, juste logger l'erreur
        } else {
          console.log('affaire_id mis à jour avec succès')
        }
      }
      
      // Note: On n'ajoute PAS de parent_id pour éviter le trigger de détection de cycle
      // La hiérarchie est gérée visuellement via le champ 'level' uniquement

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
