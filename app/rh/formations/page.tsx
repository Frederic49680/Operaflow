"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  BookOpen,
  Calendar,
  DollarSign,
  Users,
  FileText
} from "lucide-react"
import Link from "next/link"

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Formations</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gérez l'ensemble des formations, organismes, tarifs et sessions de votre organisation
          </p>
        </div>

        {/* Cartes des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Organismes de formation */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Organismes de formation</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Gérer les organismes de formation partenaires
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/rh/organismes-formation">
                  Accéder au module
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Catalogue des formations */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Catalogue des formations</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Référentiel des formations disponibles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/rh/catalogue-formations">
                  Accéder au module
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plan prévisionnel */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Plan prévisionnel</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Planifier les formations par ressource
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/rh/plan-formation">
                  Accéder au module
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tarifs formations */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Tarifs formations</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Gérer les tarifs unitaires et de groupe
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/rh/tarifs-formations">
                  Accéder au module
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Sessions de formation */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Sessions de formation</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Créer et gérer les sessions collectives
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/rh/sessions-formation">
                  Accéder au module
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Guide d'utilisation */}
        <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
            <FileText className="h-3 w-3 text-white" />
          </div>
          <Link href="/rh/guide-formations" className="text-sm font-medium">
            Guide d'utilisation
          </Link>
        </div>
      </div>
    </div>
  )
}