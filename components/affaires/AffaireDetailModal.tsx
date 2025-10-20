"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Loader2, FileText, Building2, User, DollarSign, Calendar, TrendingUp, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { LotsFinanciersTable } from "./LotsFinanciersTable"

interface AffaireDetailModalProps {
  affaireId: string | null
  onClose: () => void
}

export function AffaireDetailModal({ affaireId, onClose }: AffaireDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [affaire, setAffaire] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (!affaireId) return

    const loadAffaire = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/affaires/${affaireId}`)
        
        if (!response.ok) throw new Error("Erreur lors du chargement de l'affaire")
        
        const data = await response.json()
        setAffaire(data)
      } catch (err) {
        console.error('Erreur chargement affaire:', err)
        setError('Erreur lors du chargement de l\'affaire')
      } finally {
        setLoading(false)
      }
    }

    loadAffaire()
  }, [affaireId])

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

  if (!affaireId) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Détail de l'affaire
          </DialogTitle>
          <DialogDescription>
            Informations complètes de l'affaire
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Chargement des données...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        )}

        {!loading && !error && affaire && (
          <div className="space-y-6">
            {/* En-tête avec code et statut */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{affaire.nom}</h3>
                    <p className="text-sm text-slate-500 font-mono">{affaire.code_affaire}</p>
                  </div>
                </div>
                {affaire.type_affaire === 'BPU' && (
                  <Badge className="mt-2 bg-blue-600">BPU - Bordereau Prix Unitaire</Badge>
                )}
              </div>
              <div className="text-right">
                {getStatutBadge(affaire.statut)}
              </div>
            </div>

            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">
                  <FileText className="h-4 w-4 mr-2" />
                  Informations générales
                </TabsTrigger>
                <TabsTrigger value="lots">
                  <Receipt className="h-4 w-4 mr-2" />
                  Lots financiers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                {/* Grid principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Informations générales
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Client</span>
                    <span className="font-medium">{affaire.clients?.nom_client || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Site</span>
                    <span className="font-medium">{affaire.sites?.nom || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Responsable</span>
                    <span className="font-medium">
                      {affaire.ressources?.prenom} {affaire.ressources?.nom}
                    </span>
                  </div>
                  {affaire.num_commande && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">N° Commande</span>
                      <span className="font-mono font-medium">{affaire.num_commande}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Compétence</span>
                    <span className="font-medium">{affaire.competence_principale || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Type contrat</span>
                    {getContratBadge(affaire.type_contrat)}
                  </div>
                </div>
              </div>

              {/* Informations financières */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Informations financières
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Montant total HT</span>
                    <span className="font-bold text-lg">{formatCurrency(affaire.montant_total_ht || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Avancement</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${affaire.avancement_pct || 0}%` }}
                        />
                      </div>
                      <span className="font-medium">{affaire.avancement_pct || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Montant consommé</span>
                    <span className="font-medium">{formatCurrency(affaire.montant_consomme || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Reste à faire</span>
                    <span className="font-medium">{formatCurrency(affaire.reste_a_faire || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Atterrissage</span>
                    <span className="font-medium">{formatCurrency(affaire.atterrissage || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Marge réelle</span>
                    <span className="font-medium">{formatCurrency(affaire.marge_reelle || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Planning
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {affaire.date_debut && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Date début</p>
                    <p className="font-semibold">{new Date(affaire.date_debut).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {affaire.date_fin_prevue && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Date fin prévue</p>
                    <p className="font-semibold">{new Date(affaire.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {affaire.date_fin_reelle && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Date fin réelle</p>
                    <p className="font-semibold">{new Date(affaire.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations BPU si applicable */}
            {affaire.type_affaire === 'BPU' && (
              <div className="space-y-4 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Paramètres BPU
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Capacité totale</p>
                    <p className="text-2xl font-bold text-blue-600">{affaire.heures_capacite || 0}h</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Heures vendues</p>
                    <p className="text-2xl font-bold text-blue-600">{affaire.heures_vendues_total || 0}h</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Heures consommées</p>
                    <p className="text-2xl font-bold text-blue-600">{affaire.heures_consommes_total || 0}h</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Nb. ressources ref.</p>
                    <p className="text-xl font-semibold">{affaire.nb_ressources_ref || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Heures/semaine ref.</p>
                    <p className="text-xl font-semibold">{affaire.heures_semaine_ref || 0}h</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Montant reconnu</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(affaire.montant_reconnu_total || 0)}</p>
                  </div>
                </div>
              </div>
            )}

              </TabsContent>

              <TabsContent value="lots" className="mt-6">
                <LotsFinanciersTable affaireId={affaire.id} />
              </TabsContent>
            </Tabs>

            {/* Bouton fermer */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button onClick={onClose} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

