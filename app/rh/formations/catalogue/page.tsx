"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Search, Download, Upload, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CatalogueTable } from "@/components/formations/CatalogueTable"
import { FormationFormModal } from "@/components/formations/FormationFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

export default function CataloguePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterModalite, setFilterModalite] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    habilitantes: 0,
    techniques: 0
  })

  useEffect(() => {
    loadStats()
    window.addEventListener('formation-created', loadStats)
    return () => window.removeEventListener('formation-created', loadStats)
  }, [])

  const loadStats = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_catalogue')
        .select('id, type_formation')
      
      if (error) throw error
      
      setStats({
        total: data?.length || 0,
        habilitantes: data?.filter(f => f.type_formation === 'Habilitante').length || 0,
        techniques: data?.filter(f => f.type_formation === 'Technique').length || 0
      })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    }
  }

  const handleExport = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_catalogue')
        .select(`
          *,
          organisme_defaut:organisme_defaut_id(nom)
        `)
        .order('libelle')
      
      if (error) throw error
      
      // Filtrer les données
      let filteredData = data || []
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((f: any) => {
          return (
            f.code?.toLowerCase().includes(searchLower) ||
            f.libelle?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      if (filterType) {
        filteredData = filteredData.filter((f: any) => f.type_formation === filterType)
      }
      
      if (filterModalite) {
        filteredData = filteredData.filter((f: any) => f.modalite === filterModalite)
      }
      
      // Convertir en CSV
      const csvHeaders = ['Code', 'Libellé', 'Type', 'Durée (h)', 'Validité (mois)', 'Modalité', 'Organisme par défaut', 'Actif']
      const csvRows = filteredData.map((f: any) => {
        return [
          f.code || '',
          f.libelle || '',
          f.type_formation || '',
          f.duree_heures || '',
          f.validite_mois || '',
          f.modalite || '',
          f.organisme_defaut?.nom || '',
          f.actif ? 'Oui' : 'Non'
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
      link.download = `catalogue_formations_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export catalogue:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export du catalogue' })
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
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Catalogue des Formations
                </h1>
                <p className="text-sm text-slate-600">Référentiel des formations disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Total Formations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Habilitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.habilitantes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.techniques}</div>
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
                  placeholder="Rechercher une formation..."
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
              <FormationFormModal onSuccess={loadStats}>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Nouvelle formation
                </Button>
              </FormationFormModal>
            </div>
          </CardContent>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type de formation</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    <option value="Habilitante">Habilitante</option>
                    <option value="Technique">Technique</option>
                    <option value="QSE">QSE</option>
                    <option value="CACES">CACES</option>
                    <option value="SST">SST</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Modalité</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterModalite}
                    onChange={(e) => setFilterModalite(e.target.value)}
                  >
                    <option value="">Toutes les modalités</option>
                    <option value="Présentiel">Présentiel</option>
                    <option value="Distanciel">Distanciel</option>
                    <option value="E-learning">E-learning</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des formations</CardTitle>
            <CardDescription>Gérez le catalogue des formations disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <CatalogueTable 
              searchTerm={searchTerm}
              filterType={filterType}
              filterModalite={filterModalite}
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

