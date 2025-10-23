"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, GanttChart, AlertTriangle, Calendar, Wrench, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function DashboardKPICards() {
  const [kpis, setKpis] = useState([
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
  ])

  useEffect(() => {
    loadKPIs()
  }, [])

  const loadKPIs = async () => {
    try {
      const supabase = createClient()
      
      // Charger les collaborateurs avec filtrage admin
      const { data: collaborateurs, error: collabError } = await supabase
        .from('ressources')
        .select('actif, type_contrat, email_pro, prenom, nom')

      if (collabError) throw collabError

      // Filtrer les collaborateurs non-admin (même logique que la page collaborateurs)
      const nonAdminData = collaborateurs?.filter((c: any) => {
        const email = c.email_pro?.toLowerCase() || ''
        const prenom = c.prenom?.toLowerCase() || ''
        const nom = c.nom?.toLowerCase() || ''
        
        const isAdminEmail = email.includes('admin') || email.includes('administrateur')
        const isAdminName = prenom.includes('admin') || nom.includes('admin') || 
                           prenom.includes('administrateur') || nom.includes('administrateur')
        
        return !isAdminEmail && !isAdminName
      }) || []

      // Charger les affaires
      const { data: affaires, error: affairesError } = await supabase
        .from('affaires')
        .select('statut')

      if (affairesError) throw affairesError

      // Charger les tâches
      const { data: taches, error: tachesError } = await supabase
        .from('planning_taches')
        .select('statut')

      if (tachesError) throw tachesError

      // Charger les claims
      const { data: claims, error: claimsError } = await supabase
        .from('claims')
        .select('statut')

      if (claimsError) throw claimsError

      // Charger les absences
      const { data: absences, error: absencesError } = await supabase
        .from('absences')
        .select('date_debut, date_fin')

      if (absencesError) throw absencesError

      // Calculer les KPI
      const ressourcesActives = nonAdminData.filter(c => c.actif).length
      const affairesActives = affaires?.filter(a => ['Validée', 'En cours'].includes(a.statut)).length || 0
      const tachesEnCours = taches?.filter(t => t.statut === 'En cours').length || 0
      const claimsOuverts = claims?.filter(c => c.statut === 'Ouvert').length || 0
      
      // Absences dans les 7 prochains jours
      const aujourdHui = new Date()
      const dans7Jours = new Date()
      dans7Jours.setDate(aujourdHui.getDate() + 7)
      
      const absences7Jours = absences?.filter(a => {
        const dateDebut = new Date(a.date_debut)
        return dateDebut >= aujourdHui && dateDebut <= dans7Jours
      }).length || 0

      // Mettre à jour les KPI
      setKpis(prev => prev.map(kpi => {
        switch (kpi.title) {
          case "Ressources actives":
            return { ...kpi, value: ressourcesActives.toString() }
          case "Affaires actives":
            return { ...kpi, value: affairesActives.toString() }
          case "Tâches en cours":
            return { ...kpi, value: tachesEnCours.toString() }
          case "Claims ouverts":
            return { ...kpi, value: claimsOuverts.toString() }
          case "Absences (7j)":
            return { ...kpi, value: absences7Jours.toString() }
          default:
            return kpi
        }
      }))
    } catch (error) {
      console.error('Erreur chargement KPI:', error)
    }
  }

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

