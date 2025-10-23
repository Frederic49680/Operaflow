"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Star, Users, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Role {
  code: string
  label: string
  seniority_rank: number
  is_special: boolean
}

interface Competency {
  code: string
  label: string
}

interface Resource {
  id: string
  nom: string
  prenom: string
  actif: boolean
}

interface ResourceRole {
  id: string
  resource_id: string
  role_code: string
  is_primary: boolean
  role?: Role
}

interface ResourceCompetency {
  id: string
  resource_id: string
  competency_code: string
  level: number
  competency?: Competency
}

export default function ResourceRolesManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [resourceRoles, setResourceRoles] = useState<ResourceRole[]>([])
  const [resourceCompetencies, setResourceCompetencies] = useState<ResourceCompetency[]>([])
  const [loading, setLoading] = useState(true)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCompetencyModal, setShowCompetencyModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedCompetency, setSelectedCompetency] = useState("")
  const [competencyLevel, setCompetencyLevel] = useState(1)
  const [isPrimary, setIsPrimary] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Charger les ressources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('ressources')
        .select('id, nom, prenom, actif')
        .order('nom')

      if (resourcesError) throw resourcesError

      // Charger les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('seniority_rank, code')

      if (rolesError) throw rolesError

      // Charger les compétences
      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies')
        .select('*')
        .order('code')

      if (competenciesError) throw competenciesError

      // Charger les rôles des ressources
      const { data: resourceRolesData, error: resourceRolesError } = await supabase
        .from('resource_roles')
        .select(`
          *,
          roles(code, label, seniority_rank, is_special)
        `)

      if (resourceRolesError) throw resourceRolesError

      // Charger les compétences des ressources
      const { data: resourceCompetenciesData, error: resourceCompetenciesError } = await supabase
        .from('resource_competencies')
        .select(`
          *,
          competencies(code, label)
        `)

      if (resourceCompetenciesError) throw resourceCompetenciesError

      setResources(resourcesData || [])
      setRoles(rolesData || [])
      setCompetencies(competenciesData || [])
      setResourceRoles(resourceRolesData || [])
      setResourceCompetencies(resourceCompetenciesData || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const addRoleToResource = async () => {
    if (!selectedResource || !selectedRole) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_roles')
        .insert({
          resource_id: selectedResource.id,
          role_code: selectedRole,
          is_primary: isPrimary
        })

      if (error) throw error

      toast.success("Rôle ajouté avec succès")
      setShowRoleModal(false)
      setSelectedResource(null)
      setSelectedRole("")
      setIsPrimary(false)
      loadData()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rôle:', error)
      toast.error("Erreur lors de l'ajout du rôle")
    }
  }

  const addCompetencyToResource = async () => {
    if (!selectedResource || !selectedCompetency) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_competencies')
        .insert({
          resource_id: selectedResource.id,
          competency_code: selectedCompetency,
          level: competencyLevel
        })

      if (error) throw error

      toast.success("Compétence ajoutée avec succès")
      setShowCompetencyModal(false)
      setSelectedResource(null)
      setSelectedCompetency("")
      setCompetencyLevel(1)
      loadData()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la compétence:', error)
      toast.error("Erreur lors de l'ajout de la compétence")
    }
  }

  const removeRoleFromResource = async (resourceRoleId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_roles')
        .delete()
        .eq('id', resourceRoleId)

      if (error) throw error

      toast.success("Rôle supprimé avec succès")
      loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error)
      toast.error("Erreur lors de la suppression du rôle")
    }
  }

  const removeCompetencyFromResource = async (resourceCompetencyId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resource_competencies')
        .delete()
        .eq('id', resourceCompetencyId)

      if (error) throw error

      toast.success("Compétence supprimée avec succès")
      loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error)
      toast.error("Erreur lors de la suppression de la compétence")
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des rôles et compétences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles & Compétences</h2>
          <p className="text-gray-600">Assignez des rôles et compétences aux collaborateurs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRoleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un rôle
          </Button>
          <Button variant="outline" onClick={() => setShowCompetencyModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une compétence
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ressources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rôles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Compétences</p>
                <p className="text-2xl font-bold">{competencies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assignations</p>
                <p className="text-2xl font-bold">{resourceRoles.length + resourceCompetencies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des ressources avec leurs rôles et compétences */}
      <div className="space-y-4">
        {resources.map((resource) => {
          const resourceRolesList = resourceRoles.filter(rr => rr.resource_id === resource.id)
          const resourceCompetenciesList = resourceCompetencies.filter(rc => rc.resource_id === resource.id)
          const primaryRole = resourceRolesList.find(rr => rr.is_primary)

          return (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {resource.prenom[0]}{resource.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{resource.prenom} {resource.nom}</h3>
                      <p className="text-sm text-gray-600">
                        {primaryRole ? `Rôle principal: ${primaryRole.role?.label}` : 'Aucun rôle principal'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedResource(resource)
                        setShowRoleModal(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Rôle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedResource(resource)
                        setShowCompetencyModal(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Compétence
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rôles */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Rôles ({resourceRolesList.length})
                    </h4>
                    <div className="space-y-2">
                      {resourceRolesList.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {role.is_primary && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            <Badge variant={role.is_primary ? "default" : "outline"}>
                              {role.role?.label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              (N{role.role?.seniority_rank})
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRoleFromResource(role.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {resourceRolesList.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Aucun rôle assigné</p>
                      )}
                    </div>
                  </div>

                  {/* Compétences */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Compétences ({resourceCompetenciesList.length})
                    </h4>
                    <div className="space-y-2">
                      {resourceCompetenciesList.map((competency) => (
                        <div key={competency.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {competency.competency?.label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Niveau {competency.level}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCompetencyFromResource(competency.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {resourceCompetenciesList.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Aucune compétence assignée</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal d'ajout de rôle */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un rôle</DialogTitle>
            <DialogDescription>
              Assignez un rôle à {selectedResource?.prenom} {selectedResource?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-select">Rôle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.label} (N{role.seniority_rank})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is-primary">Rôle principal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Annuler
            </Button>
            <Button onClick={addRoleToResource} disabled={!selectedRole}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout de compétence */}
      <Dialog open={showCompetencyModal} onOpenChange={setShowCompetencyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une compétence</DialogTitle>
            <DialogDescription>
              Assignez une compétence à {selectedResource?.prenom} {selectedResource?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="competency-select">Compétence</Label>
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
              <Label htmlFor="competency-level">Niveau (1-5)</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompetencyModal(false)}>
              Annuler
            </Button>
            <Button onClick={addCompetencyToResource} disabled={!selectedCompetency}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
