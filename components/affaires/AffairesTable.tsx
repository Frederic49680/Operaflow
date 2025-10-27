"use client"

import { useState, useEffect } from "react"
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
import { Edit, Trash2, FileText, Eye, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AffaireFormModal } from "./AffaireFormModal"
import { AffaireDetailModal } from "./AffaireDetailModal"
import { Plus } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { ErrorToast } from "@/components/ui/error-toast"
import DeleteConfirmationModal from "./DeleteConfirmationModal"

interface Affaire {
  id: string
  code_affaire: string
  nom: string
  nom_client: string
  site_nom: string
  responsable_nom: string
  responsable_prenom: string
  num_commande?: string
  type_contrat: string
  type_affaire?: string
  montant_total_ht: number
  statut: string
  avancement_pct: number
  date_fin_prevue?: string
}

interface AffairesTableProps {
  searchTerm?: string
  filterSite?: string
  filterStatut?: string
  filterTypeContrat?: string
  showClosedAffaires?: boolean
  onRefresh?: () => void
}

export function AffairesTable({ 
  searchTerm = "", 
  filterSite = "", 
  filterStatut = "",
  filterTypeContrat = "",
  showClosedAffaires = false,
  onRefresh
}: AffairesTableProps) {
  const [affaires, setAffaires] = useState<Affaire[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAffaire, setEditingAffaire] = useState<Affaire | null>(null)
  const [viewingAffaireId, setViewingAffaireId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ affaire: Affaire } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    affaire: Affaire | null
    tasksCount: number
    lotsCount: number
    isLoading: boolean
  }>({
    isOpen: false,
    affaire: null,
    tasksCount: 0,
    lotsCount: 0,
    isLoading: false
  })
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    loadAffaires()
  }, [])

  const loadAffaires = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('affaires')
        .select(`
          id,
          code_affaire,
          nom,
          num_commande,
          type_contrat,
          type_affaire,
          montant_total_ht,
          statut,
          avancement_pct,
          date_fin_prevue,
          sites:site_id (
            nom
          ),
          clients:client_id (
            nom_client
          ),
          ressources:responsable_id (
            nom,
            prenom
          )
        `)
        .order('date_creation', { ascending: false })

      if (error) throw error

      const formattedData = data?.map((affaire: any) => ({
        id: affaire.id,
        code_affaire: affaire.code_affaire,
        nom: affaire.nom || affaire.code_affaire,
        nom_client: affaire.clients?.nom_client || 'N/A',
        site_nom: affaire.sites?.nom || 'N/A',
        responsable_nom: affaire.ressources?.nom || 'N/A',
        responsable_prenom: affaire.ressources?.prenom || '',
        num_commande: affaire.num_commande,
        type_contrat: affaire.type_contrat,
        type_affaire: affaire.type_affaire,
        montant_total_ht: affaire.montant_total_ht || 0,
        statut: affaire.statut,
        avancement_pct: affaire.avancement_pct || 0,
        date_fin_prevue: affaire.date_fin_prevue,
      })) || []

      setAffaires(formattedData)
    } catch (err) {
      console.error('Erreur chargement affaires:', err)
      setError('Erreur lors du chargement des affaires')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteModal.affaire) return

    setDeleteModal(prev => ({ ...prev, isLoading: true }))

    try {
      const supabase = createClient()
      const affaireId = deleteModal.affaire.id

      // Utiliser la fonction de suppression directe
      await deleteAffaireDirect(affaireId)
      
      setToast({ type: 'success', message: `Affaire ${deleteModal.affaire.code_affaire} supprimée avec succès` })
      setDeleteModal({ isOpen: false, affaire: null, tasksCount: 0, lotsCount: 0, isLoading: false })
      
      // Refresh complet
      await loadAffaires()
      onRefresh?.()
      
      // Déclencher un événement global
      window.dispatchEvent(new CustomEvent('affaire-deleted', { 
        detail: { affaireId: deleteModal.affaire.id } 
      }))
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setToast({ type: 'error', message: `Erreur lors de la suppression de l'affaire ${deleteModal.affaire.code_affaire}` })
      setDeleteModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  const deleteAffaireDirect = async (affaireId: string) => {
    const supabase = createClient()
    
    // Utiliser la fonction SQL de suppression en cascade
    const { data, error } = await supabase.rpc('delete_affaire_cascade', {
      affaire_uuid: affaireId
    })

    if (error) {
      console.error('Erreur lors de la suppression en cascade:', error)
      throw error
    }

    console.log(`🗑️ Suppression en cascade réussie pour l'affaire ${affaireId}`)
    return true
  }

  const deleteAffaire = async (affaireId: string) => {
    const supabase = createClient()
    
    // Récupérer les informations de l'affaire
    const { data: affaire, error: affaireError } = await supabase
      .from('affaires')
      .select('id, code_affaire, nom, statut')
      .eq('id', affaireId)
      .single()

    if (affaireError) throw affaireError

    // Créer un objet Affaire minimal pour la modal
    const affaireForModal: Affaire = {
      id: affaire.id,
      code_affaire: affaire.code_affaire,
      nom: affaire.nom,
      statut: affaire.statut,
      nom_client: '', // Pas nécessaire pour la modal
      site_nom: '', // Pas nécessaire pour la modal
      responsable_nom: '', // Pas nécessaire pour la modal
      responsable_prenom: '', // Pas nécessaire pour la modal
      type_contrat: 'Forfait',
      montant_total_ht: 0,
      avancement_pct: 0
    }

    // Vérifier s'il y a des tâches liées
    const { data: tasks, error: tasksError } = await supabase
      .from('planning_taches')
      .select('id, libelle_tache')
      .eq('affaire_id', affaireId)

    if (tasksError) throw tasksError

    // Si l'affaire est planifiée (statut = 'Planifiée'), supprimer aussi les tâches
    // Pour les autres statuts (Brouillon, A_planifier, etc.), empêcher la suppression si des tâches existent
    if (affaire.statut === 'Planifiée') {
      if (tasks && tasks.length > 0) {
        console.log(`🗑️ Suppression des ${tasks.length} tâches liées à l'affaire ${affaire.code_affaire}`)
        
        // Supprimer toutes les tâches liées
        const { error: deleteTasksError } = await supabase
          .from('planning_taches')
          .delete()
          .eq('affaire_id', affaireId)

        if (deleteTasksError) throw deleteTasksError
      }
    }

    // Vérifier s'il y a des lots financiers
    const { data: lots, error: lotsError } = await supabase
      .from('affaires_lots_financiers')
      .select('id')
      .eq('affaire_id', affaireId)
      .limit(1)

    if (lotsError) throw lotsError

    // Si des dépendances existent, ouvrir la modal de confirmation
    if ((tasks && tasks.length > 0) || (lots && lots.length > 0)) {
      setDeleteModal({
        isOpen: true,
        affaire: affaireForModal,
        tasksCount: tasks?.length || 0,
        lotsCount: lots?.length || 0,
        isLoading: false
      })
      return // Sortir de la fonction, la suppression sera gérée par la modal
    }

    // Supprimer l'affaire (sans dépendances)
    await deleteAffaireDirect(affaireId)
    console.log(`✅ Affaire ${affaire.code_affaire} supprimée avec succès`)
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadAffaires()
    }
    window.addEventListener('affaire-created', handleRefresh)
    return () => window.removeEventListener('affaire-created', handleRefresh)
  }, [])

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Brouillon":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Brouillon</Badge>
      case "A_planifier":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">À planifier</Badge>
      case "Planifiée":
        return <Badge className="bg-green-500 hover:bg-green-600">Planifiée</Badge>
      case "Clôturée":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Clôturée</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  const getContratBadge = (contrat: string) => {
    switch (contrat) {
      case "Forfait":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Forfait</Badge>
      case "Régie":
        return <Badge variant="outline" className="border-green-500 text-green-700">Régie</Badge>
      default:
        return <Badge variant="outline">{contrat}</Badge>
    }
  }

  // Fonction pour filtrer les affaires
  const getFilteredAffaires = () => {
    return affaires.filter(affaire => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          affaire.code_affaire.toLowerCase().includes(searchLower) ||
          affaire.nom.toLowerCase().includes(searchLower) ||
          affaire.nom_client.toLowerCase().includes(searchLower) ||
          affaire.num_commande?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Filtre par site
      if (filterSite && affaire.site_nom !== filterSite) return false
      
      // Filtre par statut
      if (filterStatut && affaire.statut !== filterStatut) return false
      
      // Filtre par type de contrat
      if (filterTypeContrat && affaire.type_contrat !== filterTypeContrat) return false
      
      // Filtre : masquer les affaires clôturées si non coché
      if (!showClosedAffaires && affaire.statut === 'Clôturée') return false
      
      return true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des affaires...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadAffaires} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (affaires.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune affaire pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par créer votre première affaire
        </p>
        <AffaireFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Créer une affaire
          </Button>
        </AffaireFormModal>
      </div>
    )
  }

  return (
    <>
      {/* Modal de visualisation */}
      {viewingAffaireId && (
        <AffaireDetailModal 
          affaireId={viewingAffaireId}
          onClose={() => setViewingAffaireId(null)}
        />
      )}

      {/* Modal d'édition */}
      {editingAffaire && (
        <AffaireFormModal 
          affaireId={editingAffaire.id}
          onClose={() => setEditingAffaire(null)}
        >
          <div style={{ display: 'none' }} />
        </AffaireFormModal>
      )}

      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredAffaires().length} affaire(s) trouvée(s)
          {(searchTerm || filterSite || filterStatut || filterTypeContrat) && (
            <span className="text-blue-600 ml-2">
              (sur {affaires.length} au total)
            </span>
          )}
          {!showClosedAffaires && affaires.filter(a => a.statut === 'Clôturée').length > 0 && (
            <span className="text-slate-500 ml-2">
              ({affaires.filter(a => a.statut === 'Clôturée').length} affaire(s) clôturée(s) masquée(s))
            </span>
          )}
        </p>
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Code</TableHead>
            <TableHead className="font-semibold text-slate-700">Nom</TableHead>
            <TableHead className="font-semibold text-slate-700">Client</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">Responsable</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Montant HT</TableHead>
            <TableHead className="font-semibold text-slate-700">Avancement</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFilteredAffaires().map((affaire) => (
            <TableRow 
              key={affaire.id} 
              className="hover:bg-slate-50/50 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
                setOpenDropdownId(openDropdownId === affaire.id ? null : affaire.id)
              }}
            >
              <TableCell className="font-mono font-semibold text-blue-600">
                {affaire.code_affaire}
              </TableCell>
              <TableCell className="font-medium">
                {affaire.nom}
              </TableCell>
              <TableCell className="font-medium">{affaire.nom_client}</TableCell>
              <TableCell className="text-slate-600">{affaire.site_nom}</TableCell>
              <TableCell className="text-slate-600">
                {affaire.responsable_prenom} {affaire.responsable_nom}
              </TableCell>
              <TableCell>
                {affaire.type_affaire === 'BPU' ? (
                  <Badge className="bg-blue-600">BPU</Badge>
                ) : (
                  getContratBadge(affaire.type_contrat)
                )}
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(affaire.montant_total_ht)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${affaire.avancement_pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {affaire.avancement_pct}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatutBadge(affaire.statut)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Menu d'actions invisible */}
      {affaires.map((affaire) => (
        <DropdownMenu 
          key={`menu-${affaire.id}`}
          open={openDropdownId === affaire.id} 
          onOpenChange={(open) => setOpenDropdownId(open ? affaire.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <div className="hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48"
            style={{
              position: 'fixed',
              left: menuPosition?.x ? `${menuPosition.x}px` : 'auto',
              top: menuPosition?.y ? `${menuPosition.y}px` : 'auto',
            }}
          >
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => {
                setViewingAffaireId(affaire.id)
                setOpenDropdownId(null)
              }}
            >
              <Eye className="h-4 w-4" />
              Voir le détail
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => {
                setEditingAffaire(affaire)
                setOpenDropdownId(null)
              }}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-red-600 cursor-pointer"
              onClick={() => {
                setConfirmDelete({ affaire })
                setOpenDropdownId(null)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>

    {/* Toast notifications */}
    {toast && (
      <ErrorToast 
        message={toast.message}
        onClose={() => setToast(null)}
      />
    )}

    {/* Modal de confirmation de suppression */}
    {confirmDelete && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-slate-600">
                Êtes-vous sûr de vouloir supprimer l'affaire <span className="font-semibold text-slate-900">{confirmDelete.affaire.code_affaire}</span> ?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Cette action est irréversible.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="gap-2"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteAffaire(confirmDelete.affaire.id)
                  setToast({ type: 'success', message: `Affaire ${confirmDelete.affaire.code_affaire} supprimée avec succès` })
                  setConfirmDelete(null)
                  
                  // Refresh complet
                  await loadAffaires() // Recharger la liste des affaires
                  onRefresh?.() // Déclencher le refresh parent (stats, etc.)
                  
                  // Déclencher un événement global pour notifier les autres composants
                  window.dispatchEvent(new CustomEvent('affaire-deleted', { 
                    detail: { affaireId: confirmDelete.affaire.id } 
                  }))
                  
                } catch (error) {
                  console.error('Erreur lors de la suppression:', error)
                  
                  // Messages d'erreur plus spécifiques
                  let errorMessage = `Erreur lors de la suppression de l'affaire ${confirmDelete.affaire.code_affaire}`
                  
                  if (error instanceof Error) {
                    if (error.message.includes('annulée par l\'utilisateur')) {
                      // Ne pas afficher de toast pour les annulations
                      setConfirmDelete(null)
                      return
                    } else if (error.message.includes('tâches planifiées')) {
                      errorMessage = `Impossible de supprimer l'affaire ${confirmDelete.affaire.code_affaire} : elle contient des tâches planifiées`
                    } else if (error.message.includes('lots financiers')) {
                      errorMessage = `Impossible de supprimer l'affaire ${confirmDelete.affaire.code_affaire} : elle contient des lots financiers`
                    } else {
                      errorMessage = `Erreur lors de la suppression : ${error.message}`
                    }
                  }
                  
                  setToast({ type: 'error', message: errorMessage })
                }
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmation de suppression */}
    {deleteModal.affaire && (
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, affaire: null, tasksCount: 0, lotsCount: 0, isLoading: false })}
        onConfirm={handleDeleteConfirmed}
        affaire={deleteModal.affaire}
        tasksCount={deleteModal.tasksCount}
        lotsCount={deleteModal.lotsCount}
        isLoading={deleteModal.isLoading}
      />
    )}
    </>
  )
}

