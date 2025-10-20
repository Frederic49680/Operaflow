"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Graphique 1 */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-800">Avancement des affaires</CardTitle>
          <CardDescription>
            Répartition par statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
            <p className="text-slate-500">Graphique à venir (Recharts)</p>
          </div>
        </CardContent>
      </Card>

      {/* Graphique 2 */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-800">Taux de disponibilité</CardTitle>
          <CardDescription>
            Ressources disponibles / Absentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
            <p className="text-slate-500">Graphique à venir (Recharts)</p>
          </div>
        </CardContent>
      </Card>

      {/* Graphique 3 */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-800">Réclamations par type</CardTitle>
          <CardDescription>
            Répartition des claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
            <p className="text-slate-500">Graphique à venir (Recharts)</p>
          </div>
        </CardContent>
      </Card>

      {/* Graphique 4 */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-800">Interventions maintenance</CardTitle>
          <CardDescription>
            Heures métal par semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
            <p className="text-slate-500">Graphique à venir (Recharts)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

