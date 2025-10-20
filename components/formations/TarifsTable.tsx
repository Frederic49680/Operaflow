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
import { MoreVertical, Edit, Trash2, Eye, X } from "lucide-react"
import { Loader2 } from "lucide-react"
import { TarifFormModal } from "./TarifFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Tarif {
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
  modalite?: string
  cout_unitaire?: number
  cout_session?: number
  capacite_max?: number
  frais_deplacement?: number
  tva?: number
  date_debut?: string
  date_fin?: string
  actif: boolean
}

interface TarifsTableProps {
  searchTerm?: string
  filterOrganisme?: string
  filterFormation?: string
}

export function TarifsTable({ 
  searchTerm = "", 
  filterOrganisme = "",
  filterFormation = ""
}: TarifsTableProps) {
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null)
  const [viewingTarif, setViewingTarif] = useState<Tarif | null>(null)
  const [deactivatingTarif, setDeactivatingTarif] = useState<Tarif | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadTarifs()
    window.addEventListener('tarif-created', loadTarifs)
    return () => window.removeEventListener('tarif-created', loadTarifs)
  }, [])

  const loadTarifs = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('formations_tarifs')
        .select(`
          *,
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTarifs(data || [])
    } catch (err: any) {
      console.error('Erreur chargement tarifs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingTarif) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('formations_tarifs')
        .update({ actif: false })
        .eq('id', deactivatingTarif.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `Le tarif "${deactivatingTarif.formation?.libelle}" a été désactivé avec succès.` 
      })
      
      // Recharger la liste
      await loadTarifs()
      setDeactivatingTarif(null)
    } catch (err: any) {
      console.error('Erreur désactivation tarif:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la désactivation : ${err.message}` 
      })
    }
  }

  const getFilteredTarifs = () => {
    return tarifs.filter(tarif => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!(
          tarif.formation?.libelle?.toLowerCase().includes(searchLower) ||
          tarif.formation?.code?.toLowerCase().includes(searchLower) ||
          tarif.organisme?.nom?.toLowerCase().includes(searchLower)
        )) return false
      }
      
      // Filtre par organisme
      if (filterOrganisme && tarif.organisme_id !== filterOrganisme) return false
      
      // Filtre par formation
      if (filterFormation && tarif.formation_id !== filterFormation) return false
      
      // Filtre par statut actif/inactif
      if (!showInactive && !tarif.actif) return false
      
      return true
    })
  }

  const getModaliteBadge = (modalite?: string) => {
    if (!modalite) return <span className="text-slate-400">-</span>
    const colors: Record<string, string> = {
      'Présentiel': 'bg-blue-100 text-blue-800',
      'Distanciel': 'bg-purple-100 text-purple-800',
      'E-learning': 'bg-green-100 text-green-800',
      'Mixte': 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[modalite] || 'bg-slate-100 text-slate-800'}>
        {modalite}
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
      {/* Compteur de résultats et toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredTarifs().length} tarif(s) trouvé(s)
          {searchTerm && (
            <span className="text-blue-600 ml-2">
              (sur {tarifs.length} au total)
            </span>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInactive(!showInactive)}
          className="gap-2"
        >
          {showInactive ? (
            <>
              <Eye className="h-4 w-4" />
              Masquer l'historique
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Afficher l'historique
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Formation</TableHead>
              <TableHead className="font-semibold text-slate-700">Organisme</TableHead>
              <TableHead className="font-semibold text-slate-700">Modalité</TableHead>
              <TableHead className="font-semibold text-slate-700">Prix unitaire</TableHead>
              <TableHead className="font-semibold text-slate-700">Prix groupe</TableHead>
              <TableHead className="font-semibold text-slate-700">Capacité max</TableHead>
              <TableHead className="font-semibold text-slate-700">Statut</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredTarifs().map((tarif) => (
              <TableRow key={tarif.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-mono text-xs text-slate-500">{tarif.formation?.code}</div>
                    <div>{tarif.formation?.libelle}</div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {tarif.organisme?.nom || '-'}
                </TableCell>
                <TableCell>
                  {getModaliteBadge(tarif.modalite)}
                </TableCell>
                <TableCell className="font-semibold">
                  {tarif.cout_unitaire 
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tarif.cout_unitaire)
                    : '-'}
                </TableCell>
                <TableCell className="font-semibold">
                  {tarif.cout_session 
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tarif.cout_session)
                    : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {tarif.capacite_max || '-'}
                </TableCell>
                <TableCell>
                  {tarif.actif ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
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
                        onClick={() => setViewingTarif(tarif)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditingTarif(tarif)}
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 cursor-pointer"
                        onClick={() => setDeactivatingTarif(tarif)}
                        disabled={!tarif.actif}
                      >
                        <Trash2 className="h-4 w-4" />
                        Désactiver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {editingTarif && (
        <TarifFormModal
          tarif={editingTarif}
          onClose={() => setEditingTarif(null)}
          onSuccess={() => {
            loadTarifs()
            setEditingTarif(null)
          }}
        />
      )}

      {/* Modal Voir détails */}
      {viewingTarif && (
        <Dialog open={!!viewingTarif} onOpenChange={() => setViewingTarif(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Détails du tarif</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingTarif(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Informations complètes du tarif de formation
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
                    <p className="text-slate-900">{viewingTarif.formation?.libelle}</p>
                    <p className="text-xs font-mono text-slate-500">{viewingTarif.formation?.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Organisme</p>
                    <p className="text-slate-900">{viewingTarif.organisme?.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Modalité</p>
                    {getModaliteBadge(viewingTarif.modalite)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Statut</p>
                    {viewingTarif.actif ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Tarifs */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Tarifs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Prix unitaire (HT)</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {viewingTarif.cout_unitaire 
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingTarif.cout_unitaire)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Prix groupe (HT)</p>
                    <p className="text-slate-900 font-semibold text-lg">
                      {viewingTarif.cout_session 
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingTarif.cout_session)
                        : '-'}
                    </p>
                  </div>
                  {viewingTarif.capacite_max && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Capacité maximale</p>
                      <p className="text-slate-900">{viewingTarif.capacite_max} personnes</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-600">TVA</p>
                    <p className="text-slate-900">{viewingTarif.tva || 20}%</p>
                  </div>
                  {viewingTarif.frais_deplacement && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Frais de déplacement</p>
                      <p className="text-slate-900">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingTarif.frais_deplacement)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validité */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Validité du tarif
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Validité - Début</p>
                    <p className="text-slate-900">
                      {viewingTarif.date_debut ? new Date(viewingTarif.date_debut).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Validité - Fin</p>
                    <p className="text-slate-900">
                      {viewingTarif.date_fin ? new Date(viewingTarif.date_fin).toLocaleDateString('fr-FR') : 'Indéterminée'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Confirmation désactivation */}
      {deactivatingTarif && (
        <Dialog open={!!deactivatingTarif} onOpenChange={() => setDeactivatingTarif(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Désactiver le tarif
              </DialogTitle>
              <DialogDescription>
                Cette action désactivera le tarif
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">
                Êtes-vous sûr de vouloir désactiver le tarif pour <strong>{deactivatingTarif.formation?.libelle}</strong> ?
              </p>
              <p className="text-sm text-slate-600">
                Le tarif sera conservé dans l'historique et pourra être consulté via le bouton "Afficher l'historique".
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivatingTarif(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeactivate}
                >
                  Désactiver
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

