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
import { MoreVertical, Edit, Trash2, Eye, DollarSign, X } from "lucide-react"
import { Loader2 } from "lucide-react"
import { FormationFormModal } from "./FormationFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Formation {
  id: string
  code: string
  libelle: string
  type_formation?: string
  duree_heures?: number
  duree_jours?: number
  validite_mois?: number
  modalite?: string
  prerequis?: string
  competences?: string[]
  organisme_defaut_id?: string
  organisme_defaut?: {
    nom: string
  }
  actif: boolean
}

interface CatalogueTableProps {
  searchTerm?: string
  filterType?: string
  filterModalite?: string
}

export function CatalogueTable({ 
  searchTerm = "", 
  filterType = "",
  filterModalite = ""
}: CatalogueTableProps) {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null)
  const [viewingFormation, setViewingFormation] = useState<Formation | null>(null)
  const [deactivatingFormation, setDeactivatingFormation] = useState<Formation | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('formations_catalogue')
        .select(`
          *,
          organisme_defaut:organisme_defaut_id(nom)
        `)
        .order('libelle')
      
      if (error) throw error
      setFormations(data || [])
    } catch (err: any) {
      console.error('Erreur chargement formations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingFormation) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('formations_catalogue')
        .update({ actif: false })
        .eq('id', deactivatingFormation.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `La formation "${deactivatingFormation.libelle}" a été désactivée avec succès.` 
      })
      
      // Recharger la liste
      await loadFormations()
      setDeactivatingFormation(null)
    } catch (err: any) {
      console.error('Erreur désactivation formation:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la désactivation : ${err.message}` 
      })
    }
  }

  const getFilteredFormations = () => {
    return formations.filter(formation => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!(
          formation.code?.toLowerCase().includes(searchLower) ||
          formation.libelle?.toLowerCase().includes(searchLower)
        )) return false
      }
      
      // Filtre par type
      if (filterType && formation.type_formation !== filterType) return false
      
      // Filtre par modalité
      if (filterModalite && formation.modalite !== filterModalite) return false
      
      return true
    })
  }

  const getTypeBadge = (type?: string) => {
    const badges: Record<string, { label: string, className: string }> = {
      'Habilitante': { label: 'Habilitante', className: 'bg-purple-100 text-purple-800' },
      'Technique': { label: 'Technique', className: 'bg-green-100 text-green-800' },
      'QSE': { label: 'QSE', className: 'bg-blue-100 text-blue-800' },
      'CACES': { label: 'CACES', className: 'bg-orange-100 text-orange-800' },
      'SST': { label: 'SST', className: 'bg-red-100 text-red-800' },
      'Autre': { label: 'Autre', className: 'bg-slate-100 text-slate-800' }
    }
    const badge = type ? badges[type] : null
    return badge ? (
      <Badge className={badge.className}>{badge.label}</Badge>
    ) : null
  }

  const getModaliteBadge = (modalite?: string) => {
    const badges: Record<string, { label: string, className: string }> = {
      'Présentiel': { label: 'Présentiel', className: 'bg-blue-100 text-blue-800' },
      'Distanciel': { label: 'Distanciel', className: 'bg-indigo-100 text-indigo-800' },
      'E-learning': { label: 'E-learning', className: 'bg-cyan-100 text-cyan-800' },
      'Mixte': { label: 'Mixte', className: 'bg-violet-100 text-violet-800' }
    }
    const badge = modalite ? badges[modalite] : null
    return badge ? (
      <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>
    ) : null
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
          {getFilteredFormations().length} formation(s) trouvée(s)
          {(searchTerm || filterType || filterModalite) && (
            <span className="text-blue-600 ml-2">
              (sur {formations.length} au total)
            </span>
          )}
        </p>
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Code</TableHead>
              <TableHead className="font-semibold text-slate-700">Libellé</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Durée</TableHead>
              <TableHead className="font-semibold text-slate-700">Validité</TableHead>
              <TableHead className="font-semibold text-slate-700">Modalité</TableHead>
              <TableHead className="font-semibold text-slate-700">Organisme</TableHead>
              <TableHead className="font-semibold text-slate-700">Statut</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredFormations().map((formation) => (
              <TableRow key={formation.id} className="hover:bg-slate-50/50">
                <TableCell className="font-mono font-semibold text-blue-600">
                  {formation.code}
                </TableCell>
                <TableCell className="font-medium">{formation.libelle}</TableCell>
                <TableCell>
                  {getTypeBadge(formation.type_formation)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formation.duree_heures ? `${formation.duree_heures}h` : formation.duree_jours ? `${formation.duree_jours}j` : '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formation.validite_mois ? `${formation.validite_mois} mois` : '-'}
                </TableCell>
                <TableCell>
                  {getModaliteBadge(formation.modalite)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formation.organisme_defaut?.nom || '-'}
                </TableCell>
                <TableCell>
                  {formation.actif ? (
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
                        onClick={() => setViewingFormation(formation)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditingFormation(formation)}
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 cursor-pointer"
                        onClick={() => setDeactivatingFormation(formation)}
                        disabled={!formation.actif}
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
      {editingFormation && (
        <FormationFormModal
          formation={editingFormation}
          onClose={() => setEditingFormation(null)}
          onSuccess={() => {
            loadFormations()
            setEditingFormation(null)
          }}
        />
      )}

      {/* Modal Voir détails */}
      {viewingFormation && (
        <Dialog open={!!viewingFormation} onOpenChange={() => setViewingFormation(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Détails de la formation</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingFormation(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Informations complètes de la formation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Informations principales */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Code</p>
                    <p className="text-slate-900 font-mono">{viewingFormation.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Libellé</p>
                    <p className="text-slate-900">{viewingFormation.libelle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Type</p>
                    <p className="text-slate-900">{viewingFormation.type_formation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Statut</p>
                    {viewingFormation.actif ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Durée et modalité */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Durée et modalité
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Durée (heures)</p>
                    <p className="text-slate-900">{viewingFormation.duree_heures || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Durée (jours)</p>
                    <p className="text-slate-900">{viewingFormation.duree_jours || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Validité (mois)</p>
                    <p className="text-slate-900">{viewingFormation.validite_mois || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Modalité</p>
                    <p className="text-slate-900">{viewingFormation.modalite || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Prérequis */}
              {viewingFormation.prerequis && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                    Prérequis
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingFormation.prerequis}</p>
                </div>
              )}

              {/* Compétences */}
              {viewingFormation.competences && viewingFormation.competences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                    Compétences associées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingFormation.competences.map((competence, idx) => (
                      <Badge key={idx} variant="secondary">
                        {competence}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Organisme par défaut */}
              {viewingFormation.organisme_defaut && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                    Organisme par défaut
                  </h3>
                  <p className="text-slate-900">{viewingFormation.organisme_defaut.nom}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Confirmation désactivation */}
      {deactivatingFormation && (
        <Dialog open={!!deactivatingFormation} onOpenChange={() => setDeactivatingFormation(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Désactiver la formation
              </DialogTitle>
              <DialogDescription>
                Cette action masquera la formation par défaut
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">
                Êtes-vous sûr de vouloir désactiver la formation <strong>{deactivatingFormation.libelle}</strong> ?
              </p>
              <p className="text-sm text-slate-600">
                La formation sera masquée par défaut mais pourra être réactivée ultérieurement.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivatingFormation(null)}
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

