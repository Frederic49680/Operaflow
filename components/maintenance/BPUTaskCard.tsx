"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, TrendingUp, DollarSign, Plus } from "lucide-react"
import { BPURealizationTile } from "./BPURealizationTile"

interface BPUParapluie {
  tache_id: string
  affaire_id: string
  code_affaire: string
  nom_affaire: string
  site_id: string
  nom_site: string
  heures_capacite: number
  heures_vendues: number
  heures_consommes: number
  montant_reconnu: number
  taux_remplissage_pct: number
  taux_realisation_pct: number
}

interface BPUTaskCardProps {
  parapluie: BPUParapluie
}

export function BPUTaskCard({ parapluie }: BPUTaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    tache_id,
    affaire_id,
    code_affaire,
    nom_site,
    heures_capacite,
    heures_vendues,
    heures_consommes,
    montant_reconnu,
    taux_remplissage_pct,
    taux_realisation_pct,
  } = parapluie

  // Calculer les couleurs selon les taux
  const getRemplissageColor = (taux: number) => {
    if (taux >= 90) return "text-red-600"
    if (taux >= 70) return "text-orange-600"
    if (taux >= 50) return "text-yellow-600"
    return "text-green-600"
  }

  const getRealisationColor = (taux: number) => {
    if (taux >= 100) return "text-green-600"
    if (taux >= 80) return "text-blue-600"
    if (taux >= 50) return "text-yellow-600"
    return "text-orange-600"
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Contrat {code_affaire} — Décharge batterie
              </CardTitle>
              <CardDescription className="text-blue-700 mt-1">
                Site : {nom_site}
              </CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700">
              Parapluie BPU
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Badges KPI */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">Capacité</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {heures_capacite ? `${heures_capacite.toFixed(0)}h` : "-"}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-slate-600">Vendu</span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {heures_vendues ? `${heures_vendues.toFixed(0)}h` : "-"}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-slate-600">Consommé</span>
              </div>
              <div className="text-lg font-bold text-orange-900">
                {heures_consommes ? `${heures_consommes.toFixed(0)}h` : "-"}
              </div>
            </div>
          </div>

          {/* Barres de progression */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Remplissage</span>
                <span className={getRemplissageColor(taux_remplissage_pct || 0)}>
                  {taux_remplissage_pct ? `${taux_remplissage_pct.toFixed(1)}%` : "0%"}
                </span>
              </div>
              <Progress 
                value={taux_remplissage_pct || 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Réalisation</span>
                <span className={getRealisationColor(taux_realisation_pct || 0)}>
                  {taux_realisation_pct ? `${taux_realisation_pct.toFixed(1)}%` : "0%"}
                </span>
              </div>
              <Progress 
                value={taux_realisation_pct || 0} 
                className="h-2"
              />
            </div>
          </div>

          {/* Montant reconnu */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-slate-600">€ Reconnu</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {montant_reconnu ? `${montant_reconnu.toFixed(2)}€` : "0.00€"}
            </div>
          </div>

          {/* Bouton action */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle réalisation BPU
          </Button>
        </CardContent>
      </Card>

      {/* Modal de saisie */}
      {isModalOpen && (
        <BPURealizationTile
          affaireId={affaire_id}
          tacheId={tache_id}
          codeAffaire={code_affaire}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

