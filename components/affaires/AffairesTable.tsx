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
}

export function AffairesTable({ 
  searchTerm = "", 
  filterSite = "", 
  filterStatut = "",
  filterTypeContrat = "",
  showClosedAffaires = false
}: AffairesTableProps) {
  const [affaires, setAffaires] = useState<Affaire[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAffaire, setEditingAffaire] = useState<Affaire | null>(null)
  const [viewingAffaireId, setViewingAffaireId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ affaire: Affaire } | null>(null)
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
      case "Soumise":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Soumise</Badge>
      case "Validée":
        return <Badge className="bg-green-500 hover:bg-green-600">Validée</Badge>
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
              onClick={() => {
                console.log('Supprimer affaire:', confirmDelete.affaire.id)
                setToast({ type: 'error', message: `Suppression de l'affaire ${confirmDelete.affaire.code_affaire}. Cette fonctionnalité sera implémentée prochainement.` })
                setConfirmDelete(null)
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
    </>
  )
}

