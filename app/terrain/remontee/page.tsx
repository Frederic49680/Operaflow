"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Plus, Search, Download, Filter, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RemonteesTable } from "@/components/terrain/RemonteesTable"
import { RemonteeFormModal } from "@/components/terrain/RemonteeFormModal"
import AffairesListWithTiles from "@/components/terrain/AffairesListWithTiles"
import BlocageGeneralModal from "@/components/terrain/BlocageGeneralModal"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function RemonteePage() {
  const [stats, setStats] = useState({
    nbRemonteesJour: 0,
    nbAConfirmer: 0,
    nbBloquees: 0,
    heuresMetal: 0,
  })

  // Charger les stats
  const loadStats = async () => {
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      // Remontées du jour
      const { count: nbRemontees } = await supabase
        .from("remontee_site")
        .select("*", { count: "exact", head: true })
        .eq("date_saisie", today)

      // À confirmer - Tâches "En cours" qui n'ont pas encore de remontée journalière aujourd'hui
      const { data: tasksEnCours } = await supabase
        .from("planning_taches")
        .select("id")
        .eq("statut", "En cours")

      const { data: remonteesAujourdhui } = await supabase
        .from("remontee_site")
        .select("tache_id")
        .eq("date_saisie", today)
        .gt("avancement_pct", 0)

      const tasksAvecRemontee = remonteesAujourdhui?.map(r => r.tache_id) || []
      const nbAConfirmer = (tasksEnCours?.filter(t => !tasksAvecRemontee.includes(t.id)).length || 0)

      // Tâches bloquées
      const { count: nbBloquees } = await supabase
        .from("remontee_site")
        .select("*", { count: "exact", head: true })
        .eq("date_saisie", today)
        .in("statut_reel", ["Bloquée", "Suspendue"])

      // Heures métal
      const { data: remonteesMetal } = await supabase
        .from("remontee_site")
        .select("heures_metal")
        .eq("date_saisie", today)

      const heuresMetal = remonteesMetal?.reduce((sum, r) => sum + (r.heures_metal || 0), 0) || 0

      setStats({
        nbRemonteesJour: nbRemontees || 0,
        nbAConfirmer: nbAConfirmer || 0,
        nbBloquees: nbBloquees || 0,
        heuresMetal: heuresMetal,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  useEffect(() => {
    loadStats()
    // Rafraîchir les stats toutes les minutes
    const interval = setInterval(loadStats, 60000)
    return () => clearInterval(interval)
  }, [])


  const handleExport = () => {
    toast.info("Fonctionnalité d'export en cours de développement")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Remontées Terrain
              </h2>
              <p className="text-slate-600">Suivi quotidien des activités</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Remontées du jour
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.nbRemonteesJour}</div>
              <p className="text-xs text-slate-500 mt-1">
                Enregistrées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                À confirmer
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-yellow-500/30">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.nbAConfirmer > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>
                {stats.nbAConfirmer}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                En attente
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Tâches bloquées
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/30">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.nbBloquees > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.nbBloquees}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Blocages actifs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Temps métal (h)
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.heuresMetal.toFixed(1)}</div>
              <p className="text-xs text-slate-500 mt-1">
                Heures productives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Vue Liste & Tuiles */}
        <div className="space-y-6">
          {/* En-tête avec actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Affaires & Tâches du jour</h3>
              <p className="text-sm text-slate-600">Vue liste et tuiles interactives</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <BlocageGeneralModal sites={[]} affaires={[]} />
            </div>
          </div>

          {/* Composant principal */}
          <AffairesListWithTiles onRefresh={loadStats} />
        </div>
      </main>
    </div>
  )
}

