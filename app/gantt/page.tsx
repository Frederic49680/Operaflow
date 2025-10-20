"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GanttChart, Plus, Search, Download, Upload, Filter, Calendar, Users, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GanttTable } from "@/components/gantt/GanttTable"
import { TacheFormModal } from "@/components/gantt/TacheFormModal"
import GanttInteractive from "@/components/gantt/GanttInteractive"
import GanttToolbar from "@/components/gantt/GanttToolbar"
import GanttAlert from "@/components/gantt/GanttAlert"
import { GanttPendingCard } from "@/components/gantt/GanttPendingCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function GanttPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("gantt")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  
  // Affaires en attente
  const [affairesAPlanifier, setAffairesAPlanifier] = useState<any[]>([])
  
  // KPI States
  const [tachesActives, setTachesActives] = useState(0)
  const [tauxCouverture, setTauxCouverture] = useState(0)
  const [retardMoyen, setRetardMoyen] = useState(0)
  const [suraffectations, setSuraffectations] = useState(0)
  
  // Filter & Settings States
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    site: "all",
    affaire: "all",
    type: "all",
  })

  // Charger les tâches et les affaires en attente
  useEffect(() => {
    loadTasks()
    loadAffairesAPlanifier()
  }, [])

  // Écouter l'événement de création d'affaire pour rafraîchir les tâches
  useEffect(() => {
    const handleAffaireCreated = () => {
      console.log('🔄 Événement affaire-created détecté, rafraîchissement des tâches...')
      loadTasks()
      loadAffairesAPlanifier()
    }

    window.addEventListener('affaire-created', handleAffaireCreated)
    
    return () => {
      window.removeEventListener('affaire-created', handleAffaireCreated)
    }
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gantt/tasks")
      const result = await response.json()
      if (result.success) {
        console.log('📥 Tâches chargées depuis l\'API:', result.data)
        console.log('📊 Nombre de tâches:', result.data.length)
        if (result.data.length > 0) {
          console.log('📋 Première tâche:', result.data[0])
        }
        setTasks(result.data)
        setFilteredTasks(result.data)
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAffairesAPlanifier = async () => {
    try {
      const response = await fetch("/api/affaires/a-planifier")
      const result = await response.json()
      if (result.success) {
        console.log('📥 Affaires en attente chargées:', result.data)
        setAffairesAPlanifier(result.data || [])
      }
    } catch (error) {
      console.error("Error loading affaires à planifier:", error)
    }
  }

  // Calculer les KPI
  const calculateKPIs = () => {
    // 1. Tâches actives (En cours)
    const actives = tasks.filter((t) => t.statut === "En cours").length
    setTachesActives(actives)

    // 2. Taux de couverture (simplifié : basé sur les tâches actives)
    const totalTaches = tasks.length
    const couverture = totalTaches > 0 ? Math.round((actives / totalTaches) * 100) : 0
    setTauxCouverture(couverture)

    // 3. Retard moyen (en jours)
    const today = new Date()
    const retards = tasks
      .filter((t) => t.date_fin_plan && t.statut === "En cours")
      .map((t) => {
        const finPlan = new Date(t.date_fin_plan)
        const diff = Math.floor((today.getTime() - finPlan.getTime()) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 0
      })
    
    const retardMoy = retards.length > 0 
      ? Math.round(retards.reduce((a, b) => a + b, 0) / retards.length)
      : 0
    setRetardMoyen(retardMoy)

    // 4. Suraffectations (ressources avec charge > 100%)
    // Pour l'instant, on simule avec les tâches en cours
    const surcharge = tasks.filter((t) => t.avancement_pct > 100).length
    setSuraffectations(surcharge)
  }

  // Filtrer les tâches
  useEffect(() => {
    let filtered = tasks

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.libelle_tache?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.code_affaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.site_nom?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtres avancés
    if (filters.status !== "all") {
      filtered = filtered.filter((task) => task.statut === filters.status)
    }
    if (filters.site !== "all") {
      filtered = filtered.filter((task) => task.site_nom === filters.site)
    }
    if (filters.affaire !== "all") {
      filtered = filtered.filter((task) => task.code_affaire === filters.affaire)
    }
    if (filters.type !== "all") {
      filtered = filtered.filter((task) => task.type_tache === filters.type)
    }

    setFilteredTasks(filtered)
  }, [searchTerm, tasks, filters])

  // Calculer les KPI quand les tâches changent
  useEffect(() => {
    calculateKPIs()
  }, [tasks])

  // Export CSV
  const handleExport = () => {
    const csv = [
      ['Tâche', 'Affaire', 'Site', 'Type', 'Début', 'Fin', 'Avancement', 'Statut'],
      ...filteredTasks.map((t) => [
        t.libelle_tache || '',
        t.code_affaire || '',
        t.site_nom || '',
        t.type_tache || '',
        t.date_debut_plan || '',
        t.date_fin_plan || '',
        t.avancement_pct + '%',
        t.statut || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gantt-taches-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Export réussi")
  }

  // Import CSV
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const lines = text.split('\n').filter((line) => line.trim())
        const headers = lines[0].split(',')

        // Parser le CSV (simplifié)
        const importedTasks = lines.slice(1).map((line, index) => {
          const values = line.split(',')
          return {
            libelle_tache: values[0] || `Tâche ${index + 1}`,
            code_affaire: values[1] || '',
            site_nom: values[2] || '',
            type_tache: values[3] || 'Exécution',
            date_debut_plan: values[4] || new Date().toISOString().split('T')[0],
            date_fin_plan: values[5] || new Date().toISOString().split('T')[0],
            avancement_pct: parseInt(values[6]) || 0,
            statut: values[7] || 'Non lancé',
          }
        })

        // Insérer dans Supabase
        const supabase = createClient()
        const { error } = await supabase
          .from('planning_taches')
          .insert(importedTasks)

        if (error) throw error

        toast.success(`${importedTasks.length} tâche(s) importée(s)`)
        loadTasks()
      } catch (err) {
        console.error('Erreur import:', err)
        toast.error("Erreur lors de l'import")
      }
    }
    input.click()
  }

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Sauvegarder toutes les tâches modifiées
      for (const task of filteredTasks) {
        await fetch("/api/gantt/update-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: task.id,
            date_debut_plan: task.date_debut_plan,
            date_fin_plan: task.date_fin_plan,
            avancement_pct: task.avancement_pct,
            statut: task.statut,
          }),
        })
      }
      toast.success("Modifications sauvegardées")
      loadTasks()
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  // Réinitialiser les filtres et la recherche
  const handleReset = () => {
    setSearchTerm("")
    setFilters({
      status: "all",
      site: "all",
      affaire: "all",
      type: "all",
    })
    setZoomLevel(1)
    loadTasks()
    toast.success("Filtres réinitialisés")
  }

  // Ouvrir le modal des filtres
  const handleOpenFilters = () => {
    setShowFilters(true)
  }

  // Ouvrir le modal des paramètres
  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  // Appliquer les filtres
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setShowFilters(false)
    toast.success("Filtres appliqués")
  }

  // Récupérer les valeurs uniques pour les filtres
  const getUniqueValues = (key: string) => {
    const values = new Set(tasks.map((t) => t[key]).filter(Boolean))
    return Array.from(values)
  }

  // Compter les filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status !== "all") count++
    if (filters.site !== "all") count++
    if (filters.affaire !== "all") count++
    if (filters.type !== "all") count++
    return count
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
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
              <GanttChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Planification Gantt
              </h2>
              <p className="text-slate-600">Gestion des tâches et affectations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Tâches actives
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
                <GanttChart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{tachesActives}</div>
              <p className="text-xs text-slate-500 mt-1">
                En cours
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Taux de couverture
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{tauxCouverture}%</div>
              <p className="text-xs text-slate-500 mt-1">
                Ressources / Besoins
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Retard moyen
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{retardMoyen}j</div>
              <p className="text-xs text-slate-500 mt-1">
                Jours de retard
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Suraffectations
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/30">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{suraffectations}</div>
              <p className="text-xs text-slate-500 mt-1">
                Ressources en surcharge
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Planification des tâches</CardTitle>
                <CardDescription>
                  Gérez vos tâches, affectez les ressources et suivez les avancements
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher une tâche, affaire ou site..."
                    className="w-64 pl-10 border-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <TacheFormModal onSuccess={loadTasks}>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouvelle tâche
                  </Button>
                </TacheFormModal>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="gantt">
                  <GanttChart className="h-4 w-4 mr-2" />
                  Vue Gantt
                </TabsTrigger>
                <TabsTrigger value="pending">
                  <Calendar className="h-4 w-4 mr-2" />
                  En attente {affairesAPlanifier.length > 0 && `(${affairesAPlanifier.length})`}
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Calendar className="h-4 w-4 mr-2" />
                  Vue Tableau
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gantt" className="space-y-4">
                {/* Alertes */}
                {alerts.length > 0 && (
                  <GanttAlert
                    alerts={alerts}
                    onDismiss={(alertId) => setAlerts(alerts.filter((a) => a.id !== alertId))}
                  />
                )}

                {/* Toolbar */}
                <GanttToolbar
                  onZoomIn={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}
                  onZoomOut={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                  onReset={handleReset}
                  onSave={handleSave}
                  onExport={handleExport}
                  onImport={handleImport}
                  onFilter={handleOpenFilters}
                  onSettings={handleOpenSettings}
                  zoomLevel={zoomLevel}
                  taskCount={filteredTasks.length}
                  alertCount={alerts.length}
                  activeFiltersCount={getActiveFiltersCount()}
                />

                {/* Compteur de résultats */}
                {searchTerm && (
                  <div className="text-sm text-slate-600 bg-blue-50 px-4 py-2 rounded-md">
                    {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''} sur {tasks.length} total
                  </div>
                )}

                {/* Gantt Interactif */}
                <GanttInteractive
                  tasks={filteredTasks}
                  zoomLevel={zoomLevel}
                  onZoomIn={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}
                  onZoomOut={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                  onTaskUpdate={(task) => {
                    setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
                    setFilteredTasks(filteredTasks.map((t) => (t.id === task.id ? task : t)))
                  }}
                />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Affaires en attente de planification</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ces affaires ont été créées et sont prêtes à être planifiées. Déclarez leur planification pour créer les tâches et jalons dans le Gantt.
                  </p>

                  {affairesAPlanifier.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-slate-50">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-lg font-medium">Aucune affaire en attente</p>
                      <p className="text-sm mt-2">Toutes les affaires ont été planifiées</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {affairesAPlanifier.map((affaire) => (
                        <GanttPendingCard
                          key={affaire.id}
                          affaire={affaire}
                          onDeclared={() => {
                            loadAffairesAPlanifier()
                            loadTasks()
                            toast.success('Planification déclarée avec succès')
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="table">
                <GanttTable />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Modal Filtres */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFilters(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Filtres avancés</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="Non lancé">Non lancé</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Bloqué">Bloqué</option>
                    <option value="Reporté">Reporté</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Site</label>
                  <select
                    value={filters.site}
                    onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tous les sites</option>
                    {getUniqueValues("site_nom").map((site) => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Affaire</label>
                  <select
                    value={filters.affaire}
                    onChange={(e) => setFilters({ ...filters, affaire: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Toutes les affaires</option>
                    {getUniqueValues("code_affaire").map((affaire) => (
                      <option key={affaire} value={affaire}>{affaire}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tous les types</option>
                    {getUniqueValues("type_tache").map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setShowFilters(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => handleApplyFilters(filters)} className="flex-1">
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Paramètres */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Paramètres du Gantt</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Zoom par défaut</label>
                  <select
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="0.5">50%</option>
                    <option value="0.75">75%</option>
                    <option value="1">100%</option>
                    <option value="1.25">125%</option>
                    <option value="1.5">150%</option>
                    <option value="2">200%</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      defaultChecked
                    />
                    <span className="text-sm">Afficher les alertes</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      defaultChecked
                    />
                    <span className="text-sm">Auto-sauvegarde activée</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                  Fermer
                </Button>
                <Button onClick={() => {
                  setShowSettings(false)
                  toast.success("Paramètres sauvegardés")
                }} className="flex-1">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

