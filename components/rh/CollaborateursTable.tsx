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
import { MoreHorizontal, Edit, Trash2, User, Loader2, Search, Filter, Upload, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CollaborateurFormModal } from "./CollaborateurFormModal"
import { CollaborateurProfileModal } from "./CollaborateurProfileModal"
import { CollaborateurDesactivationModal } from "./CollaborateurDesactivationModal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Collaborateur {
  id: string
  nom: string
  prenom: string
  site?: string
  site_code?: string
  type_contrat: string
  email_pro?: string
  email_perso?: string
  telephone?: string
  competences?: string[]
  role_principal?: string
  actif: boolean
  date_entree?: string
  date_sortie?: string
}

interface CollaborateursTableProps {
  searchTerm?: string
  filterSite?: string
  filterContrat?: string
  filterStatut?: string
  showInactive?: boolean
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export function CollaborateursTable({ 
  searchTerm = "", 
  filterSite = "", 
  filterContrat = "", 
  filterStatut = "",
  showInactive = false,
  onSuccess,
  onError
}: CollaborateursTableProps) {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCollaborateurId, setEditingCollaborateurId] = useState<string | undefined>(undefined)
  const [viewingCollaborateurId, setViewingCollaborateurId] = useState<string | undefined>(undefined)
  const [desactivatingCollaborateur, setDesactivatingCollaborateur] = useState<{id: string, nom: string} | undefined>(undefined)
  const [updatingStatus, setUpdatingStatus] = useState<{id: string, nom: string, currentStatus: string} | undefined>(undefined)
  const [newStatus, setNewStatus] = useState<string>("")
  const [newDate, setNewDate] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadCollaborateurs()
  }, [])

  const loadCollaborateurs = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Charger les collaborateurs non-admin
      const { data: collabsData, error: collabsError } = await supabase
        .from('ressources')
        .select('*')
        .eq('is_admin', false)
        .order('nom')

      if (collabsError) throw collabsError

      // Charger tous les sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, code_site, nom')

      if (sitesError) throw sitesError

      // Créer un map pour accès rapide aux sites
      const sitesMap = new Map(
        (sitesData || []).map(s => [s.id, s])
      )

      const formattedData = (collabsData || []).map((collab: any) => {
        // Trouver le site
        const siteData = collab.site_id ? sitesMap.get(collab.site_id) : null
        const site = siteData ? siteData.nom : '-'
        const site_code = siteData ? siteData.code_site : ''
        
        // Rôle principal par défaut (sera géré séparément si nécessaire)
        const rolePrincipal = '-'
        
        return {
          id: collab.id,
          nom: collab.nom,
          prenom: collab.prenom,
          site,
          site_code,
          type_contrat: collab.type_contrat,
          email_pro: collab.email_pro,
          email_perso: collab.email_perso,
          telephone: collab.telephone,
          competences: collab.competences || [],
          role_principal: rolePrincipal,
          actif: collab.actif,
          date_entree: collab.date_entree,
          date_sortie: collab.date_sortie,
        }
      })

      setCollaborateurs(formattedData)
    } catch (err) {
      console.error('Erreur chargement collaborateurs:', err)
      setError('Erreur lors du chargement des collaborateurs')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadCollaborateurs()
    }
    window.addEventListener('collaborateur-created', handleRefresh)
    return () => window.removeEventListener('collaborateur-created', handleRefresh)
  }, [])

  const handleEditCollaborateur = (id: string) => {
    setEditingCollaborateurId(id)
  }

  const handleCloseModal = () => {
    setEditingCollaborateurId(undefined)
  }

  const handleViewProfile = (id: string) => {
    setViewingCollaborateurId(id)
  }

  const handleCloseProfile = () => {
    setViewingCollaborateurId(undefined)
  }

  const handleDesactiver = (id: string, nom: string) => {
    setDesactivatingCollaborateur({ id, nom })
  }

  const handleCloseDesactivation = () => {
    setDesactivatingCollaborateur(undefined)
  }

  const handleDesactivationSuccess = () => {
    loadCollaborateurs()
  }

  // Fonction pour calculer le statut d'un collaborateur
  const getCollaborateurStatus = (collab: Collaborateur) => {
    if (!collab.actif) return 'Inactif'
    
    // Vérifier si c'est un contrat intérim avec date de fin proche
    if (collab.type_contrat === 'Intérim' && collab.date_sortie) {
      const dateFin = new Date(collab.date_sortie)
      const aujourdHui = new Date()
      const diffTime = dateFin.getTime() - aujourdHui.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 14 && diffDays >= 0) {
        return 'À renouveler'
      }
    }
    
    return 'Actif'
  }

  const handleStatusClick = (collab: Collaborateur) => {
    const currentStatus = getCollaborateurStatus(collab)
    setUpdatingStatus({ 
      id: collab.id, 
      nom: `${collab.prenom} ${collab.nom}`,
      currentStatus 
    })
    setNewStatus("")
    setNewDate("")
  }

  const handleCloseStatusUpdate = () => {
    setUpdatingStatus(undefined)
    setNewStatus("")
    setNewDate("")
  }

  const handleStatusUpdate = async () => {
    if (!updatingStatus || !newStatus) return

    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      let updateData: any = {}
      
      if (newStatus === 'Inactif') {
        updateData = { actif: false }
      } else if (newStatus === 'Actif') {
        updateData = { actif: true }
      } else if (newStatus === 'Prolonger' && newDate) {
        updateData = { date_sortie: newDate }
      }
      
      const { error } = await supabase
        .from('ressources')
        .update(updateData)
        .eq('id', updatingStatus.id)

      if (error) throw error

      const message = newStatus === 'Inactif' 
        ? `Collaborateur ${updatingStatus.nom} désactivé avec succès`
        : newStatus === 'Actif'
        ? `Collaborateur ${updatingStatus.nom} réactivé avec succès`
        : `Contrat de ${updatingStatus.nom} prolongé jusqu'au ${newDate}`
        
      if (onSuccess) onSuccess(message)
      loadCollaborateurs()
      handleCloseStatusUpdate()
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      if (onError) onError('Erreur lors de la mise à jour du statut')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleQuickActivate = async (collab: Collaborateur) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('ressources')
        .update({ actif: true })
        .eq('id', collab.id)

      if (error) throw error

      if (onSuccess) onSuccess(`Collaborateur ${collab.prenom} ${collab.nom} réactivé avec succès`)
      loadCollaborateurs()
    } catch (error) {
      console.error('Erreur réactivation:', error)
      if (onError) onError('Erreur lors de la réactivation du collaborateur')
    } finally {
      setIsUpdating(false)
    }
  }

  // Fonction pour exporter en CSV
  const handleExport = () => {
    const filteredData = getFilteredCollaborateurs()
    
    // En-têtes CSV
    const headers = ['Nom', 'Prénom', 'Site', 'Type contrat', 'Email pro', 'Email perso', 'Téléphone', 'Fonction', 'Statut', 'Date entrée', 'Date sortie']
    
    // Données CSV
    const csvData = filteredData.map(collab => [
      collab.nom,
      collab.prenom,
      collab.site || '-',
      collab.type_contrat,
      collab.email_pro || '-',
      collab.email_perso || '-',
      collab.telephone || '-',
      collab.role_principal || '-',
      collab.actif ? 'Actif' : 'Inactif',
      collab.date_entree || '-',
      collab.date_sortie || '-'
    ])
    
    // Créer le CSV
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `collaborateurs_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    if (onSuccess) onSuccess('Export CSV réussi !')
  }

  // Fonction pour importer depuis CSV
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      
      // Parser les données
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim())
        return {
          nom: values[0],
          prenom: values[1],
          site: values[2],
          type_contrat: values[3],
          email_pro: values[4] !== '-' ? values[4] : null,
          email_perso: values[5] !== '-' ? values[5] : null,
          telephone: values[6] !== '-' ? values[6] : null,
          competences: values[7] !== '-' ? values[7].split(',').map(c => c.trim()) : [],
          actif: values[8] === 'Actif',
          date_entree: values[9] !== '-' ? values[9] : null,
          date_sortie: values[10] !== '-' ? values[10] : null,
        }
      }).filter(row => row.nom && row.prenom)
      
      // Insérer les données
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('ressources')
          .insert(data)
        
        if (error) throw error
        
        if (onSuccess) onSuccess(`${data.length} collaborateur(s) importé(s) avec succès !`)
        loadCollaborateurs()
      } catch (err) {
        console.error('Erreur import:', err)
        if (onError) onError('Erreur lors de l\'import')
      }
    }
    input.click()
  }

  // Fonction pour filtrer les collaborateurs
  const getFilteredCollaborateurs = () => {
    return collaborateurs.filter(collab => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          collab.nom.toLowerCase().includes(searchLower) ||
          collab.prenom.toLowerCase().includes(searchLower) ||
          collab.email_pro?.toLowerCase().includes(searchLower) ||
          collab.email_perso?.toLowerCase().includes(searchLower) ||
          collab.telephone?.includes(searchTerm) ||
          collab.site?.toLowerCase().includes(searchLower) ||
          collab.role_principal?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Filtre par site (comparer avec le code du site)
      if (filterSite && collab.site_code !== filterSite) return false
      
      // Filtre par type de contrat
      if (filterContrat && collab.type_contrat !== filterContrat) return false
      
      // Filtre par statut
      if (filterStatut) {
        if (filterStatut === 'Actif' && !collab.actif) return false
        if (filterStatut === 'Inactif' && collab.actif) return false
      }
      
      // Filtre par affichage des inactifs
      if (!showInactive && !collab.actif) return false
      
      return true
    })
  }

  const getContratBadge = (contrat: string) => {
    switch (contrat) {
      case "CDI":
        return <Badge className="bg-green-500 hover:bg-green-600">CDI</Badge>
      case "CDD":
        return <Badge className="bg-blue-500 hover:bg-blue-600">CDD</Badge>
      case "Intérim":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Intérim</Badge>
      case "Apprenti":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Apprenti</Badge>
      default:
        return <Badge>{contrat}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des collaborateurs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadCollaborateurs} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (collaborateurs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun collaborateur pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par ajouter vos collaborateurs
        </p>
        <CollaborateurFormModal
          onSuccess={onSuccess}
          onError={onError}
        >
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Ajouter un collaborateur
          </Button>
        </CollaborateurFormModal>
      </div>
    )
  }

  return (
    <>
      <CollaborateurFormModal 
        collaborateurId={editingCollaborateurId}
        onClose={handleCloseModal}
        open={editingCollaborateurId !== undefined}
        onOpenChange={(open) => {
          if (!open) handleCloseModal()
        }}
        onSuccess={onSuccess}
        onError={onError}
      />
      
      {viewingCollaborateurId && (
        <CollaborateurProfileModal
          collaborateurId={viewingCollaborateurId}
          open={viewingCollaborateurId !== undefined}
          onOpenChange={(open) => {
            if (!open) handleCloseProfile()
          }}
        />
      )}
      
      {desactivatingCollaborateur && (
        <CollaborateurDesactivationModal
          collaborateurId={desactivatingCollaborateur.id}
          collaborateurNom={desactivatingCollaborateur.nom}
          open={desactivatingCollaborateur !== undefined}
          onOpenChange={(open) => {
            if (!open) handleCloseDesactivation()
          }}
          onSuccess={handleDesactivationSuccess}
        />
      )}
      
      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredCollaborateurs().length} collaborateur(s) trouvé(s)
          {(searchTerm || filterSite || filterContrat || filterStatut || !showInactive) && (
            <span className="text-blue-600 ml-2">
              (sur {collaborateurs.length} au total)
            </span>
          )}
        </p>
      </div>
      
      <div className="rounded-md border border-slate-200">
        <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Nom</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">Type contrat</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Téléphone</TableHead>
            <TableHead className="font-semibold text-slate-700">Fonction</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFilteredCollaborateurs().map((collab) => (
            <TableRow 
              key={collab.id} 
              className="hover:bg-slate-50/50 cursor-pointer"
              onClick={() => handleEditCollaborateur(collab.id)}
            >
              <TableCell className="font-medium">
                {collab.prenom} {collab.nom}
              </TableCell>
              <TableCell className="text-slate-600">
                {collab.site || "-"}
              </TableCell>
              <TableCell>{getContratBadge(collab.type_contrat)}</TableCell>
              <TableCell className="text-slate-600">
                {collab.email_pro || collab.email_perso || "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {collab.telephone || "-"}
              </TableCell>
              <TableCell>
                {collab.role_principal && collab.role_principal !== '-' && (
                  <Badge variant="outline" className="text-xs">
                    {collab.role_principal}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`cursor-pointer transition-all ${
                      getCollaborateurStatus(collab) === 'Actif' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : getCollaborateurStatus(collab) === 'À renouveler'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-slate-500 hover:bg-slate-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusClick(collab)
                    }}
                  >
                    {getCollaborateurStatus(collab)}
                  </Badge>
                  {!collab.actif && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickActivate(collab)
                      }}
                    >
                      Actif
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Modal de mise à jour du statut */}
    <Dialog open={!!updatingStatus} onOpenChange={handleCloseStatusUpdate}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Modifier le statut
          </DialogTitle>
          <DialogDescription>
            Modifier le statut de <strong>{updatingStatus?.nom}</strong>.
            <br />
            <span className="text-blue-600 text-sm">
              Statut actuel : {updatingStatus?.currentStatus}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-status" className="text-sm font-medium">
              Nouveau statut <span className="text-red-500">*</span>
            </Label>
            <select
              id="new-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
            >
              <option value="">Sélectionner un statut</option>
              {updatingStatus?.currentStatus === 'Actif' && (
                <option value="Inactif">Inactif</option>
              )}
              {updatingStatus?.currentStatus === 'À renouveler' && (
                <>
                  <option value="Inactif">Inactif</option>
                  <option value="Prolonger">Prolonger</option>
                </>
              )}
              {updatingStatus?.currentStatus === 'Inactif' && (
                <option value="Actif">Actif</option>
              )}
            </select>
          </div>

          {newStatus === 'Prolonger' && (
            <div className="grid gap-2">
              <Label htmlFor="new-date" className="text-sm font-medium">
                Nouvelle date de fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCloseStatusUpdate}
            className="flex-1"
            disabled={isUpdating}
          >
            Annuler
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={!newStatus || (newStatus === 'Prolonger' && !newDate) || isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Mettre à jour
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

