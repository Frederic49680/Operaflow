"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Shield, Plus } from 'lucide-react'

interface RoleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingRole?: Role | null
}

interface Role {
  id: string
  code: string
  label: string
  system: boolean
  seniority_rank: number
  description?: string
}

export default function RoleFormModal({ isOpen, onClose, onSuccess, editingRole }: RoleFormModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    description: '',
    seniority_rank: 99
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        setFormData({
          code: editingRole.code,
          label: editingRole.label,
          description: editingRole.description || '',
          seniority_rank: editingRole.seniority_rank
        })
      } else {
        setFormData({
          code: '',
          label: '',
          description: '',
          seniority_rank: 99
        })
      }
      setError(null)
    }
  }, [isOpen, editingRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.code || !formData.label) {
      setError('Le code et le label sont obligatoires.')
      setLoading(false)
      return
    }

    try {
      if (editingRole) {
        // Mise à jour du rôle existant
        const { error } = await supabase
          .from('roles')
          .update({
            code: formData.code,
            label: formData.label,
            description: formData.description || null,
            seniority_rank: formData.seniority_rank
          })
          .eq('id', editingRole.id)

        if (error) throw error
      } else {
        // Création d'un nouveau rôle
        const { error } = await supabase
          .from('roles')
          .insert([{
            code: formData.code,
            label: formData.label,
            description: formData.description || null,
            seniority_rank: formData.seniority_rank,
            system: false // Les nouveaux rôles sont toujours personnalisés
          }])

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {editingRole ? <Shield className="h-4 w-4 text-blue-600" /> : <Plus className="h-4 w-4 text-blue-600" />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="ex: admin, user, manager"
            />
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="label"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              placeholder="ex: Administrateur, Utilisateur, Manager"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du rôle..."
            />
          </div>

          <div>
            <label htmlFor="seniority_rank" className="block text-sm font-medium text-gray-700">
              Rang de Séniorité
            </label>
            <input
              type="number"
              id="seniority_rank"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.seniority_rank}
              onChange={(e) => setFormData({ ...formData, seniority_rank: parseInt(e.target.value) || 99 })}
              min="0"
              max="99"
            />
            <p className="mt-1 text-xs text-gray-500">Plus le nombre est bas, plus le rôle est élevé (0 = plus élevé)</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (editingRole ? 'Mise à jour...' : 'Création...') : (editingRole ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
