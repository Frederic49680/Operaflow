"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { MoreHorizontal, Edit, Trash2, Calendar, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AbsenceFormModal } from "./AbsenceFormModal"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Absence {
  id: string
  ressource_nom: string
  ressource_prenom: string
  site?: string
  site_code?: string
  date_debut: string
  date_fin: string
  motif?: string
  statut: string
}

interface AbsencesTableProps {
  searchTerm?: string
  filterSite?: string
  filterMotif?: string
  filterStatut?: string
  showPastAbsences?: boolean
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  onAbsenceCreated?: (absenceData: any) => void
}

export function AbsencesTable({ 
  searchTerm = "", 
  filterSite = "", 
  filterMotif = "",
  filterStatut = "",
  showPastAbsences = false,
  onSuccess,
  onError,
  onAbsenceCreated
}: AbsencesTableProps) {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAbsenceId, setEditingAbsenceId] = useState<string | null>(null)
  const [deletingAbsenceId, setDeletingAbsenceId] = useState<string | null>(null)

  const loadAbsences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('absences')
        .select(`
          *,
          ressource_id:ressources!absences_ressource_id_fkey (
            nom,
            prenom
          )
        `)
        .order('date_debut', { ascending: false })

      if (error) throw error

      const formattedData = data?.map((absence: any) => ({
        id: absence.id,
        ressource_nom: absence.ressource_id?.nom || '',
        ressource_prenom: absence.ressource_id?.prenom || '',
        site: absence.site || '-',
        site_code: absence.site || '',
        date_debut: absence.date_debut,
        date_fin: absence.date_fin,
        motif: absence.motif || '',  // Lire depuis le champ 'motif'
        statut: absence.statut,
      })) || []

      setAbsences(formattedData)
    } catch (err) {
      console.error('Erreur chargement absences:', err)
      setError('Erreur lors du chargement des absences')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAbsences()
  }, [loadAbsences])

  // Rafraîchir la liste après création/modification/suppression
  useEffect(() => {
    const handleRefresh = () => {
      loadAbsences()
    }
    window.addEventListener('absence-created', handleRefresh)
    window.addEventListener('absence-updated', handleRefresh)
    window.addEventListener('absence-deleted', handleRefresh)
    return () => {
      window.removeEventListener('absence-created', handleRefresh)
      window.removeEventListener('absence-updated', handleRefresh)
      window.removeEventListener('absence-deleted', handleRefresh)
    }
  }, [loadAbsences])

  const handleEditAbsence = (absenceId: string) => {
    setEditingAbsenceId(absenceId)
  }

  const handleCloseModal = () => {
    setEditingAbsenceId(null)
  }

  const handleDeleteAbsence = async (absenceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('absences')
        .delete()
        .eq('id', absenceId)

      if (error) throw error

      if (onSuccess) onSuccess('Absence supprimée avec succès !')
      
      // Déclencher l'événement de rafraîchissement
      window.dispatchEvent(new Event('absence-deleted'))
    } catch (err: any) {
      console.error('Erreur suppression absence:', err)
      if (onError) onError(err.message || 'Erreur lors de la suppression de l\'absence')
    }
  }

  // Fonction pour filtrer les absences
  const getFilteredAbsences = useMemo(() => {
    return absences.filter(absence => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          absence.ressource_nom.toLowerCase().includes(searchLower) ||
          absence.ressource_prenom.toLowerCase().includes(searchLower) ||
          absence.motif?.toLowerCase().includes(searchLower) ||
          absence.site?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Filtre par site
      if (filterSite && absence.site_code !== filterSite) return false
      
      // Filtre par motif
      if (filterMotif && absence.motif !== filterMotif) return false
      
      // Filtre par statut
      if (filterStatut && absence.statut !== filterStatut) return false
      
      // Filtre : masquer les absences passées si non coché
      if (!showPastAbsences && absence.statut === 'passée') return false
      
      return true
    })
  }, [absences, searchTerm, filterSite, filterMotif, filterStatut, showPastAbsences])

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "à venir":
        return <Badge className="bg-blue-500 hover:bg-blue-600">À venir</Badge>
      case "en cours":
        return <Badge className="bg-orange-500 hover:bg-orange-600">En cours</Badge>
      case "passée":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Passée</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des absences...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadAbsences} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (absences.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune absence enregistrée
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par déclarer une absence
        </p>
               <AbsenceFormModal>
                 <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                   <Plus className="h-4 w-4" />
                   Déclarer une absence
                 </Button>
               </AbsenceFormModal>
      </div>
    )
  }

  return (
    <>
      {/* Modal d'édition */}
      {editingAbsenceId && (
        <AbsenceFormModal
          absenceId={editingAbsenceId}
          open={!!editingAbsenceId}
          onOpenChange={(open) => !open && handleCloseModal()}
          onSuccess={(message) => {
            if (onSuccess) onSuccess(message)
            handleCloseModal()
          }}
          onError={onError}
        />
      )}

      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
      <p className="text-sm text-slate-600">
        {getFilteredAbsences.length} absence(s) trouvée(s)
        {(searchTerm || filterSite || filterMotif || filterStatut) && (
          <span className="text-blue-600 ml-2">
            (sur {absences.length} au total)
          </span>
        )}
        {!showPastAbsences && absences.filter(a => a.statut === 'passée').length > 0 && (
          <span className="text-slate-500 ml-2">
            ({absences.filter(a => a.statut === 'passée').length} absence(s) passée(s) masquée(s))
          </span>
        )}
      </p>
    </div>
    
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Collaborateur</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">Date début</TableHead>
            <TableHead className="font-semibold text-slate-700">Date fin</TableHead>
            <TableHead className="font-semibold text-slate-700">Motif</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFilteredAbsences.map((absence) => (
            <TableRow key={absence.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">
                {absence.ressource_prenom} {absence.ressource_nom}
              </TableCell>
              <TableCell className="text-slate-600">
                {absence.site || "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {formatDate(absence.date_debut)}
              </TableCell>
              <TableCell className="text-slate-600">
                {formatDate(absence.date_fin)}
              </TableCell>
              <TableCell className="text-slate-600">
                {absence.motif || "-"}
              </TableCell>
              <TableCell>{getStatutBadge(absence.statut)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handleEditAbsence(absence.id)}
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-red-600 cursor-pointer"
                      onClick={() => handleDeleteAbsence(absence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  )
}

