"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Search, Download, Filter, TrendingUp, Users, Euro } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PlanTable } from "@/components/formations/PlanTable"
import { SemaineFormationModal } from "@/components/formations/SemaineFormationModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

export default function PlanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("")
  const [filterSite, setFilterSite] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [sites, setSites] = useState<any[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    previsionnel: 0,
    valide: 0,
    realise: 0,
    coutTotalPrevu: 0,
    coutTotalRealise: 0
  })

  useEffect(() => {
    loadSites()
    loadStats()
    window.addEventListener('plan-created', loadStats)
    return () => window.removeEventListener('plan-created', loadStats)
  }, [])

  const loadSites = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('sites')
        .select('id, nom')
        .in('statut', ['Actif', 'En pause'])
        .order('nom')
      
      if (error) throw error
      setSites(data || [])
    } catch (err) {
      console.error('Erreur chargement sites:', err)
    }
  }

  const loadStats = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('plan_formation_ressource')
        .select('statut, cout_prevu_ht, cout_realise_ht')
      
      if (error) throw error
      
      const total = data?.length || 0
      const previsionnel = data?.filter(p => p.statut === 'Prévisionnel').length || 0
      const valide = data?.filter(p => p.statut === 'Validé').length || 0
      const realise = data?.filter(p => p.statut === 'Réalisé').length || 0
      const coutTotalPrevu = data?.reduce((sum, p) => sum + (p.cout_prevu_ht || 0), 0) || 0
      const coutTotalRealise = data?.reduce((sum, p) => sum + (p.cout_realise_ht || 0), 0) || 0
      
      setStats({ total, previsionnel, valide, realise, coutTotalPrevu, coutTotalRealise })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    }
  }

  const handleExport = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('plan_formation_ressource')
        .select(`
          *,
          ressource:collaborateur_id(nom, prenom, site_id),
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom)
        `)
        .order('date_debut')
      
      if (error) throw error
      
      // Filtrer les données
      let filteredData = data || []
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((p: any) => {
          return (
            p.ressource?.nom?.toLowerCase().includes(searchLower) ||
            p.ressource?.prenom?.toLowerCase().includes(searchLower) ||
            p.formation?.libelle?.toLowerCase().includes(searchLower) ||
            p.organisme?.nom?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      if (filterStatut) {
        filteredData = filteredData.filter((p: any) => p.statut === filterStatut)
      }
      
      // Convertir en CSV
      const csvHeaders = ['Ressource', 'Formation', 'Organisme', 'Semaine ISO', 'Date Début', 'Date Fin', 'Modalité', 'Statut', 'Coût Prévu HT', 'Coût Réalisé HT']
      const csvRows = filteredData.map((p: any) => {
        const ressource = `${p.ressource?.prenom || ''} ${p.ressource?.nom || ''}`.trim()
        return [
          ressource,
          p.formation?.libelle || '',
          p.organisme?.nom || '',
          p.semaine_iso || '',
          p.date_debut || '',
          p.date_fin || '',
          p.modalite || '',
          p.statut || '',
          p.cout_prevu_ht || 0,
          p.cout_realise_ht || 0
        ].map(field => `"${field}"`).join(',')
      })
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')
      const BOM = '\uFEFF'
      const csv = BOM + csvContent
      
      // Télécharger
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `plan_formation_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export plan:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export du plan' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Plan Prévisionnel
                </h1>
                <p className="text-sm text-slate-600">Planification des formations par ressource</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Total Semaines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-900">Prévisionnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.previsionnel}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Validé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.valide}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Réalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.realise}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-indigo-900">Coût Prévu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.coutTotalPrevu)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-900">Coût Réalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.coutTotalRealise)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  className="w-full pl-10 border-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <SemaineFormationModal onSuccess={loadStats}>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Planifier une formation
                </Button>
              </SemaineFormationModal>
            </div>
          </CardContent>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Statut</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="Prévisionnel">Prévisionnel</option>
                    <option value="Validé">Validé</option>
                    <option value="Réalisé">Réalisé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Site</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterSite}
                    onChange={(e) => setFilterSite(e.target.value)}
                  >
                    <option value="">Tous les sites</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des semaines de formation</CardTitle>
            <CardDescription>Planification et suivi des formations</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanTable 
              searchTerm={searchTerm}
              filterStatut={filterStatut}
              filterSite={filterSite}
            />
          </CardContent>
        </Card>
      </main>

      {/* Toast notifications */}
      {toast && (
        toast.type === 'success' ? (
          <SuccessToast 
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : (
          <ErrorToast 
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )
      )}
    </div>
  )
}

