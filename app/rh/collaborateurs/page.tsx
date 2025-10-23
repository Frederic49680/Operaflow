"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Download, Upload, Filter, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CollaborateursTable } from "@/components/rh/CollaborateursTable"
import { CollaborateurFormModal } from "@/components/rh/CollaborateurFormModal"
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

export default function CollaborateursPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSite, setFilterSite] = useState<string>("")
  const [filterContrat, setFilterContrat] = useState<string>("")
  const [filterStatut, setFilterStatut] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    cdiActif: 0,
    interimActif: 0,
    aRenouveler: 0
  })

  useEffect(() => {
    loadSites()
    loadStats()
  }, [])

  // Recharger les stats quand un collaborateur est créé/modifié
  useEffect(() => {
    const handleCollaborateurCreated = () => {
      loadStats()
    }
    
    window.addEventListener('collaborateur-created', handleCollaborateurCreated)
    return () => window.removeEventListener('collaborateur-created', handleCollaborateurCreated)
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
        .from('ressources')
        .select('actif, type_contrat, date_sortie, email_pro, prenom, nom')

      if (error) throw error

      // Filtrer les collaborateurs non-admin
      // Exclure le premier collaborateur créé (compte admin initial)
      const nonAdminData = data?.filter((c: any, index: number) => {
        const email = c.email_pro?.toLowerCase() || ''
        const prenom = c.prenom?.toLowerCase() || ''
        const nom = c.nom?.toLowerCase() || ''
        
        // Exclure les comptes admin basés sur des patterns communs
        const isAdminEmail = email.includes('admin') || email.includes('administrateur')
        const isAdminName = prenom.includes('admin') || nom.includes('admin') || 
                           prenom.includes('administrateur') || nom.includes('administrateur')
        
        // Exclure aussi le premier collaborateur créé (compte admin initial)
        const isFirstUser = index === 0 && data.length === 1
        
        const isAdmin = isAdminEmail || isAdminName || isFirstUser
        
        // Debug log
        console.log(`Collaborateur: ${prenom} ${nom} (${email}) - Admin: ${isAdmin} (Pattern: ${isAdminEmail || isAdminName}, First: ${isFirstUser})`)
        
        return !isAdmin
      }) || []

      // Debug logs
      console.log(`Total collaborateurs: ${data?.length || 0}`)
      console.log(`Collaborateurs non-admin: ${nonAdminData.length}`)

      // Calculer les statistiques
      const total = nonAdminData.length
      const cdiActif = nonAdminData.filter((c: any) => c.type_contrat === 'CDI' && c.actif).length
      const interimActif = nonAdminData.filter((c: any) => c.type_contrat === 'Intérim' && c.actif).length
      
      // À renouveler : collaborateurs actifs avec date de sortie dans les 30 prochains jours
      const aujourdHui = new Date()
      const dans30Jours = new Date()
      dans30Jours.setDate(aujourdHui.getDate() + 30)
      
      const aRenouveler = nonAdminData.filter((c: any) => {
        if (!c.actif || !c.date_sortie) return false
        const dateSortie = new Date(c.date_sortie)
        return dateSortie >= aujourdHui && dateSortie <= dans30Jours
      }).length

      setStats({ total, cdiActif, interimActif, aRenouveler })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  const handleExport = async () => {
    try {
      // Charger les collaborateurs depuis Supabase
      const supabase = createClient()
      const { data: collaborateurs, error } = await supabase
        .from('ressources')
        .select(`
          *,
          site_id:sites (
            code_site,
            nom
          )
        `)
        .order('nom')

      if (error) throw error

      // Filtrer les données selon les filtres actifs
      let filteredData = collaborateurs || []
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((collab: any) => {
          const site = collab.site_id?.nom || ''
          return (
            collab.nom.toLowerCase().includes(searchLower) ||
            collab.prenom.toLowerCase().includes(searchLower) ||
            collab.email_pro?.toLowerCase().includes(searchLower) ||
            collab.email_perso?.toLowerCase().includes(searchLower) ||
            collab.telephone?.includes(searchTerm) ||
            collab.competences?.some((comp: string) => comp.toLowerCase().includes(searchLower)) ||
            site.toLowerCase().includes(searchLower)
          )
        })
      }
      
      if (filterSite) {
        filteredData = filteredData.filter((collab: any) => 
          collab.site_id?.code_site === filterSite
        )
      }
      
      if (filterContrat) {
        filteredData = filteredData.filter((collab: any) => 
          collab.type_contrat === filterContrat
        )
      }
      
      if (filterStatut) {
        filteredData = filteredData.filter((collab: any) => {
          if (filterStatut === 'Actif') return collab.actif
          if (filterStatut === 'Inactif') return !collab.actif
          return true
        })
      }

      // En-têtes CSV
      const headers = [
        'Nom',
        'Prénom',
        'Site',
        'Type contrat',
        'Email pro',
        'Email perso',
        'Téléphone',
        'Adresse postale',
        'Compétences',
        'Statut',
        'Date entrée',
        'Date sortie',
        'Date création'
      ]
      
      // Données CSV
      const csvData = filteredData.map((collab: any) => {
        const site = collab.site_id?.nom || '-'
        return [
          collab.nom || '-',
          collab.prenom || '-',
          site,
          collab.type_contrat || '-',
          collab.email_pro || '-',
          collab.email_perso || '-',
          collab.telephone || '-',
          collab.adresse_postale || '-',
          collab.competences?.join(', ') || '-',
          collab.actif ? 'Actif' : 'Inactif',
          collab.date_entree || '-',
          collab.date_sortie || '-',
          collab.date_creation || '-'
        ]
      })
      
      // Créer le CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      // Télécharger le fichier
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `collaborateurs_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setToast({
        type: 'success',
        message: `Export CSV réussi ! ${filteredData.length} collaborateur(s) exporté(s)`
      })
    } catch (error) {
      console.error('Erreur export:', error)
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'export CSV'
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
        
        // Parser les données
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
          return {
            nom: values[0] || null,
            prenom: values[1] || null,
            type_contrat: values[3] || 'Autre',
            email_pro: values[4] !== '-' ? values[4] : null,
            email_perso: values[5] !== '-' ? values[5] : null,
            telephone: values[6] !== '-' ? values[6] : null,
            adresse_postale: values[7] !== '-' ? values[7] : null,
            competences: values[8] !== '-' ? values[8].split(',').map(c => c.trim()) : [],
            actif: values[9] === 'Actif',
            date_entree: values[10] !== '-' ? values[10] : null,
            date_sortie: values[11] !== '-' ? values[11] : null,
          }
        }).filter(row => row.nom && row.prenom)
        
        // Insérer les données
        const supabase = createClient()
        const { error } = await supabase
          .from('ressources')
          .insert(data)
        
        if (error) throw error
        
        setToast({
          type: 'success',
          message: `${data.length} collaborateur(s) importé(s) avec succès !`
        })
        loadStats()
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        console.error('Erreur import:', err)
        setToast({
          type: 'error',
          message: 'Erreur lors de l\'import CSV'
        })
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ressources Humaines
              </h2>
              <p className="text-slate-600">Gestion des collaborateurs</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Total collaborateurs
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-500 mt-1">
                Tous statuts confondus
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                CDI Actif
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.cdiActif}</div>
              <p className="text-xs text-slate-500 mt-1">
                Contrats permanents actifs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Intérim Actif
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.interimActif}</div>
              <p className="text-xs text-slate-500 mt-1">
                Intérimaires actifs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                À renouveler
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-yellow-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.aRenouveler}</div>
              <p className="text-xs text-slate-500 mt-1">
                Formations/habilitations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Liste des collaborateurs</CardTitle>
                <CardDescription>
                  Gérez vos collaborateurs, leurs compétences et leur suivi RH
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
                  variant={showInactive ? "default" : "outline"}
                  size="sm" 
                  className={`gap-2 ${showInactive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setShowInactive(!showInactive)}
                >
                  {showInactive ? (
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
                <CollaborateurFormModal
                  onSuccess={(message) => setToast({ type: 'success', message })}
                  onError={(message) => setToast({ type: 'error', message })}
                >
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouveau collaborateur
                  </Button>
                </CollaborateurFormModal>
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
                          <SelectItem key={site.id} value={site.code_site}>
                            {site.code_site} - {site.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Type de contrat</label>
                    <Select value={filterContrat || "all"} onValueChange={(value) => setFilterContrat(value === "all" ? "" : value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tous les contrats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les contrats</SelectItem>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="Intérim">Intérim</SelectItem>
                        <SelectItem value="Apprenti">Apprenti</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
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
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
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
                      setFilterContrat("")
                      setFilterStatut("")
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
            
            <CollaborateursTable 
              searchTerm={searchTerm}
              filterSite={filterSite}
              filterContrat={filterContrat}
              filterStatut={filterStatut}
              showInactive={showInactive}
              onSuccess={(message) => setToast({ type: 'success', message })}
              onError={(message) => setToast({ type: 'error', message })}
            />
          </CardContent>
        </Card>
      </main>

      {/* Toast notifications */}
      {toast?.type === 'success' && (
        <SuccessToast
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
      {toast?.type === 'error' && (
        <ErrorToast
          message={toast.message}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  )
}

