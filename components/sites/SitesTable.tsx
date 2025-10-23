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
import { MoreHorizontal, Edit, Trash2, Building2, Plus, Loader2, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SiteFormModal } from "./SiteFormModal"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Site {
  id: string
  code_site: string
  nom: string
  responsable?: string
  statut: "Actif" | "En pause" | "Fermé"
  nb_collaborateurs?: number
  nb_affaires?: number
}

interface SitesTableProps {
  searchTerm?: string
  showClosedSites?: boolean
}

export function SitesTable({ searchTerm = "", showClosedSites = false }: SitesTableProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [siteToClose, setSiteToClose] = useState<{ id: string, nom: string } | null>(null)
  const [closingSite, setClosingSite] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusSiteId, setStatusSiteId] = useState<string | null>(null)
  const [siteToDelete, setSiteToDelete] = useState<{ id: string, nom: string } | null>(null)
  const [deletingSite, setDeletingSite] = useState(false)

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Charger les sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, code_site, nom, statut, responsable_id, remplaçant_id')
        .order('nom')

      if (sitesError) throw sitesError

      // Charger tous les responsables
      const { data: ressourcesData, error: ressourcesError } = await supabase
        .from('ressources')
        .select('id, nom, prenom')
        .eq('actif', true)

      if (ressourcesError) throw ressourcesError

      // Créer un map pour accès rapide aux responsables
      const ressourcesMap = new Map(
        (ressourcesData || []).map(r => [r.id, r])
      )

      // Charger les statistiques pour chaque site
      const formattedData = await Promise.all(
        (sitesData || []).map(async (site: any) => {
          // Trouver le responsable
          const responsableData = site.responsable_id ? ressourcesMap.get(site.responsable_id) : null
          const responsable = responsableData
            ? `${responsableData.prenom || ''} ${responsableData.nom || ''}`.trim()
            : 'N/A'
          
          // Compter les collaborateurs actifs du site
          const { count: nb_collaborateurs } = await supabase
            .from('ressources')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id)
            .eq('actif', true)
          
          // Compter les affaires actives du site
          const { count: nb_affaires } = await supabase
            .from('affaires')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', site.id)
            .in('statut', ['Soumise', 'Validée'])
          
          return {
            id: site.id,
            code_site: site.code_site,
            nom: site.nom,
            responsable,
            statut: site.statut,
            nb_collaborateurs: nb_collaborateurs || 0,
            nb_affaires: nb_affaires || 0,
          }
        })
      )

      setSites(formattedData)
    } catch (err) {
      console.error('Erreur chargement sites:', err)
      setError('Erreur lors du chargement des sites')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création ou modification
  useEffect(() => {
    const handleRefresh = () => {
      loadSites()
    }
    window.addEventListener('site-created', handleRefresh)
    return () => window.removeEventListener('site-created', handleRefresh)
  }, [])

  const handleEditSite = (siteId: string) => {
    setEditingSiteId(siteId)
  }

  const handleCloseModal = () => {
    setEditingSiteId(null)
  }

  const handleDeleteSite = async (siteId: string, siteNom: string) => {
    // Ouvrir directement le modal de confirmation de suppression
    setSiteToDelete({ id: siteId, nom: siteNom })
  }

  const confirmDeleteSite = async () => {
    if (!siteToDelete) return

    try {
      setDeletingSite(true)
      const supabase = createClient()
      
      // Essayer d'abord la fonction RPC de suppression en cascade
      try {
        const { data, error } = await supabase
          .rpc('delete_site_cascade', { site_id_to_delete: siteToDelete.id })
        
        if (error) throw error
        
        // Vérifier le résultat de la fonction
        if (data && data.success) {
          setToast({ 
            type: 'success', 
            message: data.message || `Site "${siteToDelete.nom}" supprimé avec succès !` 
          })
          
          // Recharger la liste des sites
          await loadSites()
          
          // Fermer le modal
          setSiteToDelete(null)
          return
        } else {
          throw new Error(data?.message || 'Erreur lors de la suppression')
        }
      } catch (rpcError) {
        // Si la fonction RPC n'existe pas ou échoue, essayer la suppression directe
        console.warn('Fonction RPC non disponible, tentative de suppression directe:', rpcError)
        
        const { error } = await supabase
          .from('sites')
          .delete()
          .eq('id', siteToDelete.id)
        
        if (error) {
          if (error.code === '23503') {
            throw new Error('Impossible de supprimer ce site car il contient des données liées. Veuillez d\'abord supprimer toutes les tâches, affaires et ressources associées.')
          }
          throw error
        }
        
        setToast({ 
          type: 'success', 
          message: `Site "${siteToDelete.nom}" supprimé avec succès !` 
        })
        
        // Recharger la liste des sites
        await loadSites()
        
        // Fermer le modal
        setSiteToDelete(null)
      }
    } catch (err) {
      console.error('Erreur suppression site:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la suppression du site "${siteToDelete.nom}": ${err instanceof Error ? err.message : 'Erreur inconnue'}` 
      })
    } finally {
      setDeletingSite(false)
    }
  }

  const confirmCloseSite = async () => {
    if (!siteToClose) return

    try {
      setClosingSite(true)
      const supabase = createClient()

      // Mettre à jour le statut du site
      const { error } = await supabase
        .from('sites')
        .update({ statut: 'Fermé' })
        .eq('id', siteToClose.id)

      if (error) throw error

      // Rafraîchir la liste
      loadSites()
      
      // Déclencher l'événement de rafraîchissement
      window.dispatchEvent(new Event('site-created'))
      
      setToast({ type: 'success', message: `Le site "${siteToClose.nom}" a été fermé avec succès.` })
      
      // Fermer le modal
      setSiteToClose(null)
    } catch (err) {
      console.error('Erreur fermeture site:', err)
      setToast({ type: 'error', message: 'Erreur lors de la fermeture du site' })
    } finally {
      setClosingSite(false)
    }
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "Actif":
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>
      case "En pause":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En pause</Badge>
      case "Fermé":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Fermé</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  // Fonction pour gérer le clic sur la ligne
  const handleRowClick = (siteId: string) => {
    handleEditSite(siteId)
  }

  // Fonction pour gérer le clic sur le statut
  const handleStatusClick = (siteId: string, currentStatus: string) => {
    setStatusSiteId(siteId)
    setUpdatingStatus(true)
    setNewStatus(currentStatus)
  }

  // Fonction pour fermer le modal de modification du statut
  const handleCloseStatusUpdate = () => {
    setUpdatingStatus(false)
    setNewStatus('')
    setStatusSiteId(null)
  }

  // Fonction pour mettre à jour le statut
  const handleStatusUpdate = async () => {
    if (!statusSiteId || !newStatus) return

    try {
      setIsUpdating(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('sites')
        .update({ statut: newStatus })
        .eq('id', statusSiteId)

      if (error) throw error

      // Recharger les sites
      loadSites()
      handleCloseStatusUpdate()
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      setToast({ type: 'error', message: 'Erreur lors de la mise à jour du statut' })
    } finally {
      setIsUpdating(false)
    }
  }

  // Fonction pour filtrer les sites
  const getFilteredSites = () => {
    return sites.filter(site => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          site.code_site.toLowerCase().includes(searchLower) ||
          site.nom.toLowerCase().includes(searchLower) ||
          site.responsable?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Filtre : masquer les sites fermés si non coché
      if (!showClosedSites && site.statut === 'Fermé') return false
      
      return true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des sites...</span>
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
        <Button onClick={loadSites} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun site pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par créer votre premier site opérationnel
        </p>
        <SiteFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Créer un site
          </Button>
        </SiteFormModal>
      </div>
    )
  }

  return (
    <>
      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredSites().length} site(s) trouvé(s)
          {searchTerm && (
            <span className="text-blue-600 ml-2">
              (sur {sites.length} au total)
            </span>
          )}
          {!showClosedSites && sites.filter(s => s.statut === 'Fermé').length > 0 && (
            <span className="text-slate-500 ml-2">
              ({sites.filter(s => s.statut === 'Fermé').length} site(s) fermé(s) masqué(s))
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
              <TableHead className="font-semibold text-slate-700">Responsable</TableHead>
              <TableHead className="font-semibold text-slate-700">Statut</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Collaborateurs</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Affaires</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredSites().map((site) => (
              <TableRow 
                key={site.id} 
                className="hover:bg-slate-50/50 cursor-pointer"
                onClick={() => handleRowClick(site.id)}
              >
                <TableCell className="font-mono font-semibold text-blue-600">
                  {site.code_site}
                </TableCell>
                <TableCell className="font-medium">{site.nom}</TableCell>
                <TableCell className="text-slate-600">{site.responsable || "-"}</TableCell>
                <TableCell>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusClick(site.id, site.statut)
                    }}
                    className="cursor-pointer"
                  >
                    {getStatusBadge(site.statut)}
                  </div>
                </TableCell>
                <TableCell className="text-center text-slate-600">
                  {site.nb_collaborateurs || 0}
                </TableCell>
                <TableCell className="text-center text-slate-600">
                  {site.nb_affaires || 0}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSite(site.id, site.nom)
                    }}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Supprimer le site"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal d'édition */}
      {editingSiteId && (
        <SiteFormModal siteId={editingSiteId} onClose={handleCloseModal}>
          <div />
        </SiteFormModal>
      )}

      {/* Modal de confirmation de fermeture */}
      <Dialog open={!!siteToClose} onOpenChange={(open) => !open && setSiteToClose(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirmer la fermeture du site
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Cette action changera le statut du site à "Fermé" et le retirera de la liste des sites actifs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">
                  Site : <span className="font-bold">{siteToClose?.nom}</span>
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Êtes-vous sûr de vouloir fermer ce site ?
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSiteToClose(null)}
              disabled={closingSite}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCloseSite}
              disabled={closingSite}
              className="bg-red-600 hover:bg-red-700"
            >
              {closingSite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fermeture...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmer la fermeture
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de modification du statut */}
      <Dialog open={updatingStatus} onOpenChange={(open) => !open && handleCloseStatusUpdate()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Modifier le statut du site
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Sélectionnez le nouveau statut pour ce site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nouveau statut</Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Actif">Actif</option>
                <option value="En pause">En pause</option>
                <option value="Fermé">Fermé</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseStatusUpdate}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={!!siteToDelete} onOpenChange={(open) => !open && setSiteToDelete(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirmer la suppression du site
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible et supprimera définitivement le site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">
                  Site : <span className="font-bold">{siteToDelete?.nom}</span>
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement ce site ?
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Cette action supprimera toutes les données associées à ce site.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSiteToDelete(null)}
              disabled={deletingSite}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteSite}
              disabled={deletingSite}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingSite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      {toast && toast.type === 'success' && (
        <SuccessToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {toast && toast.type === 'error' && (
        <ErrorToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

