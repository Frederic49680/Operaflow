"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Search, Download, Filter, TrendingUp, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AbsencesTable } from "@/components/rh/AbsencesTable"
import { AbsenceFormModal } from "@/components/rh/AbsenceFormModal"
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

export default function AbsencesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSite, setFilterSite] = useState<string>("")
  const [filterMotif, setFilterMotif] = useState<string>("")
  const [filterStatut, setFilterStatut] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [showPastAbsences, setShowPastAbsences] = useState(false) // Masquer les absences passées par défaut
  const [sites, setSites] = useState<Site[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Statistiques
  const [stats, setStats] = useState({
    enCours: 0,
    aVenir: 0,
    tauxDisponibilite: 100,
    alertes: 0
  })

  useEffect(() => {
    loadSites()
    loadStats()
  }, [])

  // Recharger les stats quand une absence est créée/modifiée
  useEffect(() => {
    const handleAbsenceCreated = () => {
      loadStats()
    }
    
    window.addEventListener('absence-created', handleAbsenceCreated)
    return () => window.removeEventListener('absence-created', handleAbsenceCreated)
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
      const { data: absences, error } = await supabase
        .from('absences')
        .select('date_debut, date_fin, statut')

      if (error) throw error

      const aujourdHui = new Date()
      aujourdHui.setHours(0, 0, 0, 0)
      
      const dans7Jours = new Date()
      dans7Jours.setDate(aujourdHui.getDate() + 7)
      dans7Jours.setHours(23, 59, 59, 999)

      // Absences en cours
      const enCours = absences?.filter((a: any) => {
        const debut = new Date(a.date_debut)
        const fin = new Date(a.date_fin)
        return debut <= aujourdHui && fin >= aujourdHui
      }).length || 0

      // Absences à venir (7 jours)
      const aVenir = absences?.filter((a: any) => {
        const debut = new Date(a.date_debut)
        return debut > aujourdHui && debut <= dans7Jours
      }).length || 0

      // Taux de disponibilité (simplifié : 100% - % d'absences)
      // Pour un calcul plus précis, il faudrait connaître le nombre total de ressources
      const totalRessources = 10 // À ajuster selon vos besoins
      const tauxDisponibilite = Math.round(((totalRessources - enCours) / totalRessources) * 100)

      // Alertes : absences longues (> 30 jours)
      const alertes = absences?.filter((a: any) => {
        const debut = new Date(a.date_debut)
        const fin = new Date(a.date_fin)
        const duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)
        return duree > 30
      }).length || 0

      setStats({ enCours, aVenir, tauxDisponibilite, alertes })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  // Fonction pour vérifier et créer une alerte visite médicale
  const checkAndCreateMedicalAlert = async (absenceData: any) => {
    try {
      const supabase = createClient()
      
      const debut = new Date(absenceData.date_debut)
      const fin = new Date(absenceData.date_fin)
      const duree = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)
      
      // Vérifier si absence maladie de plus de 30 jours
      const motif = absenceData.type || absenceData.motif || ''
      const isMaladie = motif.toLowerCase().includes('maladie') || 
                       motif.toLowerCase().includes('accident du travail') ||
                       motif.toLowerCase().includes('arrêt maladie')
      
      if (duree > 30 && isMaladie) {
        // Récupérer les informations du collaborateur
        const { data: ressource } = await supabase
          .from('ressources')
          .select('nom, prenom')
          .eq('id', absenceData.ressource_id)
          .single()
        
        const nomComplet = ressource ? `${ressource.prenom} ${ressource.nom}` : 'Collaborateur'
        
        // Créer une alerte pour l'administratif
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            cible: 'Administratif',
            type: 'Visite médicale requise',
            message: `Absence maladie de ${Math.round(duree)} jours pour ${nomComplet} - Courrier de visite médicale à envoyer`,
            date_envoi: new Date().toISOString(),
            statut: 'non lu'
          })
        
        if (alertError) {
          console.error('Erreur création alerte:', alertError)
        } else {
          console.log('Alerte visite médicale créée pour', nomComplet)
        }
      }
    } catch (error) {
      console.error('Erreur vérification alerte médicale:', error)
    }
  }

  const handleExport = async () => {
    try {
      const supabase = createClient()
      const { data: absences, error } = await supabase
        .from('absences')
        .select(`
          *,
          ressource_id:ressources (
            nom,
            prenom
          )
        `)
        .order('date_debut', { ascending: false })

      if (error) throw error

      // Filtrer les données selon les filtres actifs
      let filteredData = absences || []
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredData = filteredData.filter((a: any) => {
          const ressource = a.ressource_id?.[0]
          return (
            ressource?.nom?.toLowerCase().includes(searchLower) ||
            ressource?.prenom?.toLowerCase().includes(searchLower) ||
            (a.type || a.motif)?.toLowerCase().includes(searchLower)
          )
        })
      }
      
      if (filterSite) {
        filteredData = filteredData.filter((a: any) => a.site === filterSite)
      }
      
      if (filterMotif) {
        filteredData = filteredData.filter((a: any) => (a.type || a.motif) === filterMotif)
      }
      
      if (filterStatut) {
        filteredData = filteredData.filter((a: any) => a.statut === filterStatut)
      }

      // En-têtes CSV
      const headers = [
        'Collaborateur',
        'Site',
        'Date début',
        'Date fin',
        'Statut',
        'Motif'
      ]
      
      // Données CSV
      const csvData = filteredData.map((a: any) => {
        const ressource = a.ressource_id?.[0]
        return [
          ressource ? `${ressource.prenom} ${ressource.nom}` : '-',
          a.site || '-',
          a.date_debut || '-',
          a.date_fin || '-',
          a.statut || '-',
          a.type || a.motif || '-'  // Lire depuis 'type' (ou 'motif' en fallback)
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
      link.setAttribute('download', `absences_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setToast({
        type: 'success',
        message: `Export CSV réussi ! ${filteredData.length} absence(s) exportée(s)`
      })
    } catch (error) {
      console.error('Erreur export:', error)
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'export CSV'
      })
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
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Absences
              </h2>
              <p className="text-slate-600">Suivi des disponibilités du personnel</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Absences en cours
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.enCours}</div>
              <p className="text-xs text-slate-500 mt-1">
                Actuellement absents
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                À venir (7j)
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.aVenir}</div>
              <p className="text-xs text-slate-500 mt-1">
                Prochaines absences
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Taux de disponibilité
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.tauxDisponibilite}%</div>
              <p className="text-xs text-slate-500 mt-1">
                Ressources disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Alertes
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/30">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.alertes}</div>
              <p className="text-xs text-slate-500 mt-1">
                Absences longues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Liste des absences</CardTitle>
                <CardDescription>
                  Gérez les absences et suivez les disponibilités
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
                  variant={showPastAbsences ? "default" : "outline"}
                  size="sm" 
                  className={`gap-2 ${showPastAbsences ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setShowPastAbsences(!showPastAbsences)}
                >
                  {showPastAbsences ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Passées visibles
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Masquer passées
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
                <AbsenceFormModal
                  onSuccess={(message) => setToast({ type: 'success', message })}
                  onError={(message) => setToast({ type: 'error', message })}
                  onAbsenceCreated={checkAndCreateMedicalAlert}
                >
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouvelle absence
                  </Button>
                </AbsenceFormModal>
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
                    <label className="text-sm font-medium text-slate-700">Motif</label>
                    <Select value={filterMotif || "all"} onValueChange={(value) => setFilterMotif(value === "all" ? "" : value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tous les motifs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les motifs</SelectItem>
                        <SelectItem value="Vacances">Vacances</SelectItem>
                        <SelectItem value="Maladie">Maladie</SelectItem>
                        <SelectItem value="Formation professionnelle">Formation professionnelle</SelectItem>
                        <SelectItem value="Congé maternité/paternité">Congé maternité/paternité</SelectItem>
                        <SelectItem value="Congé sans solde">Congé sans solde</SelectItem>
                        <SelectItem value="Grève">Grève</SelectItem>
                        <SelectItem value="Accident du travail">Accident du travail</SelectItem>
                        <SelectItem value="Arrêt maladie longue durée">Arrêt maladie longue durée</SelectItem>
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
                        <SelectItem value="à venir">À venir</SelectItem>
                        <SelectItem value="en cours">En cours</SelectItem>
                        <SelectItem value="passée">Passée</SelectItem>
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
                      setFilterMotif("")
                      setFilterStatut("")
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
            
            <AbsencesTable 
              searchTerm={searchTerm}
              filterSite={filterSite}
              filterMotif={filterMotif}
              filterStatut={filterStatut}
              showPastAbsences={showPastAbsences}
              onSuccess={(message) => setToast({ type: 'success', message })}
              onError={(message) => setToast({ type: 'error', message })}
              onAbsenceCreated={checkAndCreateMedicalAlert}
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

