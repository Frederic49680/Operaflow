"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, GanttChart, AlertTriangle, Calendar, Wrench, TrendingUp } from "lucide-react"

export function DashboardKPICards() {
  const kpis = [
    {
      title: "Ressources actives",
      value: "0",
      subtitle: "Total collaborateurs",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-500/30"
    },
    {
      title: "Affaires actives",
      value: "0",
      subtitle: "En cours / Validées",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/30"
    },
    {
      title: "Tâches en cours",
      value: "0",
      subtitle: "Planification",
      icon: GanttChart,
      color: "from-teal-500 to-teal-600",
      shadow: "shadow-teal-500/30"
    },
    {
      title: "Claims ouverts",
      value: "0",
      subtitle: "Réclamations",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      shadow: "shadow-red-500/30"
    },
    {
      title: "Absences (7j)",
      value: "0",
      subtitle: "Prochaines absences",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30"
    },
    {
      title: "Interventions",
      value: "0",
      subtitle: "Maintenance du jour",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-500/30"
    },
    {
      title: "Avancement moyen",
      value: "0%",
      subtitle: "Toutes affaires",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      shadow: "shadow-green-500/30"
    },
    {
      title: "Taux de couverture",
      value: "0%",
      subtitle: "Ressources / Besoins",
      icon: Users,
      color: "from-cyan-500 to-cyan-600",
      shadow: "shadow-cyan-500/30"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {kpi.title}
            </CardTitle>
            <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center shadow-md ${kpi.shadow}`}>
              <kpi.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpi.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

