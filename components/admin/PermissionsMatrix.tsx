"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw } from 'lucide-react'
import PermissionCell from './PermissionCell'

interface Role {
  id: string
  code: string
  label: string
  system: boolean
}

interface Permission {
  id: string
  code: string
  label: string
}

interface PageAccess {
  role_id: string
  route: string
  access: 'none' | 'read' | 'write'
}

// Pages de l'application
const APP_PAGES = [
  { route: '/dashboard', label: 'Dashboard', icon: '📊' },
  { route: '/affaires', label: 'Affaires', icon: '📋' },
  { route: '/planning', label: 'Planning', icon: '📅' },
  { route: '/gantt', label: 'Gantt', icon: '📈' },
  { route: '/rh/collaborateurs', label: 'Collaborateurs', icon: '👥' },
  { route: '/rh/absences', label: 'Absences', icon: '📝' },
  { route: '/rh/formations', label: 'Formations', icon: '🎓' },
  { route: '/sites', label: 'Sites', icon: '🏢' },
  { route: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { route: '/terrain/remontee', label: 'Remontées', icon: '📤' },
  { route: '/claims', label: 'Claims', icon: '⚠️' },
  { route: '/admin/users', label: 'Utilisateurs', icon: '👤' },
  { route: '/admin/roles', label: 'Rôles', icon: '🛡️' },
  { route: '/admin/access', label: 'Accès', icon: '🔐' }
]

export default function PermissionsMatrix() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([])
  const [localChanges, setLocalChanges] = useState<Map<string, 'none' | 'read' | 'write'>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('seniority_rank', { ascending: true })

      if (rolesError) throw rolesError

      // Charger les permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('code', { ascending: true })

      if (permissionsError) throw permissionsError

      // Charger les règles d'accès par page
      const { data: accessData, error: accessError } = await supabase
        .from('page_access_rules')
        .select('*')

      if (accessError) throw accessError

      setRoles(rolesData || [])
      setPermissions(permissionsData || [])
      setPageAccess(accessData || [])
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const getAccessLevel = (roleId: string, route: string): 'none' | 'read' | 'write' => {
    const cellKey = `${roleId}-${route}`
    
    // Vérifier d'abord les changements locaux
    if (localChanges.has(cellKey)) {
      return localChanges.get(cellKey)!
    }
    
    // Sinon, utiliser l'état de la base de données
    const access = pageAccess.find(a => a.role_id === roleId && a.route === route)
    return access?.access || 'none'
  }

  const updateAccess = (roleId: string, route: string, access: 'none' | 'read' | 'write') => {
    console.log(`Mise à jour locale: Role ${roleId}, Route ${route}, Access ${access}`)
    
    const cellKey = `${roleId}-${route}`
    setLocalChanges(prev => {
      const newChanges = new Map(prev)
      newChanges.set(cellKey, access)
      return newChanges
    })
  }

  const savePermissions = async () => {
    try {
      setSaving(true)
      setError(null)

      // Supprimer toutes les règles existantes
      const { error: deleteError } = await supabase
        .from('page_access_rules')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Supprimer toutes les règles

      if (deleteError) throw deleteError

      // Appliquer les changements locaux à l'état principal
      const updatedPageAccess = [...pageAccess]
      
      localChanges.forEach((access, cellKey) => {
        const [roleId, route] = cellKey.split('-', 2)
        
        // Supprimer l'entrée existante
        const filtered = updatedPageAccess.filter(a => !(a.role_id === roleId && a.route === route))
        
        // Si l'accès n'est pas 'none', ajouter la nouvelle entrée
        if (access !== 'none') {
          updatedPageAccess.splice(0, updatedPageAccess.length, ...filtered, { role_id: roleId, route, access })
        } else {
          updatedPageAccess.splice(0, updatedPageAccess.length, ...filtered)
        }
      })

      // Insérer les nouvelles règles (seulement celles qui ne sont pas 'none')
      const rulesToInsert = updatedPageAccess
        .filter(rule => rule.access !== 'none')
        .map(rule => ({
          role_id: rule.role_id,
          route: rule.route,
          access: rule.access
        }))

      if (rulesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('page_access_rules')
          .insert(rulesToInsert)

        if (insertError) throw insertError
      }

      // Mettre à jour l'état local et vider les changements
      setPageAccess(updatedPageAccess)
      setLocalChanges(new Map())
      alert('Permissions sauvegardées avec succès !')
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des permissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 font-semibold mb-2">Erreur de chargement</div>
        <p className="text-red-700">{error}</p>
        <Button onClick={loadData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton de sauvegarde */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Matrice des Permissions</h3>
          <p className="text-sm text-gray-600">
            Configurez les accès par rôle et par page. 
            <span className="text-blue-600">Aucun</span> = Pas d'accès, 
            <span className="text-green-600">Lecture</span> = Lecture seule, 
            <span className="text-purple-600">Écriture</span> = Lecture + Modification
          </p>
        </div>
        <Button 
          onClick={savePermissions}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Tableau des permissions */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Rôle
                </th>
                {APP_PAGES.map((page) => (
                  <th key={page.route} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">{page.icon}</span>
                      <span className="text-xs">{page.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {role.code.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.code}</div>
                      </div>
                    </div>
                  </td>
                  {APP_PAGES.map((page) => {
                    const currentAccess = getAccessLevel(role.id, page.route)
                    const cellKey = `${role.id}-${page.route}`
                    
                    return (
                      <PermissionCell
                        key={cellKey}
                        roleId={role.id}
                        route={page.route}
                        initialAccess={currentAccess}
                        onAccessChange={updateAccess}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Légende :</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Aucun accès</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Lecture seule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Lecture + Écriture</span>
          </div>
        </div>
      </div>
    </div>
  )
}
