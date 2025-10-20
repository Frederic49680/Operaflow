"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Download, Filter, DollarSign, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function BudgetPage() {
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [stats, setStats] = useState({
    budgetPrevu: 0,
    budgetRealise: 0,
    ecart: 0,
    tauxRealisation: 0
  })
  const [budgetData, setBudgetData] = useState<any[]>([])
  const [typeData, setTypeData] = useState<any[]>([])

  useEffect(() => {
    loadBudgetData()
  }, [])

  const loadBudgetData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Charger les données de budget
      const { data, error } = await supabase
        .from('V_Budget_Formations_Annuel')
        .select('*')
        .eq('annee', new Date().getFullYear())
      
      if (error) throw error
      
      // Calculer les stats globales
      const budgetPrevu = data?.reduce((sum, d) => sum + (d.budget_prevu_ht || 0), 0) || 0
      const budgetRealise = data?.reduce((sum, d) => sum + (d.budget_realise_ht || 0), 0) || 0
      const ecart = budgetRealise - budgetPrevu
      const tauxRealisation = budgetPrevu > 0 ? (budgetRealise / budgetPrevu * 100) : 0
      
      setStats({ budgetPrevu, budgetRealise, ecart, tauxRealisation })
      
      // Préparer les données pour les graphiques
      const budgetBySite = data?.reduce((acc: any, d: any) => {
        if (!acc[d.site_nom]) {
          acc[d.site_nom] = { site: d.site_nom, prevu: 0, realise: 0 }
        }
        acc[d.site_nom].prevu += d.budget_prevu_ht || 0
        acc[d.site_nom].realise += d.budget_realise_ht || 0
        return acc
      }, {})
      
      setBudgetData(Object.values(budgetBySite || {}))
      
      // Par type de formation
      const budgetByType = data?.reduce((acc: any, d: any) => {
        if (!acc[d.type_formation]) {
          acc[d.type_formation] = { type: d.type_formation, montant: 0 }
        }
        acc[d.type_formation].montant += d.budget_prevu_ht || 0
        return acc
      }, {})
      
      setTypeData(Object.values(budgetByType || {}))
    } catch (err) {
      console.error('Erreur chargement budget:', err)
    }
  }

  const handleExport = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('V_Budget_Formations_Annuel')
        .select('*')
        .eq('annee', new Date().getFullYear())
        .order('site_nom')
      
      if (error) throw error
      
      // Convertir en CSV
      const csvHeaders = ['Année', 'Site', 'Organisme', 'Formation', 'Type', 'Nb Semaines', 'Nb Participants', 'Budget Prévu HT', 'Budget Réalisé HT', 'Écart HT', 'Taux Écart %']
      const csvRows = data?.map((d: any) => {
        return [
          d.annee,
          d.site_nom || '',
          d.organisme_nom || '',
          d.formation_libelle || '',
          d.type_formation || '',
          d.nb_semaines || 0,
          d.nb_participants || 0,
          d.budget_prevu_ht || 0,
          d.budget_realise_ht || 0,
          d.ecart_ht || 0,
          d.taux_ecart_pct || 0
        ].map(field => `"${field}"`).join(',')
      }) || []
      
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')
      const BOM = '\uFEFF'
      const csv = BOM + csvContent
      
      // Télécharger
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `budget_formations_${new Date().getFullYear()}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      setToast({ type: 'success', message: 'Export CSV réussi !' })
    } catch (err: any) {
      console.error('Erreur export budget:', err)
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'export du budget' })
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
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Budget Formations {new Date().getFullYear()}
                </h1>
                <p className="text-sm text-slate-600">Suivi budgétaire des formations</p>
              </div>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Budget Prévu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetPrevu)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Budget Réalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetRealise)}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${stats.ecart >= 0 ? 'from-red-50 to-red-100/50 border-red-200' : 'from-green-50 to-green-100/50 border-green-200'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium ${stats.ecart >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                Écart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.ecart >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.ecart >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.ecart)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Taux de Réalisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.tauxRealisation.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {stats.ecart > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">Dérive budgétaire détectée</h3>
                  <p className="text-sm text-orange-700">
                    Le budget réalisé dépasse le budget prévu de {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.ecart)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget par site */}
          <Card>
            <CardHeader>
              <CardTitle>Budget par Site</CardTitle>
              <CardDescription>Prévu vs Réalisé</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="site" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)} />
                  <Legend />
                  <Bar dataKey="prevu" fill="#3b82f6" name="Prévu" />
                  <Bar dataKey="realise" fill="#10b981" name="Réalisé" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget par type */}
          <Card>
            <CardHeader>
              <CardTitle>Budget par Type de Formation</CardTitle>
              <CardDescription>Répartition du budget prévu</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, montant }) => `${type}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="montant"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle>Détail du Budget</CardTitle>
            <CardDescription>Vue consolidée par site, organisme et formation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Tableau détaillé à venir</p>
              <p className="text-sm">Affichage de toutes les lignes du budget avec filtres et recherche</p>
            </div>
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

