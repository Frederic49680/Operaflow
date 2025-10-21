"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, GraduationCap, Building } from "lucide-react"
import Link from "next/link"

export default function RHPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ressources Humaines</h1>
        <p className="text-gray-600 mt-2">Gestion des collaborateurs, absences et formations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Collaborateurs */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Collaborateurs
            </CardTitle>
            <CardDescription>
              Gestion des profils collaborateurs, compétences et informations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rh/collaborateurs">
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Gérer les collaborateurs
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Absences */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Absences
            </CardTitle>
            <CardDescription>
              Suivi des absences, congés et indisponibilités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rh/absences">
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Gérer les absences
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Formations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Formations
            </CardTitle>
            <CardDescription>
              Planification et suivi des formations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rh/formations">
              <Button className="w-full">
                <GraduationCap className="h-4 w-4 mr-2" />
                Gérer les formations
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Sites */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Sites
            </CardTitle>
            <CardDescription>
              Gestion des sites et responsables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sites">
              <Button className="w-full">
                <Building className="h-4 w-4 mr-2" />
                Gérer les sites
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
