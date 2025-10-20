"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Users, AlertTriangle, GanttChart, Wrench } from "lucide-react"

export function AlertCenter() {
  const alertes = [
    {
      type: "Suraffectation",
      message: "Jean Dupont est sur-affecté à 150%",
      severity: "high",
      module: "Gantt"
    },
    {
      type: "Absence non couverte",
      message: "3 absences non couvertes cette semaine",
      severity: "medium",
      module: "RH"
    },
    {
      type: "Claim non traité",
      message: "5 claims en attente de validation",
      severity: "high",
      module: "Claims"
    },
    {
      type: "Batterie reportée",
      message: "2 batteries de maintenance reportées",
      severity: "low",
      module: "Maintenance"
    }
  ]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">Critique</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Important</Badge>
      case "low":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "Gantt":
        return <GanttChart className="h-4 w-4" />
      case "RH":
        return <Users className="h-4 w-4" />
      case "Claims":
        return <AlertTriangle className="h-4 w-4" />
      case "Maintenance":
        return <Wrench className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/30">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-slate-800">Centre d'alertes</CardTitle>
            <CardDescription>
              Notifications et anomalies détectées
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-slate-600 font-medium">Aucune alerte</p>
              <p className="text-sm text-slate-500">Tout fonctionne correctement</p>
            </div>
          ) : (
            alertes.map((alerte, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                  {getModuleIcon(alerte.module)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900">{alerte.type}</h4>
                    {getSeverityBadge(alerte.severity)}
                  </div>
                  <p className="text-sm text-slate-600">{alerte.message}</p>
                  <p className="text-xs text-slate-500 mt-1">Module: {alerte.module}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

