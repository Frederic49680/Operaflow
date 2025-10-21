import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar,
  FileText,
  GanttChart,
  AlertTriangle,
  TrendingUp,
  Layers,
  Database,
  ClipboardList,
  Wrench,
  Network,
  Settings,
  GraduationCap
} from "lucide-react"

export default function DashboardPage() {
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
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Tableau de bord
          </h2>
          <p className="text-slate-600">
            Vue d'ensemble de votre activité opérationnelle
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Sites actifs
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                En attente de configuration
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Collaborateurs
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                En attente de configuration
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Affaires en cours
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                En attente de configuration
              </p>
            </CardContent>
          </Card>

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
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">
                En attente de configuration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules par catégories */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Modules par catégorie</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Catégorie 1 : Référentiels */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">Référentiels</CardTitle>
                    <CardDescription className="text-xs">Données de base</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700" asChild>
                  <a href="/sites">
                    <Building2 className="h-4 w-4 mr-2" />
                    Sites
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700" asChild>
                  <a href="/rh/collaborateurs">
                    <Users className="h-4 w-4 mr-2" />
                    RH Collaborateurs
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700" asChild>
                  <a href="/rh/absences">
                    <Calendar className="h-4 w-4 mr-2" />
                    Absences
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700" asChild>
                  <a href="/rh/formations">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Formations
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Catégorie 2 : Planification */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">Planification</CardTitle>
                    <CardDescription className="text-xs">Affaires & Gantt</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-teal-50 hover:text-teal-700" asChild>
                  <a href="/affaires">
                    <FileText className="h-4 w-4 mr-2" />
                    Affaires
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-cyan-50 hover:text-cyan-700" asChild>
                  <a href="/tuiles-taches">
                    <GanttChart className="h-4 w-4 mr-2" />
                    Tuiles Tâches
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Catégorie 3 : Terrain */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">Terrain</CardTitle>
                    <CardDescription className="text-xs">Opérations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700" asChild>
                  <a href="/terrain/remontee">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Remontées
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-orange-50 hover:text-orange-700" asChild>
                  <a href="/maintenance">
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Catégorie 4 : Relations */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Network className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">Relations</CardTitle>
                    <CardDescription className="text-xs">Clients & Claims</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-green-50 hover:text-green-700" asChild>
                  <a href="/clients/interlocuteurs">
                    <Users className="h-4 w-4 mr-2" />
                    Interlocuteurs
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-red-50 hover:text-red-700" asChild>
                  <a href="/claims">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Claims
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Catégorie 5 : Outils */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">Outils</CardTitle>
                    <CardDescription className="text-xs">Dashboard & Builder</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700" asChild>
                  <a href="/dashboard-global">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Dashboard Global
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700" asChild>
                  <a href="/builder">
                    <Layers className="h-4 w-4 mr-2" />
                    Form Builder
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Configuration initiale</p>
                  <p className="text-sm text-blue-700">
                    Le système est prêt. Commencez par configurer vos sites et collaborateurs.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                  <div className="text-sm font-medium text-slate-600 mb-1">Phase actuelle</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Phase 1</div>
                  <div className="text-xs text-slate-500">Accès & Référentiels</div>
                </div>
                
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                  <div className="text-sm font-medium text-slate-600 mb-1">Modules actifs</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">0 / 12</div>
                  <div className="text-xs text-slate-500">En cours de développement</div>
                </div>
                
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                  <div className="text-sm font-medium text-slate-600 mb-1">Version</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">0.1.0</div>
                  <div className="text-xs text-slate-500">Socle technique</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

