"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugRoles() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions(
            permission_id,
            permissions(code, label)
          )
        `)
        .order('seniority_rank', { ascending: true })

      if (rolesError) throw rolesError

      setData(rolesData)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-800 mb-4">🐛 DEBUG - Données brutes</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Nombre de rôles:</strong> {data?.length || 0}
        </div>
        
        {data?.map((role: any, index: number) => (
          <div key={role.id} className="bg-white p-3 rounded border">
            <div className="font-semibold">{role.code} - {role.label}</div>
            <div className="text-sm text-gray-600">
              Permissions: {role.role_permissions?.length || 0}
            </div>
            {role.role_permissions && role.role_permissions.length > 0 && (
              <div className="mt-2">
                {role.role_permissions.map((rp: any, permIndex: number) => (
                  <div key={permIndex} className="text-xs bg-blue-100 px-2 py-1 rounded mr-1 mb-1 inline-block">
                    {rp.permissions?.label || rp.permissions?.code || 'N/A'}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
