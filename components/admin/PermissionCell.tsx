"use client"

import { useState, useEffect } from 'react'

interface PermissionCellProps {
  roleId: string
  route: string
  initialAccess: 'none' | 'read' | 'write'
  onAccessChange: (roleId: string, route: string, access: 'none' | 'read' | 'write') => void
}

export default function PermissionCell({ 
  roleId, 
  route, 
  initialAccess, 
  onAccessChange 
}: PermissionCellProps) {
  const [currentAccess, setCurrentAccess] = useState<'none' | 'read' | 'write'>(initialAccess)

  // Mettre à jour l'état local quand la prop change
  useEffect(() => {
    setCurrentAccess(initialAccess)
  }, [initialAccess])

  const handleAccessChange = (newAccess: 'none' | 'read' | 'write') => {
    console.log(`Cellule ${roleId}-${route}: changement de ${currentAccess} vers ${newAccess}`)
    setCurrentAccess(newAccess)
    // Ne pas appeler onAccessChange immédiatement pour éviter la propagation
    // L'état sera synchronisé lors de la sauvegarde
  }

  return (
    <td className="px-3 py-3 text-center">
      <div className="flex justify-center space-x-1">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAccessChange('none')
          }}
          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
            currentAccess === 'none'
              ? 'bg-red-100 text-red-800 border-2 border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
          }`}
          title="Aucun accès"
        >
          ✗
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAccessChange('read')
          }}
          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
            currentAccess === 'read'
              ? 'bg-green-100 text-green-800 border-2 border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
          }`}
          title="Lecture seule"
        >
          👁
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAccessChange('write')
          }}
          className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
            currentAccess === 'write'
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
              : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
          }`}
          title="Lecture + Écriture"
        >
          ✏
        </button>
      </div>
    </td>
  )
}
