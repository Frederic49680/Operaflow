"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GripVertical, 
  Calendar, 
  FileText, 
  Settings,
  AlertTriangle,
  Users,
  Target,
  RefreshCw
} from "lucide-react"
import TuilesTachesSimple from "@/components/planning/TuilesTachesSimple"
import TaskTemplateManager from "@/components/planning/TaskTemplateManager"
import AffairesAPlanifierSimple from "@/components/planning/AffairesAPlanifierSimple"
import { useTaskStats } from "@/hooks/useTaskStats"

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState("tasks")
  const { stats, loading: statsLoading, refreshStats } = useTaskStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête principal avec logo et titre */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GripVertical className="h-6 w-6 text-white" />
            </div>
            
            {/* Titre avec gradient */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Planning
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Gestion des tâches et planification opérationnelle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-6 space-y-6">
        {/* En-tête avec statistiques */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Tableau de bord</h2>
            <Button 
              onClick={refreshStats} 
              disabled={statsLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GripVertical className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tâches</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tâches Actives</p>
                <p className="text-2xl font-bold">{stats.activeTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conflits</p>
                <p className="text-2xl font-bold">{stats.conflicts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">À Planifier</p>
                <p className="text-2xl font-bold">{stats.pendingAffaires}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Tâches
          </TabsTrigger>
          <TabsTrigger value="affaires" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            À Planifier
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="h-5 w-5" />
                Gestion des Tâches (4 niveaux)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TuilesTachesSimple />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affaires" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Affaires en Attente de Planification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AffairesAPlanifierSimple />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates de Tâches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres du Module Tuiles Tâches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Configuration Générale</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niveau maximum par défaut
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="2">2 niveaux</option>
                        <option value="3">3 niveaux</option>
                        <option value="4" selected>4 niveaux</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Détection de conflits
                      </label>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Activer la détection automatique</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conflits de ressources</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dépassement de niveau</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Affaires à planifier</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Intégrations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Synchronisation avec Gantt</span>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Génération depuis Affaires</span>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Templates personnalisés</span>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
