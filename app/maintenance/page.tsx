"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Plus, Search, Download, Filter, CheckCircle, Clock, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable"
import { MaintenanceFormModal } from "@/components/maintenance/MaintenanceFormModal"
import { BPUTaskCard } from "@/components/maintenance/BPUTaskCard"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function MaintenancePage() {
  const [parapluies, setParapluies] = useState<BPUParapluie[]>([])
  const [loadingBPU, setLoadingBPU] = useState(true)

  useEffect(() => {
    const fetchParapluies = async () => {
      try {
        setLoadingBPU(true)
        const response = await fetch("/api/bpu/parapluies")
        if (response.ok) {
          const data = await response.json()
          setParapluies(data)
        }
      } catch (error) {
        console.error("Erreur chargement parapluies BPU:", error)
      } finally {
        setLoadingBPU(false)
      }
    }

    fetchParapluies()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
                <span className="text-white text-lg font-bold">OF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">OperaFlow</h1>
                <p className="text-sm text-slate-500">Pilotage Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1.5 shadow-sm">Admin</Badge>
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all">
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Journal Maintenance
              </h2>
              <p className="text-slate-600">Suivi des interventions de l'après-midi (14h-18h)</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Interventions du jour
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Wrench className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                Enregistrées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                En cours
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                Interventions actives
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Batteries terminées
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                Ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Temps métal (h)
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Wrench className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                Heures productives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section BPU */}
        {parapluies.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Affaires BPU actives</h3>
                <p className="text-sm text-slate-600">Saisie guidée des réalisations BPU</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parapluies.map((parapluie) => (
                <BPUTaskCard key={parapluie.tache_id} parapluie={parapluie} />
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Journal de l'après-midi</CardTitle>
                <CardDescription>
                  Enregistrez vos interventions de maintenance (14h-18h)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="w-64 pl-10 border-slate-300"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                <MaintenanceFormModal>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouvelle intervention
                  </Button>
                </MaintenanceFormModal>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MaintenanceTable />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

