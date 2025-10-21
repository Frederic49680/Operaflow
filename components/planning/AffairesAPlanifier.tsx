"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  Play,
  FileText,
  Search,
  Filter
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface AffaireAPlanifier {
  id: string
  code_affaire: string
  libelle_affaire: string
  site_nom: string
  responsable_nom: string
  date_debut_prevue: string
  date_fin_prevue: string
  type_contrat: string
  montant_total_ht: number
  statut: string
  competence_principale: string
  lots_count: number
}

export default function AffairesAPlanifier() {
  const [affaires, setAffaires] = useState<AffaireAPlanifier[]>([])
  const [filteredAffaires, setFilteredAffaires] = useState<AffaireAPlanifier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSite, setSelectedSite] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    loadAffaires()
  }, [])

  useEffect(() => {
    let filtered = affaires

    if (searchTerm) {
      filtered = filtered.filter(affaire =>
        affaire.code_affaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affaire.libelle_affaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affaire.responsable_nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSite !== "all") {
      filtered = filtered.filter(affaire => affaire.site_nom === selectedSite)
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(affaire => affaire.type_contrat === selectedType)
    }

    setFilteredAffaires(filtered)
  }, [affaires, searchTerm, selectedSite, selectedType])

  const loadAffaires = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('affaires')
        .select(`
          id,
          code_affaire,
          libelle_affaire,
          date_debut_prevue,
          date_fin_prevue,
          type_contrat,
          montant_total_ht,
          statut,
          competence_principale,
          sites!inner(nom),
          ressources!inner(nom, prenom),
          affaires_lots(id)
        `)
        .eq('statut', 'A_planifier')
        .order('date_debut_prevue')

      if (error) throw error

      const formattedData = data?.map((affaire: any) => ({
        id: affaire.id,
        code_affaire: affaire.code_affaire,
        libelle_affaire: affaire.libelle_affaire,
        site_nom: affaire.sites?.nom || 'N/A',
        responsable_nom: `${affaire.ressources?.prenom || ''} ${affaire.ressources?.nom || ''}`.trim() || 'N/A',
        date_debut_prevue: affaire.date_debut_prevue,
        date_fin_prevue: affaire.date_fin_prevue,
        type_contrat: affaire.type_contrat,
        montant_total_ht: affaire.montant_total_ht,
        statut: affaire.statut,
        competence_principale: affaire.competence_principale,
        lots_count: affaire.affaires_lots?.length || 0
      })) || []

      setAffaires(formattedData)
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
      
      // Mettre à jour le statut de l'affaire
      const { error: updateError } = await supabase
        .from('affaires')
        .update({ statut: 'Validee' })
        .eq('id', affaireId)

      if (updateError) throw updateError

      // Créer une tâche parapluie pour l'affaire
      const { error: taskError } = await supabase
        .from('planning_taches')
        .insert({
          libelle_tache: `Projet ${affaireId}`,
          affaire_id: affaireId,
          level: 0,
          date_debut_plan: new Date().toISOString().split('T')[0],
          date_fin_plan: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
          statut: 'Non lancé',
          order_index: Date.now()
        })

      if (taskError) throw taskError

      toast.success("Affaire déclarée en planification")
      loadAffaires()
    } catch (error) {
      console.error('Erreur lors de la déclaration:', error)
      toast.error("Erreur lors de la déclaration")
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Forfait': return 'bg-green-100 text-green-800'
      case 'Régie': return 'bg-blue-100 text-blue-800'
      case 'BPU': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompetenceColor = (competence: string) => {
    switch (competence) {
      case 'Électricité': return 'bg-yellow-100 text-yellow-800'
      case 'IEG': return 'bg-red-100 text-red-800'
      case 'CVC': return 'bg-cyan-100 text-cyan-800'
      case 'Sûreté': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des affaires...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Affaires à Planifier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher une affaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les sites</option>
              {Array.from(new Set(affaires.map(a => a.site_nom))).map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les types</option>
              <option value="Forfait">Forfait</option>
              <option value="Régie">Régie</option>
              <option value="BPU">BPU</option>
            </select>

            <Button onClick={loadAffaires} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des affaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAffaires.map((affaire) => (
          <Card key={affaire.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{affaire.code_affaire}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{affaire.libelle_affaire}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {affaire.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{affaire.site_nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{affaire.responsable_nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(affaire.date_debut_prevue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(affaire.date_fin_prevue)}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeColor(affaire.type_contrat)}>
                    {affaire.type_contrat}
                  </Badge>
                  <Badge className={getCompetenceColor(affaire.competence_principale)}>
                    {affaire.competence_principale}
                  </Badge>
                  <Badge variant="outline">
                    {affaire.lots_count} lot{affaire.lots_count > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Montant */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Montant HT</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(affaire.montant_total_ht)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleDeclarePlanification(affaire.id)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Déclarer la planification
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucune affaire */}
      {filteredAffaires.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSite !== "all" || selectedType !== "all" 
                ? "Aucune affaire trouvée" 
                : "Aucune affaire en attente de planification"}
            </p>
            {!searchTerm && selectedSite === "all" && selectedType === "all" && (
              <p className="text-sm text-gray-400">
                Les affaires avec le statut "A_planifier" apparaîtront ici
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
