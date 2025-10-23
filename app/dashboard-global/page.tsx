import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, AlertTriangle, Users, FileText, GanttChart, ClipboardList, Wrench, AlertCircle, Building2, BookOpen, Calendar, GraduationCap, UserCheck, Briefcase, DollarSign } from "lucide-react"
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"
import { AlertCenter } from "@/components/dashboard/AlertCenter"
import Link from "next/link"

export default function DashboardGlobalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard Global
              </h2>
              <p className="text-slate-600">Vue synthèse multi-modules</p>
            </div>
          </div>
        </div>

        {/* Accès rapide aux modules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Accès rapide aux modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module Sites */}
            <Link href="/sites">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Sites</h4>
                      <p className="text-xs text-slate-500">Gestion des sites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module RH Collaborateurs */}
            <Link href="/rh/collaborateurs">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Collaborateurs</h4>
                      <p className="text-xs text-slate-500">Gestion RH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module RH Absences */}
            <Link href="/rh/absences">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Absences</h4>
                      <p className="text-xs text-slate-500">Gestion des absences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Affaires */}
            <Link href="/affaires">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Affaires</h4>
                      <p className="text-xs text-slate-500">Gestion des affaires</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Tuiles Tâches */}
            <Link href="/tuiles-taches">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <GanttChart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Tuiles Tâches</h4>
                      <p className="text-xs text-slate-500">Planification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Maintenance */}
            <Link href="/maintenance">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Maintenance</h4>
                      <p className="text-xs text-slate-500">Journal du soir</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Formations - Hub Central */}
            <Link href="/rh/formations">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Formations</h4>
                      <p className="text-xs text-slate-500">Organismes, Catalogue, Plan, Tarifs, Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Claims */}
            <Link href="/claims">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Claims</h4>
                      <p className="text-xs text-slate-500">Réclamations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Module Clients */}
            <Link href="/clients/interlocuteurs">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Interlocuteurs</h4>
                      <p className="text-xs text-slate-500">Clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Filtres globaux */}
        <Card className="mb-8 border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-800">Filtres globaux</CardTitle>
            <CardDescription>
              Synchronisez les données de toutes les cartes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Période</label>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Semaine</option>
                  <option>Mois</option>
                  <option>Trimestre</option>
                  <option>Année</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Site</label>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Tous les sites</option>
                  <option>E-03A - Site Est</option>
                  <option>O-05B - Site Ouest</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Affaire</label>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Toutes les affaires</option>
                  <option>AFF-2025-001</option>
                  <option>AFF-2025-002</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Responsable</label>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Tous</option>
                  <option>Jean Dupont</option>
                  <option>Marie Martin</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <DashboardKPICards />

        {/* Charts */}
        <DashboardCharts />

        {/* Alert Center */}
        <AlertCenter />
      </main>
    </div>
  )
}

