"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Plus, Search, Download, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TarifsTable } from "@/components/formations/TarifsTable"
import { TarifFormModal } from "@/components/formations/TarifFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

export default function TarifsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOrganisme, setFilterOrganisme] = useState<string>("")
  const [filterFormation, setFilterFormation] = useState<string>("")
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    groupes: 0
  })

  useEffect(() => {
    loadStats()
    window.addEventListener('tarif-created', loadStats)
    return () => window.removeEventListener('tarif-created', loadStats)
  }, [])

  const loadStats = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('formations_tarifs')
        .select('id, actif, cout_session')
      
      if (error) throw error
      
      setStats({
        total: data?.length || 0,
        actifs: data?.filter(t => t.actif).length || 0,
        groupes: data?.filter(t => t.cout_session).length || 0
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
        .from('formations_tarifs')
        .select(`
          *,
          formation:formation_id(code, libelle),
          organisme:organisme_id(nom)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Convertir en CSV
      const csvHeaders = ['Formation', 'Organisme', 'Modalité', 'Prix unitaire', 'Prix groupe', 'Capacité max', 'Frais déplacement', 'TVA', 'Date début', 'Date fin', 'Actif']
      const csvRows = (data || []).map((t: any) => {
        return [
          t.formation?.libelle || '',
          t.organisme?.nom || '',
          t.modalite || '',
          t.cout_unitaire || '',
          t.cout_session || '',
          t.capacite_max || '',
          t.frais_deplacement || '',
          t.tva || '',
          t.date_debut || '',
          t.date_fin || '',
          t.actif ? 'Oui' : 'Non'
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
      link.download = `tarifs_formations_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export tarifs:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export des tarifs' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Tarifs Formations
                </h1>
                <p className="text-sm text-slate-600">Gestion des grilles tarifaires des organismes</p>
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
              <CardTitle className="text-sm font-medium text-blue-900">Total Tarifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Tarifs Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.actifs}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Tarifs Groupe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.groupes}</div>
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
                  placeholder="Rechercher un tarif..."
                  className="w-full pl-10 border-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <TarifFormModal onSuccess={loadStats}>
                <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Nouveau tarif
                </Button>
              </TarifFormModal>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des tarifs</CardTitle>
            <CardDescription>Grilles tarifaires des formations par organisme</CardDescription>
          </CardHeader>
          <CardContent>
            <TarifsTable 
              searchTerm={searchTerm}
              filterOrganisme={filterOrganisme}
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

