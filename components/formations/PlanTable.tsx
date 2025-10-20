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
import { MoreVertical, Edit, Trash2, CheckCircle, Eye, X } from "lucide-react"
import { Loader2 } from "lucide-react"
import { SemaineFormationModal } from "./SemaineFormationModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Plan {
  id: string
  collaborateur_id: string
  ressource?: {
    nom: string
    prenom: string
    site_id?: string
  }
  formation_id: string
  formation?: {
    code: string
    libelle: string
  }
  organisme_id: string
  organisme?: {
    nom: string
  }
  semaine_iso?: string
  date_debut?: string
  date_fin?: string
  modalite?: string
  statut: string
  cout_prevu_ht?: number
  cout_realise_ht?: number
}

interface PlanTableProps {
  searchTerm?: string
  filterStatut?: string
  filterSite?: string
}

export function PlanTable({ 
  searchTerm = "", 
  filterStatut = "",
  filterSite = ""
}: PlanTableProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<Plan | null>(null)
  const [deactivatingPlan, setDeactivatingPlan] = useState<Plan | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadPlans()
    window.addEventListener('plan-created', loadPlans)
    return () => window.removeEventListener('plan-created', loadPlans)
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('plan_formation_ressource')
        .select(`
          *,
          ressource:collaborateur_id(nom, prenom, site_id),
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom)
        `)
        .order('date_debut', { ascending: false })
      
      if (error) throw error
      console.log('Plans chargés:', data)
      setPlans(data || [])
    } catch (err: any) {
      console.error('Erreur chargement plan:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (plan: Plan) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('plan_formation_ressource')
        .update({ statut: 'Validé' })
        .eq('id', plan.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `La formation "${plan.formation?.libelle}" a été validée avec succès.` 
      })
      
      // Recharger la liste
      await loadPlans()
      
      // Déclencher l'événement pour rafraîchir les statistiques
      window.dispatchEvent(new Event('plan-created'))
    } catch (err: any) {
      console.error('Erreur validation plan:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la validation : ${err.message}` 
      })
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingPlan) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('plan_formation_ressource')
        .update({ statut: 'Annulé' })
        .eq('id', deactivatingPlan.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `La formation prévue pour ${deactivatingPlan.ressource?.prenom} ${deactivatingPlan.ressource?.nom} a été annulée avec succès.` 
      })
      
      // Recharger la liste
      await loadPlans()
      
      // Déclencher l'événement pour rafraîchir les statistiques
      window.dispatchEvent(new Event('plan-created'))
      
      setDeactivatingPlan(null)
    } catch (err: any) {
      console.error('Erreur annulation plan:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de l'annulation : ${err.message}` 
      })
    }
  }

  const getFilteredPlans = () => {
    return plans.filter(plan => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!(
          plan.ressource?.nom?.toLowerCase().includes(searchLower) ||
          plan.ressource?.prenom?.toLowerCase().includes(searchLower) ||
          plan.formation?.libelle?.toLowerCase().includes(searchLower) ||
          plan.organisme?.nom?.toLowerCase().includes(searchLower)
        )) return false
      }
      
      // Filtre par statut
      if (filterStatut && plan.statut !== filterStatut) return false
      
      // Filtre par site
      if (filterSite && plan.ressource?.site_id !== filterSite) return false
      
      return true
    })
  }

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { label: string, className: string }> = {
      'Prévisionnel': { label: 'Prévisionnel', className: 'bg-yellow-100 text-yellow-800' },
      'Validé': { label: 'Validé', className: 'bg-green-100 text-green-800' },
      'Réalisé': { label: 'Réalisé', className: 'bg-purple-100 text-purple-800' },
      'Annulé': { label: 'Annulé', className: 'bg-red-100 text-red-800' }
    }
    const badge = badges[statut]
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
          {getFilteredPlans().length} semaine(s) trouvée(s)
          {(searchTerm || filterStatut || filterSite) && (
            <span className="text-blue-600 ml-2">
              (sur {plans.length} au total)
            </span>
          )}
        </p>
      </div>

      {getFilteredPlans().length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600 mb-2">
            {plans.length === 0 ? 'Aucune formation planifiée' : 'Aucun résultat trouvé'}
          </p>
          <p className="text-sm text-slate-500">
            {plans.length === 0 
              ? 'Cliquez sur "Planifier une formation" pour commencer' 
              : 'Essayez de modifier vos filtres de recherche'}
          </p>
        </div>
      )}

      {getFilteredPlans().length > 0 && (
        <div className="rounded-md border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Ressource</TableHead>
                <TableHead className="font-semibold text-slate-700">Formation</TableHead>
                <TableHead className="font-semibold text-slate-700">Organisme</TableHead>
                <TableHead className="font-semibold text-slate-700">Semaine</TableHead>
                <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                <TableHead className="font-semibold text-slate-700">Modalité</TableHead>
                <TableHead className="font-semibold text-slate-700">Coût Prévu</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredPlans().map((plan) => (
              <TableRow key={plan.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  {plan.ressource?.prenom} {plan.ressource?.nom}
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs text-blue-600">{plan.formation?.code}</div>
                  <div className="text-sm">{plan.formation?.libelle}</div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {plan.organisme?.nom || '-'}
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-600">
                  {plan.semaine_iso || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {plan.date_debut && plan.date_fin ? (
                    <div className="text-sm">
                      {new Date(plan.date_debut).toLocaleDateString('fr-FR')} - {new Date(plan.date_fin).toLocaleDateString('fr-FR')}
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {getModaliteBadge(plan.modalite)}
                </TableCell>
                <TableCell className="font-semibold">
                  {plan.cout_prevu_ht ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(plan.cout_prevu_ht) : '-'}
                </TableCell>
                <TableCell>
                  {getStatutBadge(plan.statut)}
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
                        onClick={() => setViewingPlan(plan)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      {plan.statut === 'Prévisionnel' && (
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer text-green-600"
                          onClick={() => handleValidate(plan)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Valider
                        </DropdownMenuItem>
                      )}
                      {plan.statut === 'Validé' && (
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer text-purple-600"
                          onClick={async () => {
                            try {
                              const supabase = createClient()
                              const { error } = await supabase
                                .from('plan_formation_ressource')
                                .update({ statut: 'Réalisé' })
                                .eq('id', plan.id)
                              
                              if (error) throw error
                              
                              setToast({ 
                                type: 'success', 
                                message: `La formation "${plan.formation?.libelle}" a été marquée comme réalisée.` 
                              })
                              
                              await loadPlans()
                              window.dispatchEvent(new Event('plan-created'))
                            } catch (err: any) {
                              console.error('Erreur:', err)
                              setToast({ 
                                type: 'error', 
                                message: `Erreur : ${err.message}` 
                              })
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marquer comme réalisé
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 cursor-pointer"
                        onClick={() => setDeactivatingPlan(plan)}
                        disabled={plan.statut === 'Annulé'}
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
      {editingPlan && (
        <SemaineFormationModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => {
            loadPlans()
            setEditingPlan(null)
          }}
        />
      )}

      {/* Modal Voir détails */}
      {viewingPlan && (
        <Dialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Détails de la semaine de formation</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingPlan(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Informations complètes de la formation planifiée
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Informations collaborateur */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Collaborateur
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Nom</p>
                    <p className="text-slate-900">
                      {viewingPlan.ressource?.prenom} {viewingPlan.ressource?.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Statut</p>
                    {getStatutBadge(viewingPlan.statut)}
                  </div>
                </div>
              </div>

              {/* Informations formation */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Formation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Code</p>
                    <p className="text-slate-900 font-mono">{viewingPlan.formation?.code || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Libellé</p>
                    <p className="text-slate-900">{viewingPlan.formation?.libelle || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Organisme</p>
                    <p className="text-slate-900">{viewingPlan.organisme?.nom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Modalité</p>
                    {getModaliteBadge(viewingPlan.modalite)}
                  </div>
                </div>
              </div>

              {/* Dates et coûts */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Dates et coûts
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date de début</p>
                    <p className="text-slate-900">
                      {viewingPlan.date_debut ? new Date(viewingPlan.date_debut).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date de fin</p>
                    <p className="text-slate-900">
                      {viewingPlan.date_fin ? new Date(viewingPlan.date_fin).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Coût prévu (HT)</p>
                    <p className="text-slate-900 font-semibold">
                      {viewingPlan.cout_prevu_ht 
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingPlan.cout_prevu_ht)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Coût réalisé (HT)</p>
                    <p className="text-slate-900 font-semibold">
                      {viewingPlan.cout_realise_ht 
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(viewingPlan.cout_realise_ht)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Semaine ISO */}
              {viewingPlan.semaine_iso && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                    Semaine ISO
                  </h3>
                  <p className="text-slate-900">{viewingPlan.semaine_iso}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Confirmation annulation */}
      {deactivatingPlan && (
        <Dialog open={!!deactivatingPlan} onOpenChange={() => setDeactivatingPlan(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Annuler la formation
              </DialogTitle>
              <DialogDescription>
                Cette action annulera la formation planifiée
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">
                Êtes-vous sûr de vouloir annuler la formation <strong>{deactivatingPlan.formation?.libelle}</strong> prévue pour <strong>{deactivatingPlan.ressource?.prenom} {deactivatingPlan.ressource?.nom}</strong> ?
              </p>
              <p className="text-sm text-slate-600">
                La formation sera marquée comme "Annulée" mais pourra être réactivée ultérieurement.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivatingPlan(null)}
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

