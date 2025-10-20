"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Search, Download, Upload, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SitesTable } from "@/components/sites/SitesTable"
import { SiteFormModal } from "@/components/sites/SiteFormModal"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"

export default function SitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showClosedSites, setShowClosedSites] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    actifs: 0,
    enPause: 0,
    fermes: 0
  })

  useEffect(() => {
    loadStats()
    
    // Recharger les stats quand un site est créé/modifié
    const handleSiteCreated = () => {
      loadStats()
    }
    
    window.addEventListener('site-created', handleSiteCreated)
    return () => window.removeEventListener('site-created', handleSiteCreated)
  }, [])

  const loadStats = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sites')
        .select('statut')
      
      if (error) throw error
      
      const actifs = data?.filter(s => s.statut === 'Actif').length || 0
      const enPause = data?.filter(s => s.statut === 'En pause').length || 0
      const fermes = data?.filter(s => s.statut === 'Fermé').length || 0
      
      setStats({ actifs, enPause, fermes })
    } catch (err) {
      console.error('Erreur chargement stats sites:', err)
    }
  }

  const handleExport = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sites')
        .select(`
          code_site,
          nom,
          statut,
          responsable_id:ressources (
            nom,
            prenom
          )
        `)
        .order('nom')
      
      if (error) throw error
      
      // Filtrer les sites fermés si nécessaire
      let filteredData = data || []
      if (!showClosedSites) {
        filteredData = filteredData.filter((site: any) => site.statut !== 'Fermé')
      }
      
      // Filtrer par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((site: any) => {
          const responsable = site.responsable_id && site.responsable_id[0]
            ? `${site.responsable_id[0].prenom || ''} ${site.responsable_id[0].nom || ''}`.trim()
            : ''
          return (
            site.code_site.toLowerCase().includes(searchLower) ||
            site.nom.toLowerCase().includes(searchLower) ||
            responsable.toLowerCase().includes(searchLower)
          )
        })
      }
      
      // Convertir en CSV
      const csvHeaders = ['Code Site', 'Nom', 'Responsable', 'Statut']
      const csvRows = filteredData.map((site: any) => {
        const responsable = site.responsable_id && site.responsable_id[0]
          ? `${site.responsable_id[0].prenom || ''} ${site.responsable_id[0].nom || ''}`.trim()
          : 'N/A'
        return [
          site.code_site,
          site.nom,
          responsable,
          site.statut
        ]
      })
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n')
      
      // Télécharger le fichier
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `sites_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setToast({ type: 'success', message: `${filteredData.length} site(s) exporté(s) avec succès !` })
    } catch (err: any) {
      console.error('Erreur export sites:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export des sites' })
    }
  }

  const handleImport = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv'
      input.onchange = async (e: any) => {
        const file = e.target.files[0]
        if (!file) return
        
        const text = await file.text()
        const lines = text.split('\n').filter((line: string) => line.trim())
        
        if (lines.length < 2) {
          setToast({ type: 'error', message: 'Le fichier CSV est vide ou invalide' })
          return
        }
        
        // Ignorer la première ligne (en-têtes)
        const dataLines = lines.slice(1)
        const supabase = createClient()
        
        // Charger les ressources pour mapper les responsables
        const { data: ressources } = await supabase
          .from('ressources')
          .select('id, nom, prenom')
        
        let successCount = 0
        let errorCount = 0
        
        for (const line of dataLines) {
          const [code_site, nom, responsable_nom, statut] = line.split(',').map((s: string) => s.trim())
          
          if (!code_site || !nom || !statut) {
            errorCount++
            continue
          }
          
          // Trouver le responsable par nom
          let responsable_id = null
          if (responsable_nom && ressources) {
            const responsable = ressources.find(r => 
              `${r.prenom} ${r.nom}`.trim().toLowerCase() === responsable_nom.toLowerCase()
            )
            if (responsable) {
              responsable_id = responsable.id
            }
          }
          
          const { error } = await supabase
            .from('sites')
            .upsert({
              code_site,
              nom,
              statut: statut || 'Actif',
              responsable_id
            }, {
              onConflict: 'code_site'
            })
          
          if (error) {
            errorCount++
          } else {
            successCount++
          }
        }
        
        if (successCount > 0) {
          setToast({ type: 'success', message: `${successCount} site(s) importé(s) avec succès !` })
          loadStats()
          window.dispatchEvent(new Event('site-created'))
        }
        
        if (errorCount > 0) {
          setToast({ type: 'error', message: `${errorCount} site(s) n'ont pas pu être importé(s)` })
        }
      }
      input.click()
    } catch (err: any) {
      console.error('Erreur import sites:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'import des sites' })
    }
  }
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Sites
              </h2>
              <p className="text-slate-600">Gérez vos sites opérationnels</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Sites actifs
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.actifs}</div>
              <p className="text-xs text-slate-500 mt-1">
                Sites en activité
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Sites en pause
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-yellow-500/30">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.enPause}</div>
              <p className="text-xs text-slate-500 mt-1">
                Temporairement suspendus
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Sites fermés
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md shadow-slate-500/30">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.fermes}</div>
              <p className="text-xs text-slate-500 mt-1">
                Archivés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800">Liste des sites</CardTitle>
                <CardDescription>
                  Gérez vos sites opérationnels et leurs responsables
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher..."
                    className="w-64 pl-10 border-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant={showClosedSites ? "default" : "outline"}
                  size="sm" 
                  className={`gap-2 ${showClosedSites ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setShowClosedSites(!showClosedSites)}
                >
                  {showClosedSites ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Fermés visibles
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Masquer fermés
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleImport}
                >
                  <Upload className="h-4 w-4" />
                  Importer
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
                <SiteFormModal>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouveau site
                  </Button>
                </SiteFormModal>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SitesTable 
              searchTerm={searchTerm}
              showClosedSites={showClosedSites}
            />
          </CardContent>
        </Card>
      </main>

      {/* Toast notifications */}
      {toast && toast.type === 'success' && (
        <SuccessToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {toast && toast.type === 'error' && (
        <ErrorToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

