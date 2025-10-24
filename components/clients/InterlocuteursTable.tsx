"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Edit, Trash2, Mail, Phone, Loader2, AlertTriangle, Users } from "lucide-react"
import { InterlocuteurFormModal } from "./InterlocuteurFormModal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Interlocuteur {
  id: string
  nom: string
  prenom: string
  nom_client: string
  fonction?: string
  type_interlocuteur: string
  email?: string
  telephone?: string
  site_nom?: string
  actif: boolean
}

interface InterlocuteursTableProps {
  searchTerm?: string
  filters?: {
    typeInterlocuteur?: string
    clientId?: string
    siteId?: string
    actif?: string
  }
}

export function InterlocuteursTable({ searchTerm = "", filters = {} }: InterlocuteursTableProps) {
  const [interlocuteurs, setInterlocuteurs] = useState<Interlocuteur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingInterlocuteur, setEditingInterlocuteur] = useState<string | null>(null)
  const [deletingInterlocuteur, setDeletingInterlocuteur] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadInterlocuteurs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      let query = supabase
        .from('interlocuteurs')
        .select(`
          id,
          nom,
          prenom,
          fonction,
          type_interlocuteur,
          email,
          telephone,
          actif,
          clients!inner(nom_client),
          sites(nom)
        `)

      // Appliquer les filtres
      if (filters.actif !== undefined && filters.actif !== "") {
        query = query.eq('actif', filters.actif === 'true')
      } else {
        query = query.eq('actif', true) // Par défaut, seulement les actifs
      }

      if (filters.typeInterlocuteur) {
        query = query.eq('type_interlocuteur', filters.typeInterlocuteur)
      }

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId)
      }

      if (filters.siteId) {
        query = query.eq('site_id', filters.siteId)
      }

      const { data, error } = await query.order('nom')

      if (error) {
        console.error('Erreur chargement interlocuteurs:', error)
        setError('Erreur lors du chargement des contacts')
        return
      }

      // Transformer les données pour correspondre à l'interface
      const formattedData = data?.map(item => ({
        id: item.id,
        nom: item.nom,
        prenom: item.prenom,
        nom_client: (item.clients as any)?.nom_client || 'Client inconnu',
        fonction: item.fonction || '',
        type_interlocuteur: item.type_interlocuteur || '',
        email: item.email || '',
        telephone: item.telephone || '',
        site_nom: (item.sites as any)?.nom || '',
        actif: item.actif
      })) || []

      setInterlocuteurs(formattedData)
    } catch (err) {
      console.error('Erreur chargement interlocuteurs:', err)
      setError('Erreur lors du chargement des contacts')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadInterlocuteurs()
  }, [loadInterlocuteurs])

  // Rafraîchir la liste après création/modification
  useEffect(() => {
    const handleRefresh = () => {
      loadInterlocuteurs()
    }
    window.addEventListener('interlocuteur-created', handleRefresh)
    window.addEventListener('interlocuteur-updated', handleRefresh)
    window.addEventListener('interlocuteur-deleted', handleRefresh)
    return () => {
      window.removeEventListener('interlocuteur-created', handleRefresh)
      window.removeEventListener('interlocuteur-updated', handleRefresh)
      window.removeEventListener('interlocuteur-deleted', handleRefresh)
    }
  }, [loadInterlocuteurs])

  const handleDeleteInterlocuteur = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('interlocuteurs')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      toast.success("Interlocuteur supprimé avec succès")
      window.dispatchEvent(new CustomEvent('interlocuteur-deleted'))
      setShowDeleteConfirm(false)
      setDeletingInterlocuteur(null)
    } catch (error) {
      console.error('Erreur suppression interlocuteur:', error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleEditInterlocuteur = (id: string) => {
    setEditingInterlocuteur(id)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingInterlocuteur(id)
    setShowDeleteConfirm(true)
  }

  // Filtrer les interlocuteurs selon le terme de recherche
  const getFilteredInterlocuteurs = () => {
    if (!searchTerm) return interlocuteurs
    
    return interlocuteurs.filter(interlocuteur =>
      interlocuteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interlocuteur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interlocuteur.nom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interlocuteur.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Technique":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Technique</Badge>
      case "Administratif":
        return <Badge className="bg-green-500 hover:bg-green-600">Administratif</Badge>
      case "Facturation":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Facturation</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des contacts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadInterlocuteurs} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  const filteredInterlocuteurs = getFilteredInterlocuteurs()

  if (filteredInterlocuteurs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchTerm ? "Aucun contact trouvé pour cette recherche" : "Aucun contact pour le moment"}
        </h3>
        <p className="text-slate-600 mb-6">
          {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par ajouter vos premiers contacts clients"}
        </p>
        <InterlocuteurFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Ajouter un contact
          </Button>
        </InterlocuteurFormModal>
      </div>
    )
  }

  return (
    <>
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
            <TableHead className="font-semibold text-slate-700">Client</TableHead>
            <TableHead className="font-semibold text-slate-700">Fonction</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Téléphone</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInterlocuteurs.map((interlocuteur) => (
            <TableRow 
              key={interlocuteur.id} 
              className="hover:bg-slate-50/50 cursor-pointer"
              onClick={() => handleEditInterlocuteur(interlocuteur.id)}
            >
              <TableCell className="font-medium">
                {interlocuteur.prenom} {interlocuteur.nom}
              </TableCell>
              <TableCell className="text-slate-600">{interlocuteur.nom_client}</TableCell>
              <TableCell className="text-slate-600">{interlocuteur.fonction || "-"}</TableCell>
              <TableCell>{getTypeBadge(interlocuteur.type_interlocuteur)}</TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.email ? (
                  <a 
                    href={`mailto:${interlocuteur.email}`} 
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-3 w-3" />
                    {interlocuteur.email}
                  </a>
                ) : "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.telephone ? (
                  <a 
                    href={`tel:${interlocuteur.telephone}`} 
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3" />
                    {interlocuteur.telephone}
                  </a>
                ) : "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.site_nom || "-"}
              </TableCell>
              <TableCell>
                {interlocuteur.actif ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>
                ) : (
                  <Badge className="bg-slate-500 hover:bg-slate-600">Inactif</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (interlocuteur.email) {
                        window.location.href = `mailto:${interlocuteur.email}`
                      }
                    }}
                    disabled={!interlocuteur.email}
                  >
                    <Mail className="h-3 w-3" />
                    Contacter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(interlocuteur.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Modal de modification */}
    {editingInterlocuteur && (
      <InterlocuteurFormModal
        interlocuteurId={editingInterlocuteur}
        onClose={() => setEditingInterlocuteur(null)}
      />
    )}

    {/* Modal de confirmation de suppression */}
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Cette action est irréversible. L'interlocuteur sera définitivement supprimé.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteConfirm(false)
              setDeletingInterlocuteur(null)
            }}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deletingInterlocuteur) {
                handleDeleteInterlocuteur(deletingInterlocuteur)
              }
            }}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  )
}

