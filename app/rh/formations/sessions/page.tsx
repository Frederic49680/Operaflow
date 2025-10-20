"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Search, Download, Filter, Users, Euro, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SessionsTable } from "@/components/formations/SessionsTable"
import { SessionFormModal } from "@/components/formations/SessionFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("")
  const [filterFormation, setFilterFormation] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [formations, setFormations] = useState<any[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    ouvertes: 0,
    fermees: 0,
    realisees: 0,
    totalCapacite: 0
  })

  useEffect(() => {
    loadFormations()
    loadStats()
    window.addEventListener('session-created', loadStats)
    return () => window.removeEventListener('session-created', loadStats)
  }, [])

  const loadFormations = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_catalogue')
        .select('id, code, libelle')
        .eq('actif', true)
        .order('libelle')
      
      if (error) throw error
      setFormations(data || [])
    } catch (err) {
      console.error('Erreur chargement formations:', err)
    }
  }

  const loadStats = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_sessions')
        .select('statut, capacite')
      
      if (error) throw error
      
      const total = data?.length || 0
      const ouvertes = data?.filter(s => s.statut === 'Ouverte').length || 0
      const fermees = data?.filter(s => s.statut === 'Fermée').length || 0
      const realisees = data?.filter(s => s.statut === 'Réalisée').length || 0
      const totalCapacite = data?.reduce((sum, s) => sum + (s.capacite || 0), 0) || 0
      
      setStats({ total, ouvertes, fermees, realisees, totalCapacite })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    }
  }

  const handleExport = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_sessions')
        .select(`
          *,
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom),
          site:site_id(nom)
        `)
        .order('date_debut', { ascending: false })
      
      if (error) throw error
      
      // Convertir en CSV
      const csvHeaders = ['Formation', 'Organisme', 'Site', 'Lieu', 'Date début', 'Date fin', 'Capacité', 'Coût session', 'Statut']
      const csvRows = (data || []).map((s: any) => {
        return [
          s.formation?.libelle || '',
          s.organisme?.nom || '',
          s.site?.nom || '',
          s.lieu || '',
          s.date_debut || '',
          s.date_fin || '',
          s.capacite || '',
          s.cout_session_ht || '',
          s.statut || ''
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
      link.download = `sessions_formation_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export sessions:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export des sessions' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Sessions de Formation
                </h1>
                <p className="text-sm text-slate-600">Gestion des sessions collectives de formation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Ouvertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.ouvertes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-900">Fermées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.fermees}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Réalisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.realisees}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-indigo-900">Capacité Totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.totalCapacite}</div>
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
                  placeholder="Rechercher une session..."
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
              <SessionFormModal onSuccess={loadStats}>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Nouvelle session
                </Button>
              </SessionFormModal>
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
                    <option value="Ouverte">Ouverte</option>
                    <option value="Fermée">Fermée</option>
                    <option value="Réalisée">Réalisée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Formation</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterFormation}
                    onChange={(e) => setFilterFormation(e.target.value)}
                  >
                    <option value="">Toutes les formations</option>
                    {formations.map(form => (
                      <option key={form.id} value={form.id}>
                        {form.code} - {form.libelle}
                      </option>
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
            <CardTitle>Liste des sessions</CardTitle>
            <CardDescription>Sessions de formation collectives</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsTable 
              searchTerm={searchTerm}
              filterStatut={filterStatut}
              filterFormation={filterFormation}
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

