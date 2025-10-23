"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Target
} from "lucide-react"
import { toast } from "sonner"

interface ProvisionalAssignment {
  id: string
  task_id: string
  user_id: string
  acting_as_role: string
  user_primary_role: string
  start_date: string
  end_date: string
  penalty_score: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  expires_at: string
  requested_by: string
  approved_by?: string
  task: {
    libelle_tache: string
    affaire: {
      nom: string
    }
  }
  user: {
    prenom: string
    nom: string
  }
  substitution_rule?: {
    description: string
    max_days: number
  }
}

export default function ProvisionalAssignmentsManager() {
  const [assignments, setAssignments] = useState<ProvisionalAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadAssignments()
  }, [filter])

  const loadAssignments = async () => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('provisional_assignments')
        .select(`
          *,
          task:planning_taches!inner(
            libelle_tache,
            affaire:affaires(nom)
          ),
          user:ressources!inner(prenom, nom),
          substitution_rule:substitution_rules(description, max_days)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter.toUpperCase())
      }

      const { data, error } = await query

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error("Erreur lors du chargement des affectations")
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (assignmentId: string, approved: boolean) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('provisional_assignments')
        .update({
          status: approved ? 'APPROVED' : 'REJECTED',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', assignmentId)

      if (error) throw error

      // Si approuvé, créer l'affectation confirmée
      if (approved) {
        const assignment = assignments.find(a => a.id === assignmentId)
        if (assignment) {
          const { error: insertError } = await supabase
            .from('assignments')
            .insert({
              task_id: assignment.task_id,
              user_id: assignment.user_id,
              role_expected: assignment.acting_as_role,
              start_date: assignment.start_date,
              end_date: assignment.end_date,
              source: 'auto'
            })

          if (insertError) throw insertError
        }
      }

      toast.success(approved ? "Affectation approuvée" : "Affectation rejetée")
      loadAssignments()
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      toast.error("Erreur lors de la validation")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />
      case 'EXPIRED': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'PENDING': 'default',
      'APPROVED': 'default',
      'REJECTED': 'destructive',
      'EXPIRED': 'secondary'
    } as const

    const labels = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvée',
      'REJECTED': 'Rejetée',
      'EXPIRED': 'Expirée'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Affectations Provisoires</h2>
        <Button onClick={loadAssignments} variant="outline">
          Actualiser
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({assignments.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({assignments.filter(a => a.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="approved">Approuvées ({assignments.filter(a => a.status === 'APPROVED').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées ({assignments.filter(a => a.status === 'REJECTED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune affectation provisoire trouvée
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(assignment.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.task.libelle_tache}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {assignment.task.affaire.nom}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {assignment.user.prenom} {assignment.user.nom}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rôle principal: {assignment.user_primary_role}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Agit comme: {assignment.acting_as_role}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(assignment.start_date).toLocaleDateString()} - {new Date(assignment.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score de pénalité: {assignment.penalty_score}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {assignment.substitution_rule && (
                        <div className="text-sm">
                          <div className="font-medium">Règle de substitution:</div>
                          <div className="text-muted-foreground">
                            {assignment.substitution_rule.description}
                          </div>
                          <div className="text-muted-foreground">
                            Max {assignment.substitution_rule.max_days} jours
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {assignment.status === 'PENDING' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(assignment.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(assignment.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
