"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, TrendingUp, DollarSign, Download, AlertCircle } from "lucide-react"

interface BPUSuivi {
  affaire_id: string
  code_affaire: string
  type_affaire: string
  heures_capacite: number
  heures_vendues: number
  heures_consommes: number
  montant_reconnu: number
  ecart_heures: number
  taux_remplissage_pct: number
  taux_realisation_pct: number
}

interface BPULivraison {
  realisation_id: string
  date_jour: string
  tranche: number
  systeme_elementaire: string
  libelle_bpu: string
  etat_reel: string
  heures_metal: number
  montant_realisation: number
  motif?: string
}

interface AffaireBPUOverviewProps {
  affaireId: string
}

export function AffaireBPUOverview({ affaireId }: AffaireBPUOverviewProps) {
  const [suivi, setSuivi] = useState<BPUSuivi | null>(null)
  const [livraisons, setLivraisons] = useState<BPULivraison[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Charger le suivi
        const suiviResponse = await fetch(`/api/bpu/suivi?affaire_id=${affaireId}`)
        if (suiviResponse.ok) {
          const suiviData = await suiviResponse.json()
          setSuivi(suiviData)
        }
        
        // Charger les livraisons
        const livraisonsResponse = await fetch(`/api/bpu/livraisons?affaire_id=${affaireId}`)
        if (livraisonsResponse.ok) {
          const livraisonsData = await livraisonsResponse.json()
          setLivraisons(livraisonsData)
        }
      } catch (error) {
        console.error("Erreur chargement données BPU:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [affaireId])

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case "Termine":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminée</Badge>
      case "En_cours":
        return <Badge className="bg-blue-500 hover:bg-blue-600">En cours</Badge>
      case "Reportee":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reportée</Badge>
      case "Suspendue":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspendue</Badge>
      case "Prolongee":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Prolongée</Badge>
      default:
        return <Badge>{etat}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-slate-500">Chargement des données BPU...</div>
        </CardContent>
      </Card>
    )
  }

  if (!suivi) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Aucune donnée BPU disponible pour cette affaire
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Capacité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {suivi.heures_capacite ? `${suivi.heures_capacite.toFixed(0)}h` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Heures disponibles</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Vendu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {suivi.heures_vendues ? `${suivi.heures_vendues.toFixed(0)}h` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Heures vendues</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Consommé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {suivi.heures_consommes ? `${suivi.heures_consommes.toFixed(0)}h` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Heures réalisées</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Reconnu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {suivi.montant_reconnu ? `${suivi.montant_reconnu.toFixed(2)}€` : "0.00€"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Montant reconnu</p>
          </CardContent>
        </Card>
      </div>

      {/* Barres de progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Suivi BPU</CardTitle>
          <CardDescription>Remplissage et réalisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-slate-700 mb-2">
              <span>Remplissage</span>
              <span className="font-semibold">
                {suivi.taux_remplissage_pct ? `${suivi.taux_remplissage_pct.toFixed(1)}%` : "0%"}
              </span>
            </div>
            <Progress value={suivi.taux_remplissage_pct || 0} className="h-3" />
            <p className="text-xs text-slate-500 mt-1">
              {suivi.heures_consommes.toFixed(0)}h / {suivi.heures_capacite.toFixed(0)}h
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm text-slate-700 mb-2">
              <span>Réalisation</span>
              <span className="font-semibold">
                {suivi.taux_realisation_pct ? `${suivi.taux_realisation_pct.toFixed(1)}%` : "0%"}
              </span>
            </div>
            <Progress value={suivi.taux_realisation_pct || 0} className="h-3" />
            <p className="text-xs text-slate-500 mt-1">
              {suivi.heures_consommes.toFixed(0)}h / {suivi.heures_vendues.toFixed(0)}h
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réalisations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Réalisations BPU</CardTitle>
              <CardDescription>Journal des livraisons</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {livraisons.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucune réalisation enregistrée
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tranche</TableHead>
                    <TableHead className="font-semibold text-slate-700">Système Élémentaire</TableHead>
                    <TableHead className="font-semibold text-slate-700">Libellé BPU</TableHead>
                    <TableHead className="font-semibold text-slate-700">État</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">H. Métal</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">€ Reconnu</TableHead>
                    <TableHead className="font-semibold text-slate-700">Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {livraisons.map((liv) => (
                    <TableRow key={liv.realisation_id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-600">
                        {new Date(liv.date_jour).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {liv.tranche}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-slate-900">
                        {liv.systeme_elementaire}
                      </TableCell>
                      <TableCell className="text-slate-600">{liv.libelle_bpu}</TableCell>
                      <TableCell>{getEtatBadge(liv.etat_reel)}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {liv.heures_metal}h
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {liv.montant_realisation > 0 ? `${liv.montant_realisation.toFixed(2)}€` : "-"}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-xs truncate">
                        {liv.motif || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

