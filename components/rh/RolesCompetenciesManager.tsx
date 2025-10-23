"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Target,
  Star,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

interface Role {
  code: string
  label: string
  seniority_rank: number
  description?: string
  is_special: boolean
  actif?: boolean
}

interface Competency {
  code: string
  label: string
  description?: string
  actif?: boolean
}

interface ResourceRole {
  id: string
  resource_id: string
  role_code: string
  is_primary: boolean
  resource: {
    prenom: string
    nom: string
  }
  role: Role
}

interface ResourceCompetency {
  id: string
  resource_id: string
  competency_code: string
  level: number
  resource: {
    prenom: string
    nom: string
  }
  competency: Competency
}

export default function RolesCompetenciesManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [resourceRoles, setResourceRoles] = useState<ResourceRole[]>([])
  const [resourceCompetencies, setResourceCompetencies] = useState<ResourceCompetency[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('roles')

  // États pour les modales
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCompetencyModal, setShowCompetencyModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'role' | 'competency' | null
    item: { code: string; label: string } | null
  }>({
    isOpen: false,
    type: null,
    item: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Charger les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('seniority_rank')

      if (rolesError) throw rolesError

      // Charger les compétences
      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies')
        .select('*')
        .order('label')

      if (competenciesError) throw competenciesError

      // Charger les rôles des ressources
      const { data: resourceRolesData, error: resourceRolesError } = await supabase
        .from('resource_roles')
        .select(`
          *,
          resource:ressources(prenom, nom),
          role:roles(*)
        `)

      if (resourceRolesError) throw resourceRolesError

      // Charger les compétences des ressources
      const { data: resourceCompetenciesData, error: resourceCompetenciesError } = await supabase
        .from('resource_competencies')
        .select(`
          *,
          resource:ressources(prenom, nom),
          competency:competencies(*)
        `)

      if (resourceCompetenciesError) throw resourceCompetenciesError

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

  const handleSaveRole = async (roleData: Partial<Role>) => {
    try {
      const supabase = createClient()
      
      if (editingRole) {
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('code', editingRole.code)
        
        if (error) throw error
        toast.success("Rôle mis à jour")
      } else {
        const { error } = await supabase
          .from('roles')
          .insert(roleData)
        
        if (error) throw error
        toast.success("Rôle créé")
      }

      setShowRoleModal(false)
      setEditingRole(null)
      await loadData() // Recharger les données après sauvegarde
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const handleSaveCompetency = async (competencyData: Partial<Competency>) => {
    try {
      const supabase = createClient()
      
      if (editingCompetency) {
        const { error } = await supabase
          .from('competencies')
          .update(competencyData)
          .eq('code', editingCompetency.code)
        
        if (error) throw error
        toast.success("Compétence mise à jour")
      } else {
        const { error } = await supabase
          .from('competencies')
          .insert(competencyData)
        
        if (error) throw error
        toast.success("Compétence créée")
      }

      setShowCompetencyModal(false)
      setEditingCompetency(null)
      await loadData() // Recharger les données après sauvegarde
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const handleDeleteCompetency = (competencyCode: string, competencyLabel: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'competency',
      item: { code: competencyCode, label: competencyLabel }
    })
  }

  const confirmDeleteCompetency = async () => {
    if (!deleteModal.item) return

    try {
      const supabase = createClient()
      
      // Vérifier s'il y a des ressources qui utilisent cette compétence
      const { data: resourceCompetencies, error: checkError } = await supabase
        .from('resource_competencies')
        .select('id')
        .eq('competency_code', deleteModal.item.code)
        .limit(1)

      if (checkError) throw checkError

      if (resourceCompetencies && resourceCompetencies.length > 0) {
        toast.error("Impossible de supprimer : des ressources utilisent cette compétence")
        setDeleteModal({ isOpen: false, type: null, item: null })
        return
      }

      const { error } = await supabase
        .from('competencies')
        .delete()
        .eq('code', deleteModal.item.code)

      if (error) throw error
      toast.success("Compétence supprimée")
      await loadData()
      setDeleteModal({ isOpen: false, type: null, item: null })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression")
      setDeleteModal({ isOpen: false, type: null, item: null })
    }
  }

  const handleDeleteRole = (roleCode: string, roleLabel: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'role',
      item: { code: roleCode, label: roleLabel }
    })
  }

  const confirmDeleteRole = async () => {
    if (!deleteModal.item) return

    try {
      const supabase = createClient()
      
      // Vérifier s'il y a des ressources qui utilisent ce rôle
      const { data: resourceRoles, error: checkError } = await supabase
        .from('resource_roles')
        .select('id')
        .eq('role_code', deleteModal.item.code)
        .limit(1)

      if (checkError) throw checkError

      if (resourceRoles && resourceRoles.length > 0) {
        toast.error("Impossible de supprimer : des ressources utilisent ce rôle")
        setDeleteModal({ isOpen: false, type: null, item: null })
        return
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('code', deleteModal.item.code)

      if (error) throw error
      toast.success("Rôle supprimé")
      await loadData()
      setDeleteModal({ isOpen: false, type: null, item: null })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression")
      setDeleteModal({ isOpen: false, type: null, item: null })
    }
  }

  const handleToggleRoleStatus = async (roleCode: string, newStatus: boolean) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('roles')
        .update({ actif: newStatus })
        .eq('code', roleCode)

      if (error) throw error
      toast.success(newStatus ? "Rôle activé" : "Rôle désactivé")
      await loadData()
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  const handleToggleCompetencyStatus = async (competencyCode: string, newStatus: boolean) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('competencies')
        .update({ actif: newStatus })
        .eq('code', competencyCode)

      if (error) throw error
      toast.success(newStatus ? "Compétence activée" : "Compétence désactivée")
      await loadData()
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Rôles et Compétences</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Rôles ({roles.length})</TabsTrigger>
          <TabsTrigger value="competencies">Compétences ({competencies.length})</TabsTrigger>
          <TabsTrigger value="assignments">Affectations</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rôles</h3>
            <Button onClick={() => setShowRoleModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un rôle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.code}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{role.label}</CardTitle>
                      {role.actif === false && (
                        <Badge variant="secondary" className="text-xs">
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <Badge variant={role.is_special ? "secondary" : "default"}>
                      {role.is_special ? "Spécial" : `N${role.seniority_rank}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {role.description || "Aucune description"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRole(role)
                        setShowRoleModal(true)
                      }}
                      title="Modifier le rôle"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRoleStatus(role.code, role.actif !== true)}
                      className={role.actif === false ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"}
                      title={role.actif === false ? "Activer le rôle" : "Désactiver le rôle"}
                    >
                      {role.actif === false ? <CheckCircle className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRole(role.code, role.label)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer le rôle"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competencies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Compétences</h3>
            <Button onClick={() => setShowCompetencyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une compétence
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competencies.map((competency) => (
              <Card key={competency.code}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{competency.label}</CardTitle>
                      {competency.actif === false && (
                        <Badge variant="secondary" className="text-xs">
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{competency.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {competency.description || "Aucune description"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCompetency(competency)
                        setShowCompetencyModal(true)
                      }}
                      title="Modifier la compétence"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleCompetencyStatus(competency.code, competency.actif !== true)}
                      className={competency.actif === false ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"}
                      title={competency.actif === false ? "Activer la compétence" : "Désactiver la compétence"}
                    >
                      {competency.actif === false ? <CheckCircle className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCompetency(competency.code, competency.label)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer la compétence"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Rôles des Ressources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceRoles.map((rr) => (
                    <div key={rr.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {rr.resource.prenom} {rr.resource.nom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rr.role.label}
                          {rr.is_primary && (
                            <Badge variant="default" className="ml-2">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Compétences des Ressources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceCompetencies.map((rc) => (
                    <div key={rc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {rc.resource.prenom} {rc.resource.nom}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rc.competency.label} - Niveau {rc.level}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {rc.level}/5
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Rôle */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Modifier le rôle" : "Créer un rôle"}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? "Modifiez les informations du rôle" : "Ajoutez un nouveau rôle au système"}
            </DialogDescription>
          </DialogHeader>
          <RoleForm 
            role={editingRole}
            onSave={handleSaveRole}
            onCancel={() => {
              setShowRoleModal(false)
              setEditingRole(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Compétence */}
      <Dialog open={showCompetencyModal} onOpenChange={setShowCompetencyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompetency ? "Modifier la compétence" : "Créer une compétence"}
            </DialogTitle>
            <DialogDescription>
              {editingCompetency ? "Modifiez les informations de la compétence" : "Ajoutez une nouvelle compétence au système"}
            </DialogDescription>
          </DialogHeader>
          <CompetencyForm 
            competency={editingCompetency}
            onSave={handleSaveCompetency}
            onCancel={() => {
              setShowCompetencyModal(false)
              setEditingCompetency(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteModal({ isOpen: false, type: null, item: null })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {deleteModal.type === 'role' ? 'le rôle' : 'la compétence'} <strong>"{deleteModal.item?.label}"</strong> ?
              <br />
              <span className="text-red-600 text-sm">
                Cette action est irréversible.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={deleteModal.type === 'role' ? confirmDeleteRole : confirmDeleteCompetency}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant formulaire pour les rôles
function RoleForm({ role, onSave, onCancel }: {
  role: Role | null
  onSave: (data: Partial<Role>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    code: role?.code || '',
    label: role?.label || '',
    seniority_rank: role?.seniority_rank || 1,
    description: role?.description || '',
    is_special: role?.is_special || false,
    actif: role?.actif !== false // Par défaut actif si non spécifié
  })

  // Réinitialiser le formulaire quand le rôle change
  useEffect(() => {
    setFormData({
      code: role?.code || '',
      label: role?.label || '',
      seniority_rank: role?.seniority_rank || 1,
      description: role?.description || '',
      is_special: role?.is_special || false,
      actif: role?.actif !== false
    })
  }, [role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            required
            disabled={!!role} // Ne pas modifier le code d'un rôle existant
          />
        </div>
        <div>
          <Label htmlFor="seniority_rank">Rang hiérarchique</Label>
          <Input
            id="seniority_rank"
            type="number"
            value={formData.seniority_rank}
            onChange={(e) => setFormData({...formData, seniority_rank: parseInt(e.target.value)})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="label">Libellé</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({...formData, label: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="actif"
          checked={formData.actif}
          onChange={(e) => setFormData({...formData, actif: e.target.checked})}
          className="rounded"
        />
        <Label htmlFor="actif">Rôle actif</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {role ? "Modifier" : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Composant formulaire pour les compétences
function CompetencyForm({ competency, onSave, onCancel }: {
  competency: Competency | null
  onSave: (data: Partial<Competency>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    code: competency?.code || '',
    label: competency?.label || '',
    description: competency?.description || '',
    actif: competency?.actif !== false
  })

  // Réinitialiser le formulaire quand la compétence change
  useEffect(() => {
    setFormData({
      code: competency?.code || '',
      label: competency?.label || '',
      description: competency?.description || '',
      actif: competency?.actif !== false
    })
  }, [competency])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          required
          disabled={!!competency} // Ne pas modifier le code d'une compétence existante
        />
      </div>
      
      <div>
        <Label htmlFor="label">Libellé</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({...formData, label: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="actif"
          checked={formData.actif}
          onChange={(e) => setFormData({...formData, actif: e.target.checked})}
          className="rounded"
        />
        <Label htmlFor="actif">Compétence active</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {competency ? "Modifier" : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  )
}
