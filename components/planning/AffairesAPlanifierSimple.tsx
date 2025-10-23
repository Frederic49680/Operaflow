"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  Search, 
  Plus,
  Building,
  User,
  Euro,
  Clock
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Affaire {
  id: string
  code_affaire: string
  nom: string
  site_nom: string
  responsable_nom: string
  type_contrat: string
  type_affaire?: string
  montant_total_ht: number
  statut: string
  date_debut?: string
  date_fin_prevue?: string
  nb_lots_financiers: number
  montant_lots_ht: number
}

export default function AffairesAPlanifierSimple() {
  const [affaires, setAffaires] = useState<Affaire[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadAffaires = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('affaires')
        .select(`
          *,
          sites!inner(nom),
          ressources!inner(nom, prenom)
        `)
        .eq('statut', 'A_planifier')
        .order('date_creation', { ascending: false })

      if (error) throw error

      const affairesWithRelations = data?.map(affaire => ({
        ...affaire,
        site_nom: affaire.sites?.nom || 'N/A',
        responsable_nom: `${affaire.ressources?.prenom || ''} ${affaire.ressources?.nom || ''}`.trim() || 'N/A'
      })) || []

      setAffaires(affairesWithRelations)
    } catch (error) {
      console.error('Erreur lors du chargement des affaires:', error)
      toast.error("Erreur lors du chargement des affaires")
    } finally {
      setLoading(false)
    }
  }

  const handleDeclarePlanification = async (affaireId: string) => {
    try {
      const supabase = createClient()

      // Récupérer les données de l'affaire pour vérifier si c'est BPU
      const { data: affaire, error: affaireError } = await supabase
        .from('affaires')
        .select('*')
        .eq('id', affaireId)
        .single()

      if (affaireError) throw affaireError

      // Si c'est une affaire BPU, créer automatiquement la tâche parapluie
      if (affaire.type_affaire === 'BPU') {
        console.log('Affaire BPU détectée, création automatique de la tâche parapluie')
        
        // Créer la tâche parapluie BPU
        const { error: taskError } = await supabase
          .from('planning_taches')
          .insert({
            libelle_tache: `[PARAPLUIE BPU] ${affaire.nom}`,
            affaire_id: affaireId,
            site_id: affaire.site_id,
            date_debut_plan: affaire.periode_debut || affaire.date_debut || new Date().toISOString().split('T')[0],
            date_fin_plan: affaire.periode_fin || affaire.date_fin_prevue || new Date().toISOString().split('T')[0],
            effort_plan_h: affaire.heures_capacite || 0,
            effort_reel_h: 0,
            avancement_pct: 0,
            statut: 'Non lancé',
            type_tache: 'Autre',
            competence: affaire.competence_principale || null,
            ressource_ids: [],
            is_parapluie_bpu: true,
            level: 0,
            order_index: 0,
            created_by: null,
            date_creation: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (taskError) {
          console.error('Erreur création tâche parapluie:', taskError)
          throw taskError
        }

        console.log('Tâche parapluie BPU créée avec succès')
      }

      // Mettre à jour le statut de l'affaire
      const { error } = await supabase
        .from('affaires')
        .update({ statut: 'Validee' })
        .eq('id', affaireId)

      if (error) throw error

      const message = affaire.type_affaire === 'BPU' 
        ? "Affaire BPU planifiée automatiquement avec tâche parapluie"
        : "Affaire déclarée en planification"
      
      toast.success(message)
      await loadAffaires()
    } catch (error) {
      console.error('Erreur lors de la déclaration:', error)
      toast.error("Erreur lors de la déclaration de planification")
    }
  }

  const filteredAffaires = affaires.filter(affaire =>
    affaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affaire.code_affaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affaire.site_nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    loadAffaires()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des affaires...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Affaires en Attente de Planification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une affaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des affaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAffaires.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                {searchTerm 
                  ? "Aucune affaire ne correspond aux critères de recherche"
                  : "Aucune affaire en attente de planification"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAffaires.map(affaire => (
            <Card key={affaire.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{affaire.nom}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {affaire.code_affaire}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      À Planifier
                    </Badge>
                    {affaire.type_affaire === 'BPU' && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        BPU
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Informations de base */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{affaire.site_nom}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{affaire.responsable_nom}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span>{affaire.montant_total_ht.toLocaleString()} € HT</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{affaire.nb_lots_financiers} lot(s) financier(s)</span>
                  </div>
                </div>

                {/* Dates */}
                {(affaire.date_debut || affaire.date_fin_prevue) && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Dates prévues :</h4>
                    <div className="text-sm text-gray-600">
                      {affaire.date_debut && (
                        <div>Début: {new Date(affaire.date_debut).toLocaleDateString()}</div>
                      )}
                      {affaire.date_fin_prevue && (
                        <div>Fin: {new Date(affaire.date_fin_prevue).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bouton d'action */}
                <div className="pt-3 border-t">
                  <Button 
                    onClick={() => handleDeclarePlanification(affaire.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {affaire.type_affaire === 'BPU' 
                      ? "Planifier automatiquement (BPU)" 
                      : "Déclarer la Planification"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
