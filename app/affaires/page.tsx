"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, Download, Upload, Filter, TrendingUp, DollarSign, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AffairesTable } from "@/components/affaires/AffairesTable"
import { AffaireFormModal } from "@/components/affaires/AffaireFormModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"

interface Site {
  id: string
  code_site: string
  nom: string
}

export default function AffairesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSite, setFilterSite] = useState<string>("")
  const [filterStatut, setFilterStatut] = useState<string>("")
  const [filterTypeContrat, setFilterTypeContrat] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [showClosedAffaires, setShowClosedAffaires] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    actives: 0,
    budgetTotal: 0,
    avancementMoyen: 0,
    margeMoyenne: 0
  })

  useEffect(() => {
    loadSites()
    loadStats()
    
    // Recharger les stats quand une affaire est créée/modifiée
    const handleAffaireCreated = () => {
      loadStats()
    }
    
    window.addEventListener('affaire-created', handleAffaireCreated)
    return () => window.removeEventListener('affaire-created', handleAffaireCreated)
  }, [])

  const loadSites = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('sites')
      .select('id, code_site, nom')
      .in('statut', ['Actif', 'En pause'])
      .order('nom')
    setSites(data || [])
  }

  const loadStats = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('affaires')
        .select('statut, montant_total_ht, avancement_pct, marge_prevue')
      
      if (error) throw error
      
      // Calculer les statistiques
      const actives = data?.filter(a => a.statut === 'Validée' || a.statut === 'En cours').length || 0
      const budgetTotal = data?.reduce((sum, a) => sum + (a.montant_total_ht || 0), 0) || 0
      
      // Avancement moyen (pondéré par le montant)
      let totalAvancement = 0
      let totalMontant = 0
      data?.forEach(a => {
        if (a.montant_total_ht && a.avancement_pct) {
          totalAvancement += a.montant_total_ht * a.avancement_pct
          totalMontant += a.montant_total_ht
        }
      })
      const avancementMoyen = totalMontant > 0 ? (totalAvancement / totalMontant) : 0
      
      // Marge moyenne
      const marges = data?.filter(a => a.marge_prevue).map(a => a.marge_prevue) || []
      const margeMoyenne = marges.length > 0 
        ? marges.reduce((sum, m) => sum + m, 0) / marges.length 
        : 0
      
      setStats({ actives, budgetTotal, avancementMoyen, margeMoyenne })
    } catch (err) {
      console.error('Erreur chargement stats affaires:', err)
    }
  }

  const handleExport = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('v_affaires_completes')
        .select(`
          code_affaire,
          nom,
          nom_client,
          site_nom,
          responsable_nom,
          responsable_prenom,
          num_commande,
          type_contrat,
          montant_total_ht,
          statut,
          avancement_pct
        `)
        .order('code_affaire')
      
      if (error) throw error
      
      // Filtrer les données
      let filteredData = data || []
      
      // Filtre : masquer les affaires clôturées si non coché
      if (!showClosedAffaires) {
        filteredData = filteredData.filter((a: any) => a.statut !== 'Clôturée')
      }
      
      if (filterSite) {
        filteredData = filteredData.filter((a: any) => a.site_nom?.includes(filterSite))
      }
      
      if (filterStatut) {
        filteredData = filteredData.filter((a: any) => a.statut === filterStatut)
      }
      
      if (filterTypeContrat) {
        filteredData = filteredData.filter((a: any) => a.type_contrat === filterTypeContrat)
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((a: any) => {
          return (
            a.code_affaire?.toLowerCase().includes(searchLower) ||
            a.nom?.toLowerCase().includes(searchLower) ||
            a.nom_client?.toLowerCase().includes(searchLower) ||
            a.num_commande?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      // Convertir en CSV
      const csvHeaders = ['Code Affaire', 'Nom', 'Client', 'Site', 'Responsable', 'N° Commande', 'Type Contrat', 'Montant HT', 'Statut', 'Avancement %']
      const csvRows = filteredData.map((a: any) => {
        const responsable = `${a.responsable_prenom || ''} ${a.responsable_nom || ''}`.trim()
        return [
          a.code_affaire,
          a.nom,
          a.nom_client,
          a.site_nom,
          responsable,
          a.num_commande || '-',
          a.type_contrat,
          a.montant_total_ht,
          a.statut,
          a.avancement_pct
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
      link.setAttribute('download', `affaires_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setToast({ type: 'success', message: `${filteredData.length} affaire(s) exportée(s) avec succès !` })
    } catch (err: any) {
      console.error('Erreur export affaires:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export des affaires' })
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
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setToast({ type: 'error', message: 'Le fichier CSV est vide ou invalide' })
          return
        }
        
        // Ignorer la première ligne (en-têtes)
        const dataLines = lines.slice(1)
        const supabase = createClient()
        
        // Charger les sites et ressources pour mapper les IDs
        const { data: sitesData } = await supabase
          .from('sites')
          .select('id, nom')
        
        const { data: ressourcesData } = await supabase
          .from('ressources')
          .select('id, nom, prenom')
        
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, nom_client')
        
        let successCount = 0
        let errorCount = 0
        
        for (const line of dataLines) {
          const [code_affaire, nom, nom_client, site_nom, responsable_nom, num_commande, type_contrat, montant_ht, statut, avancement_pct] = line.split(',').map(s => s.trim())
          
          if (!code_affaire || !nom || !nom_client || !site_nom || !responsable_nom || !type_contrat) {
            errorCount++
            continue
          }
          
          // Trouver les IDs correspondants
          const site = sitesData?.find(s => s.nom === site_nom)
          const responsable = ressourcesData?.find(r => 
            `${r.prenom} ${r.nom}`.trim().toLowerCase() === responsable_nom.toLowerCase()
          )
          const client = clientsData?.find(c => c.nom_client === nom_client)
          
          if (!site || !responsable || !client) {
            errorCount++
            continue
          }
          
          const { error } = await supabase
            .from('affaires')
            .upsert({
              code_affaire,
              nom,
              site_id: site.id,
              responsable_id: responsable.id,
              client_id: client.id,
              num_commande: num_commande || null,
              type_contrat: type_contrat || 'Forfait',
              montant_total_ht: parseFloat(montant_ht) || 0,
              statut: statut || 'Brouillon',
              avancement_pct: parseFloat(avancement_pct) || 0
            }, {
              onConflict: 'code_affaire'
            })
          
          if (error) {
            errorCount++
          } else {
            successCount++
          }
        }
        
        if (successCount > 0) {
          setToast({ type: 'success', message: `${successCount} affaire(s) importée(s) avec succès !` })
          loadStats()
          window.dispatchEvent(new Event('affaire-created'))
        }
        
        if (errorCount > 0) {
          setToast({ type: 'error', message: `${errorCount} affaire(s) n'ont pas pu être importée(s)` })
        }
      }
      input.click()
    } catch (err: any) {
      console.error('Erreur import affaires:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'import des affaires' })
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Affaires
              </h2>
              <p className="text-slate-600">Socle métier et financier</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Affaires actives
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.actives}</div>
              <p className="text-xs text-slate-500 mt-1">
                En cours / Validées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Budget total
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetTotal)}</div>
              <p className="text-xs text-slate-500 mt-1">
                Montant total HT
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Avancement moyen
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.avancementMoyen.toFixed(1)}%</div>
              <p className="text-xs text-slate-500 mt-1">
                Moyenne pondérée
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Marge moyenne
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.margeMoyenne.toFixed(1)}%</div>
              <p className="text-xs text-slate-500 mt-1">
                Marge prévue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Liste des affaires</CardTitle>
                <CardDescription>
                  Gérez vos affaires, leur découpage financier et leur suivi
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
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
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
                <Button 
                  variant={showClosedAffaires ? "default" : "outline"}
                  size="sm" 
                  className={`gap-2 ${showClosedAffaires ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setShowClosedAffaires(!showClosedAffaires)}
                >
                  {showClosedAffaires ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Clôturées visibles
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Masquer clôturées
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
                <AffaireFormModal>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouvelle affaire
                  </Button>
                </AffaireFormModal>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Panneau de filtres */}
            {showFilters && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Site</label>
                    <Select value={filterSite || "all"} onValueChange={(value) => setFilterSite(value === "all" ? "" : value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tous les sites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les sites</SelectItem>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.nom}>
                            {site.code_site} - {site.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Statut</label>
                    <Select value={filterStatut || "all"} onValueChange={(value) => setFilterStatut(value === "all" ? "" : value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="Brouillon">Brouillon</SelectItem>
                        <SelectItem value="Soumise">Soumise</SelectItem>
                        <SelectItem value="Validée">Validée</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Clôturée">Clôturée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Type de contrat</label>
                    <Select value={filterTypeContrat || "all"} onValueChange={(value) => setFilterTypeContrat(value === "all" ? "" : value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="Forfait">Forfait</SelectItem>
                        <SelectItem value="Régie">Régie</SelectItem>
                        <SelectItem value="BPU">BPU</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterSite("")
                      setFilterStatut("")
                      setFilterTypeContrat("")
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
            
            <AffairesTable 
              searchTerm={searchTerm}
              filterSite={filterSite}
              filterStatut={filterStatut}
              filterTypeContrat={filterTypeContrat}
              showClosedAffaires={showClosedAffaires}
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

