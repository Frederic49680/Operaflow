"use client"

import { Building2, BookOpen, Calendar, DollarSign, Users, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FormationsPage() {
  const modules = [
    {
      title: "Organismes de formation",
      description: "Gérer les organismes de formation partenaires",
      icon: Building2,
      href: "/rh/formations/organismes",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Catalogue des formations",
      description: "Référentiel des formations disponibles",
      icon: BookOpen,
      href: "/rh/formations/catalogue",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "Plan prévisionnel",
      description: "Planifier les formations par ressource",
      icon: Calendar,
      href: "/rh/formations/plan",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      title: "Tarifs formations",
      description: "Gérer les tarifs unitaires et de groupe",
      icon: DollarSign,
      href: "/rh/formations/tarifs",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    },
    {
      title: "Sessions de formation",
      description: "Créer et gérer les sessions collectives",
      icon: Users,
      href: "/rh/formations/sessions",
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600"
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Formations</h1>
        </div>
        <p className="text-slate-600">
          Gérez l'ensemble des formations, organismes, tarifs et sessions de votre organisation
        </p>
      </div>

      {/* Grille des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-blue-500">
                <CardHeader className="pb-3">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${module.color} ${module.hoverColor} transition-colors mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Section d'aide */}
      <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          📚 Guide d'utilisation
        </h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p><strong>1. Organismes :</strong> Commencez par référencer vos organismes de formation partenaires</p>
          <p><strong>2. Catalogue :</strong> Créez votre catalogue de formations avec les compétences associées</p>
          <p><strong>3. Tarifs :</strong> Définissez les tarifs (unitaire/groupe) pour chaque formation</p>
          <p><strong>4. Plan :</strong> Planifiez les formations par ressource (semaines ISO)</p>
          <p><strong>5. Sessions :</strong> Organisez les sessions collectives de formation</p>
        </div>
      </div>
    </div>
  )
}

