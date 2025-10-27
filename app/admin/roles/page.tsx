"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import RoleFormModal from '@/components/admin/RoleFormModal'
import PermissionsMatrix from '@/components/admin/PermissionsMatrix'
import DebugRoles from '@/components/admin/DebugRoles'
import { Button } from '@/components/ui/button'
import { Shield, Users, CheckCircle, Plus, Edit, Trash2, Settings, RefreshCw } from 'lucide-react'

interface Role {
  id: string
  code: string
  label: string
  system: boolean
  seniority_rank: number
  description?: string
  created_at: string
  role_permissions?: Array<{
    permission_id: string
    permissions: {
      code: string
      label: string
    }
  }>
}

interface Permission {
  id: string
  code: string
  label: string
  created_at: string
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    console.log('🚀 [ROLES] Composant monté, début du chargement...')
    loadData()
  }, [])

         const loadData = async () => {
           try {
             setLoading(true)
             console.log('🔍 [ROLES] Début du chargement des données...')
             
             // Charger directement les rôles avec leurs permissions
             console.log('📋 [ROLES] Chargement des rôles avec permissions...')
             const { data: rolesData, error: rolesError } = await supabase
               .from('roles')
               .select(`
                 *,
                 role_permissions(
                   permission_id,
                   permissions!inner(code, label)
                 )
               `)
               .order('seniority_rank', { ascending: true })

             if (rolesError) {
               console.error('❌ [ROLES] Erreur lors du chargement des rôles:', rolesError)
               alert(`❌ Erreur rôles: ${rolesError.message}`)
               throw rolesError
             }
             
             console.log('✅ [ROLES] Rôles chargés:', rolesData?.length || 0, 'rôles')
             alert(`✅ Rôles chargés: ${rolesData?.length || 0}`)
             
             // Log détaillé de chaque rôle
             rolesData?.forEach((role: any) => {
               const permCount = role.role_permissions?.length || 0
               console.log(`📊 [ROLE] ${role.code} (${role.label}): ${permCount} permissions`)
               alert(`📊 ${role.code}: ${permCount} permissions`)
             })

             // Charger les permissions séparément
             console.log('🔐 [PERMISSIONS] Chargement des permissions...')
             const { data: permissionsData, error: permissionsError } = await supabase
               .from('permissions')
               .select('*')
               .order('code', { ascending: true })

             if (permissionsError) {
               console.error('❌ [PERMISSIONS] Erreur lors du chargement des permissions:', permissionsError)
               alert(`❌ Erreur permissions: ${permissionsError.message}`)
               throw permissionsError
             }
             
             console.log('✅ [PERMISSIONS] Permissions chargées:', permissionsData?.length || 0, 'permissions')
             alert(`✅ Permissions chargées: ${permissionsData?.length || 0}`)

             console.log('🎯 [FINAL] Données finales:')
             console.log('  - Rôles:', rolesData?.length || 0)
             console.log('  - Permissions:', permissionsData?.length || 0)
             
             setRoles(rolesData || [])
             setPermissions(permissionsData || [])
             
             console.log('✅ [ROLES] Chargement terminé avec succès')
             alert('✅ Chargement terminé avec succès')
           } catch (err) {
             console.error('❌ [ROLES] Erreur lors du chargement:', err)
             alert(`❌ Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
             setError(err instanceof Error ? err.message : 'Erreur inconnue')
           } finally {
             setLoading(false)
           }
         }

  const handleRoleCreated = () => {
    loadData() // Recharger les données après création/modification
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const handleDeleteRole = async (role: Role) => {
    if (role.system) {
      alert('Impossible de supprimer un rôle système.')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.label}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id)

      if (error) throw error

      // Mettre à jour l'état local
      setRoles(prev => prev.filter(r => r.id !== role.id))
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingRole(null)
  }

         console.log('🎨 [ROLES] Rendu du composant - loading:', loading, 'error:', error, 'roles:', roles.length)
         
         if (loading) {
           console.log('⏳ [ROLES] Affichage du loader...')
           return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                 <p className="mt-4 text-gray-600">Chargement des rôles...</p>
               </div>
             </div>
           )
         }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Erreur</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

         console.log('✅ [ROLES] Affichage de la page principale avec', roles.length, 'rôles')
         console.log('📊 [ROLES] Détail des rôles:', roles.map(r => ({
           code: r.code,
           label: r.label,
           permissions: r.role_permissions?.length || 0
         })))
         
         return (
           <div className="min-h-screen bg-gray-50">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               {/* Header */}
               <div className="mb-8">
                 <h1 className="text-3xl font-bold text-gray-900">Gestion des Rôles & Permissions</h1>
                 <p className="mt-2 text-gray-600">
                   Configurez les rôles et leurs permissions d'accès
                 </p>
               </div>

               {/* Debug Component */}
               <div className="mb-8">
                 <DebugRoles />
               </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rôles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Système</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.filter(r => r.system).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Liste des Rôles</h2>
                     <div className="flex space-x-3">
                       <Button 
                         onClick={loadData}
                         variant="outline"
                         className="border-green-200 text-green-700 hover:bg-green-50"
                       >
                         <RefreshCw className="h-4 w-4 mr-2" />
                         Recharger
                       </Button>
                       <Button 
                         onClick={() => setShowPermissions(!showPermissions)}
                         variant="outline"
                         className="border-purple-200 text-purple-700 hover:bg-purple-50"
                       >
                         <Settings className="h-4 w-4 mr-2" />
                         {showPermissions ? 'Masquer Permissions' : 'Gérer Permissions'}
                       </Button>
                       <Button 
                         onClick={() => setIsModalOpen(true)}
                         className="bg-blue-600 hover:bg-blue-700 text-white"
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Nouveau Rôle
                       </Button>
                     </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {role.code.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500">{role.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.system 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.system ? 'Système' : 'Personnalisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rang {role.seniority_rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {role.role_permissions && role.role_permissions.length > 0 ? (
                          <>
                            {role.role_permissions.slice(0, 3).map((rp: any, index: number) => (
                              <span 
                                key={index}
                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                              >
                                {rp.permissions?.label || rp.permissions?.code || 'Permission inconnue'}
                              </span>
                            ))}
                            {role.role_permissions.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                +{role.role_permissions.length - 3} autres
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">Aucune permission</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </button>
                        {!role.system && (
                          <button 
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Matrix */}
        {showPermissions && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Matrice des Permissions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configurez les accès par rôle et par page de l'application
              </p>
            </div>
            <div className="p-6">
              <PermissionsMatrix />
            </div>
          </div>
        )}

        {/* Permissions Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Permissions Disponibles</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{permission.label}</h3>
                      <p className="text-xs text-gray-500">{permission.code}</p>
                    </div>
                    <span className="text-xs text-gray-400">ID: {permission.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleRoleCreated}
          editingRole={editingRole}
        />
      </div>
    </div>
  )
}
