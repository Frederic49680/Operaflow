"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, UserPlus, Mail } from 'lucide-react'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingUser?: AppUser | null
}

interface AppUser {
  id: string
  email: string
  prenom?: string
  nom?: string
  active: boolean
  email_verified: boolean
  twofa_enabled: boolean
}

interface Role {
  id: string
  code: string
  label: string
}

export default function UserFormModal({ isOpen, onClose, onSuccess, editingUser }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    prenom: '',
    nom: '',
    active: true,
    twofa_enabled: false
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendEmail, setSendEmail] = useState(true)
  const [emailSent, setEmailSent] = useState(false)

  const supabase = createClient()

  // Charger les rôles au montage et initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      loadRoles()
      if (editingUser) {
        setFormData({
          email: editingUser.email,
          prenom: editingUser.prenom || '',
          nom: editingUser.nom || '',
          active: editingUser.active,
          twofa_enabled: editingUser.twofa_enabled
        })
      } else {
        setFormData({
          email: '',
          prenom: '',
          nom: '',
          active: true,
          twofa_enabled: false
        })
      }
    }
  }, [isOpen, editingUser])

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, code, label')
        .order('seniority_rank', { ascending: true })

      if (error) throw error
      setRoles(data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingUser) {
        // Mise à jour de l'utilisateur existant
        const { error: userError } = await supabase
          .from('app_users')
          .update({
            email: formData.email,
            prenom: formData.prenom,
            nom: formData.nom,
            active: formData.active,
            twofa_enabled: formData.twofa_enabled
          })
          .eq('id', editingUser.id)

        if (userError) throw userError

        // Mettre à jour les rôles
        if (selectedRoles.length > 0) {
          // Supprimer les anciens rôles
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', editingUser.id)

          // Ajouter les nouveaux rôles
          const roleAssignments = selectedRoles.map(roleId => ({
            user_id: editingUser.id,
            role_id: roleId
          }))

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleAssignments)

          if (rolesError) throw rolesError
        }
      } else {
        // Créer un nouvel utilisateur
        const { data: userData, error: userError } = await supabase
          .from('app_users')
          .insert([{
            email: formData.email,
            prenom: formData.prenom,
            nom: formData.nom,
            active: formData.active,
            twofa_enabled: formData.twofa_enabled,
            email_verified: false,
            force_pwd_change: true
          }])
          .select()

        if (userError) throw userError

        // Assigner les rôles
        if (selectedRoles.length > 0 && userData?.[0]) {
          const roleAssignments = selectedRoles.map(roleId => ({
            user_id: userData[0].id,
            role_id: roleId
          }))

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleAssignments)

          if (rolesError) throw rolesError
        }

        // Envoyer l'email d'activation si demandé
        if (sendEmail && userData?.[0]) {
          try {
            const response = await fetch('/api/email/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'activation',
                userData: {
                  email: formData.email,
                  prenom: formData.prenom,
                  nom: formData.nom
                }
              })
            })

            if (response.ok) {
              setEmailSent(true)
              console.log('✅ Email d\'activation envoyé')
            } else {
              console.warn('⚠️ Échec de l\'envoi de l\'email d\'activation')
            }
          } catch (emailError) {
            console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
          }
        }
      }

      // Réinitialiser le formulaire
      setFormData({
        email: '',
        prenom: '',
        nom: '',
        active: true,
        twofa_enabled: false
      })
      setSelectedRoles([])
      
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="utilisateur@exemple.com"
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dupont"
            />
          </div>

          {/* Rôles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôles
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Compte actif</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.twofa_enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, twofa_enabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">2FA activé</span>
            </label>

            {!editingUser && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Envoyer email d'activation
                </span>
              </label>
            )}
          </div>

          {/* Confirmation email envoyé */}
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Email d'activation envoyé avec succès !
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              {loading ? (editingUser ? 'Mise à jour...' : 'Création...') : (editingUser ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
