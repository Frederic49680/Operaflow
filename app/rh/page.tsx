"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  Calendar,
  Shield,
  Star,
  Building,
  UserPlus,
  Settings,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export default function RHPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ressources Humaines</h1>
          <p className="text-gray-600 mt-2">
            Gestion des collaborateurs, rôles, compétences et formations
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collaborateurs</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-green-600">+2 ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rôles actifs</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-blue-600">N1 à N8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compétences</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-purple-600">AUTO, IEG, IES...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formations</p>
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-xs text-orange-600">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules RH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Collaborateurs */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Collaborateurs</CardTitle>
                  <CardDescription className="text-xs">Gestion des ressources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700" asChild>
                  <Link href="/rh/collaborateurs">
                    <Users className="h-4 w-4 mr-2" />
                    Liste des collaborateurs
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700" asChild>
                  <Link href="/rh/absences">
                    <Calendar className="h-4 w-4 mr-2" />
                    Gestion des absences
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  24 collaborateurs actifs
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rôles & Compétences */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Rôles & Compétences</CardTitle>
                  <CardDescription className="text-xs">Affectation et gestion</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-green-50 hover:text-green-700" asChild>
                  <Link href="/rh/roles-competences">
                    <Shield className="h-4 w-4 mr-2" />
                    Gestion des rôles
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700" asChild>
                  <Link href="/rh/competences">
                    <Star className="h-4 w-4 mr-2" />
                    Compétences
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  8 rôles hiérarchiques
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Formations */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Formations</CardTitle>
                  <CardDescription className="text-xs">Planification et suivi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700" asChild>
                  <Link href="/rh/catalogue-formations">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Catalogue formations
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-50 hover:text-violet-700" asChild>
                  <Link href="/rh/plan-formation">
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan de formation
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700" asChild>
                  <Link href="/rh/sessions-formation">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Sessions de formation
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  6 formations en cours
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sites */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Sites</CardTitle>
                  <CardDescription className="text-xs">Gestion des sites</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-orange-50 hover:text-orange-700" asChild>
                  <Link href="/sites">
                    <Building className="h-4 w-4 mr-2" />
                    Liste des sites
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  3 sites actifs
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Affectations */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Affectations</CardTitle>
                  <CardDescription className="text-xs">Assignation aux tâches</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-teal-50 hover:text-teal-700" asChild>
                  <Link href="/planning">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Affecter aux tâches
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-cyan-50 hover:text-cyan-700" asChild>
                  <Link href="/rh/affectations-provisoires">
                    <Calendar className="h-4 w-4 mr-2" />
                    Affectations Provisoires
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-700" asChild>
                  <Link href="/rh/dashboard">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard KPI
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  15 affectations actives
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/30">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-800">Paramètres</CardTitle>
                  <CardDescription className="text-xs">Configuration RH</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-gray-50 hover:text-gray-700" asChild>
                  <Link href="/rh/parametres">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration
                  </Link>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline" className="text-xs">
                  Système configuré
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}