"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  UserPlus,
  UserCheck
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Candidate {
  resource_id: string
  full_name: string
  primary_role: string
  competency_level: number
  score: number
  match_type: string
}

interface Task {
  id: string
  libelle_tache: string
  competence?: string
  type_tache?: string
}

interface TaskAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onAssignmentComplete?: () => void
}

export default function TaskAssignmentModal({ 
  isOpen, 
  onClose, 
  task, 
  onAssignmentComplete 
}: TaskAssignmentModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedCompetency, setSelectedCompetency] = useState("")
  const [competencyLevel, setCompetencyLevel] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [assignmentType, setAssignmentType] = useState<"confirmed" | "provisional">("confirmed")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [roles, setRoles] = useState<Array<{code: string, label: string}>>([])
  const [competencies, setCompetencies] = useState<Array<{code: string, label: string}>>([])

  const loadRolesAndCompetencies = async () => {
    try {
      const supabase = createClient()
      
      const { data: rolesData } = await supabase
        .from('roles')
        .select('code, label')
        .order('seniority_rank')

      const { data: competenciesData } = await supabase
        .from('competencies')
        .select('code, label')
        .order('code')

      setRoles(rolesData || [])
      setCompetencies(competenciesData || [])
    } catch (error) {
      console.error('Erreur lors du chargement des rôles et compétences:', error)
    }
  }

  const searchCandidates = async () => {
    if (!task || !selectedRole || !selectedCompetency) return

    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.rpc('get_task_candidates', {
        p_task_id: task.id,
        p_required_role: selectedRole,
        p_required_competency: selectedCompetency,
        p_competency_level: competencyLevel,
        p_limit: 10
      })

      if (error) throw error

      setCandidates(data || [])
    } catch (error) {
      console.error('Erreur lors de la recherche des candidats:', error)
      toast.error("Erreur lors de la recherche des candidats")
    } finally {
      setLoading(false)
    }
  }

  const assignCandidate = async () => {
    if (!task || !selectedCandidate) return

    try {
      const supabase = createClient()

      if (assignmentType === "confirmed") {
        // Affectation confirmée
        const { error } = await supabase
          .from('assignments')
          .insert({
            task_id: task.id,
            user_id: selectedCandidate.resource_id,
            role_expected: selectedRole,
            start_date: startDate,
            end_date: endDate,
            status: 'CONFIRMED',
            source: 'manual'
          })

        if (error) throw error

        toast.success("Affectation confirmée créée avec succès")
      } else {
        // Affectation provisoire
        const { error } = await supabase
          .from('provisional_assignments')
          .insert({
            task_id: task.id,
            user_id: selectedCandidate.resource_id,
            acting_as_role: selectedRole,
            user_primary_role: selectedCandidate.primary_role,
            start_date: startDate,
            end_date: endDate,
            penalty_score: selectedCandidate.score,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
          })

        if (error) throw error

        toast.success("Affectation provisoire créée avec succès")
      }

      onAssignmentComplete?.()
      onClose()
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error)
      toast.error("Erreur lors de l'affectation")
    }
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'Match direct':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Rôle naturel':
        return <Star className="h-4 w-4 text-blue-600" />
      case 'Substitution':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'Match direct':
        return 'bg-green-100 text-green-800'
      case 'Rôle naturel':
        return 'bg-blue-100 text-blue-800'
      case 'Substitution':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score === 0) return 'text-green-600'
    if (score <= 20) return 'text-blue-600'
    if (score <= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  useEffect(() => {
    if (isOpen) {
      loadRolesAndCompetencies()
      // Pré-remplir avec les données de la tâche si disponibles
      if (task?.competence) {
        setSelectedCompetency(task.competence)
      }
    }
  }, [isOpen, task])

  useEffect(() => {
    if (selectedRole && selectedCompetency) {
      searchCandidates()
    }
  }, [selectedRole, selectedCompetency, competencyLevel])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Affectation de ressource
          </DialogTitle>
          <DialogDescription>
            Assignez une ressource à la tâche "{task?.libelle_tache}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration des critères */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="role-select">Rôle requis</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="competency-select">Compétence requise</Label>
              <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((competency) => (
                    <SelectItem key={competency.code} value={competency.code}>
                      {competency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="competency-level">Niveau minimum</Label>
              <Input
                id="competency-level"
                type="number"
                min="1"
                max="5"
                value={competencyLevel}
                onChange={(e) => setCompetencyLevel(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Liste des candidats */}
          {candidates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Candidats proposés</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Rôle principal</TableHead>
                    <TableHead>Niveau compétence</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Type de match</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.resource_id}>
                      <TableCell className="font-medium">
                        {candidate.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {candidate.primary_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        Niveau {candidate.competency_level}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(candidate.score)}`}>
                          {candidate.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMatchTypeIcon(candidate.match_type)}
                          <Badge className={getMatchTypeColor(candidate.match_type)}>
                            {candidate.match_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCandidate(candidate)}
                          className={selectedCandidate?.resource_id === candidate.resource_id ? "bg-blue-50" : ""}
                        >
                          {selectedCandidate?.resource_id === candidate.resource_id ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Configuration de l'affectation */}
          {selectedCandidate && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Configuration de l'affectation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignment-type">Type d'affectation</Label>
                  <Select value={assignmentType} onValueChange={(value: "confirmed" | "provisional") => setAssignmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="provisional">Provisoire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-date">Date de début</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">Date de fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCandidate.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{selectedCandidate.full_name}</p>
                    <p className="text-sm text-gray-600">
                      Score: {selectedCandidate.score} | {selectedCandidate.match_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Recherche des candidats...</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={assignCandidate}
            disabled={!selectedCandidate || !startDate || !endDate}
          >
            Affecter la ressource
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
