"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Search, Download, Upload, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { OrganismesTable } from "@/components/formations/OrganismesTable"
import { OrganismeFormModal } from "@/components/formations/OrganismeFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

interface Organisme {
  id: string
  nom: string
  siret?: string
  contact?: string
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  domaines?: string[]
  agrement?: string
  actif: boolean
}

export default function OrganismesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactiveOrganismes, setShowInactiveOrganismes] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    inactifs: 0
  })

  useEffect(() => {
    loadStats()
    window.addEventListener('organisme-created', loadStats)
    return () => window.removeEventListener('organisme-created', loadStats)
  }, [])

  const loadStats = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('organismes_formation')
        .select('id, actif')
      
      if (error) throw error
      
      setStats({
        total: data?.length || 0,
        actifs: data?.filter(o => o.actif).length || 0,
        inactifs: data?.filter(o => !o.actif).length || 0
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
        .from('organismes_formation')
        .select('*')
        .order('nom')
      
      if (error) throw error
      
      // Filtrer les données
      let filteredData = data || []
      
      if (!showInactiveOrganismes) {
        filteredData = filteredData.filter((o: any) => o.actif)
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((o: any) => {
          return (
            o.nom?.toLowerCase().includes(searchLower) ||
            o.siret?.toLowerCase().includes(searchLower) ||
            o.contact?.toLowerCase().includes(searchLower) ||
            o.email?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      // Convertir en CSV
      const csvHeaders = ['Nom', 'SIRET', 'Contact', 'Email', 'Téléphone', 'Adresse', 'Code Postal', 'Ville', 'Domaines', 'Agrément', 'Actif']
      const csvRows = filteredData.map((o: any) => {
        return [
          o.nom || '',
          o.siret || '',
          o.contact || '',
          o.email || '',
          o.telephone || '',
          o.adresse || '',
          o.code_postal || '',
          o.ville || '',
          o.domaines?.join('; ') || '',
          o.agrement || '',
          o.actif ? 'Oui' : 'Non'
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
      link.download = `organismes_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export organismes:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export des organismes' })
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
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Organismes de Formation
                </h1>
                <p className="text-sm text-slate-600">Gestion des organismes de formation partenaires</p>
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
              <CardTitle className="text-sm font-medium text-blue-900">Total Organismes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.actifs}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-900">Inactifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-600">{stats.inactifs}</div>
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
                  placeholder="Rechercher un organisme..."
                  className="w-full pl-10 border-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant={showInactiveOrganismes ? "default" : "outline"}
                size="sm" 
                className={`gap-2 ${showInactiveOrganismes ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setShowInactiveOrganismes(!showInactiveOrganismes)}
              >
                {showInactiveOrganismes ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Inactifs visibles
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Masquer inactifs
                  </>
                )}
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
              <OrganismeFormModal onSuccess={loadStats}>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Nouvel organisme
                </Button>
              </OrganismeFormModal>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des organismes</CardTitle>
            <CardDescription>Gérez les organismes de formation partenaires</CardDescription>
          </CardHeader>
          <CardContent>
            <OrganismesTable 
              searchTerm={searchTerm}
              showInactiveOrganismes={showInactiveOrganismes}
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

