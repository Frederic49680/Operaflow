"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye, X, Calendar } from "lucide-react"
import { Loader2 } from "lucide-react"
import { SessionFormModal } from "./SessionFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Session {
  id: string
  formation_id: string
  formation?: {
    code: string
    libelle: string
  }
  organisme_id: string
  organisme?: {
    nom: string
  }
  site_id?: string
  site?: {
    nom: string
  }
  lieu?: string
  date_debut?: string
  date_fin?: string
  capacite?: number
  cout_session_ht?: number
  statut: string
}

interface SessionsTableProps {
  searchTerm?: string
  filterStatut?: string
  filterFormation?: string
}

export function SessionsTable({ 
  searchTerm = "", 
  filterStatut = "",
  filterFormation = ""
}: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [viewingSession, setViewingSession] = useState<Session | null>(null)
  const [deactivatingSession, setDeactivatingSession] = useState<Session | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadSessions()
    window.addEventListener('session-created', loadSessions)
    return () => window.removeEventListener('session-created', loadSessions)
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('formations_sessions')
        .select(`
          *,
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom),
          site:site_id(nom)
        `)
        .order('date_debut', { ascending: false })
      
      if (error) throw error
      console.log('Sessions chargées:', data)
      console.log('Nombre de sessions:', data?.length || 0)
      setSessions(data || [])
    } catch (err: any) {
      console.error('Erreur chargement sessions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingSession) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('formations_sessions')
        .update({ statut: 'Annulée' })
        .eq('id', deactivatingSession.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `La session "${deactivatingSession.formation?.libelle}" a été annulée avec succès.` 
      })
      
      // Recharger la liste
      await loadSessions()
      window.dispatchEvent(new Event('session-created'))
      setDeactivatingSession(null)
    } catch (err: any) {
      console.error('Erreur annulation session:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de l'annulation : ${err.message}` 
      })
    }
  }

  const getFilteredSessions = () => {
    return sessions.filter(session => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!(
          session.formation?.libelle?.toLowerCase().includes(searchLower) ||
          session.formation?.code?.toLowerCase().includes(searchLower) ||
          session.organisme?.nom?.toLowerCase().includes(searchLower) ||
          session.lieu?.toLowerCase().includes(searchLower)
        )) return false
      }
      
      // Filtre par statut
      if (filterStatut && session.statut !== filterStatut) return false
      
      // Filtre par formation
      if (filterFormation && session.formation_id !== filterFormation) return false
      
      return true
    })
  }

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'Ouverte': 'bg-green-100 text-green-800',
      'Fermée': 'bg-orange-100 text-orange-800',
      'Réalisée': 'bg-purple-100 text-purple-800',
      'Annulée': 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[statut] || 'bg-slate-100 text-slate-800'}>
        {statut}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredSessions().length} session(s) trouvée(s)
          {(searchTerm || filterStatut || filterFormation) && (
            <span className="text-blue-600 ml-2">
              (sur {sessions.length} au total)
            </span>
          )}
        </p>
      </div>

      {getFilteredSessions().length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-2 font-medium">
            {sessions.length === 0 ? 'Aucune session créée' : 'Aucun résultat trouvé'}
          </p>
          <p className="text-sm text-slate-500">
            {sessions.length === 0 
              ? 'Cliquez sur "Nouvelle session" pour commencer' 
              : 'Essayez de modifier vos filtres de recherche'}
          </p>
        </div>
      )}

      {getFilteredSessions().length > 0 && (
        <div className="rounded-md border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Formation</TableHead>
                <TableHead className="font-semibold text-slate-700">Organisme</TableHead>
                <TableHead className="font-semibold text-slate-700">Lieu</TableHead>
                <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                <TableHead className="font-semibold text-slate-700">Capacité</TableHead>
                <TableHead className="font-semibold text-slate-700">Coût</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredSessions().map((session) => (
                <TableRow key={session.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-mono text-xs text-blue-600">{session.formation?.code}</div>
                      <div>{session.formation?.libelle}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {session.organisme?.nom || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {session.lieu || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {session.date_debut && session.date_fin ? (
                      <div className="text-sm">
                        {new Date(session.date_debut).toLocaleDateString('fr-FR')} - {new Date(session.date_fin).toLocaleDateString('fr-FR')}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {session.capacite || '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {session.cout_session_ht 
                      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(session.cout_session_ht)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatutBadge(session.statut)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => setViewingSession(session)}
                        >
                          <Eye className="h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => setEditingSession(session)}
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-600 cursor-pointer"
                          onClick={() => setDeactivatingSession(session)}
                          disabled={session.statut === 'Annulée'}
                        >
                          <Trash2 className="h-4 w-4" />
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      {editingSession && (
        <SessionFormModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSuccess={() => {
            loadSessions()
            setEditingSession(null)
          }}
        />
      )}

      {/* Modal Voir détails */}
      {viewingSession && (
        <Dialog open={!!viewingSession} onOpenChange={() => setViewingSession(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Détails de la session</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingSession(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Informations complètes de la session de formation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Informations générales */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Formation</p>
                    <p className="text-slate-900">{viewingSession.formation?.libelle}</p>
                    <p className="text-xs font-mono text-slate-500">{viewingSession.formation?.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Organisme</p>
                    <p className="text-slate-900">{viewingSession.organisme?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Site</p>
                    <p className="text-slate-900">{viewingSession.site?.nom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Lieu</p>
                    <p className="text-slate-900">{viewingSession.lieu || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Statut</p>
                    {getStatutBadge(viewingSession.statut)}
                  </div>
                </div>
              </div>

              {/* Dates et capacité */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Dates et capacité
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date de début</p>
                    <p className="text-slate-900">
                      {viewingSession.date_debut ? new Date(viewingSession.date_debut).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date de fin</p>
                    <p className="text-slate-900">
                      {viewingSession.date_fin ? new Date(viewingSession.date_fin).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Capacité</p>
                    <p className="text-slate-900">{viewingSession.capacite || '-'} personnes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Coût session (HT)</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {viewingSession.cout_session_ht 
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingSession.cout_session_ht)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Confirmation annulation */}
      {deactivatingSession && (
        <Dialog open={!!deactivatingSession} onOpenChange={() => setDeactivatingSession(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Annuler la session
              </DialogTitle>
              <DialogDescription>
                Cette action annulera la session
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">
                Êtes-vous sûr de vouloir annuler la session de <strong>{deactivatingSession.formation?.libelle}</strong> ?
              </p>
              <p className="text-sm text-slate-600">
                La session sera marquée comme annulée et ne pourra plus être utilisée.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivatingSession(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeactivate}
                >
                  Confirmer l'annulation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Toast notifications */}
      {toast && (
        <>
          {toast.type === 'success' ? (
            <SuccessToast 
              message={toast.message}
              onClose={() => setToast(null)}
            />
          ) : (
            <ErrorToast 
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
    </>
  )
}

