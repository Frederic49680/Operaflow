"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, Phone, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface KPIData {
  totalContacts: number
  contactsTechniques: number
  interactions7j: number
  clientsActifs: number
}

export function InterlocuteursKPICards() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalContacts: 0,
    contactsTechniques: 0,
    interactions7j: 0,
    clientsActifs: 0
  })
  const [loading, setLoading] = useState(true)

  const loadKPIData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Total contacts actifs
      const { count: totalContacts } = await supabase
        .from('interlocuteurs')
        .select('*', { count: 'exact', head: true })
        .eq('actif', true)

      // Contacts techniques
      const { count: contactsTechniques } = await supabase
        .from('interlocuteurs')
        .select('*', { count: 'exact', head: true })
        .eq('actif', true)
        .eq('type_interlocuteur', 'Technique')

      // Interactions des 7 derniers jours (simulation - à adapter selon votre table d'interactions)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      // Pour l'instant, on simule avec 0 - à adapter quand vous aurez une table d'interactions
      const interactions7j = 0

      // Clients actifs avec contacts
      const { data: clientsAvecContacts } = await supabase
        .from('clients')
        .select(`
          id,
          interlocuteurs!inner(id)
        `)
        .eq('actif', true)

      setKpiData({
        totalContacts: totalContacts || 0,
        contactsTechniques: contactsTechniques || 0,
        interactions7j,
        clientsActifs: clientsAvecContacts?.length || 0
      })
    } catch (error) {
      console.error('Erreur chargement KPI interlocuteurs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKPIData()
  }, [])

  // Rafraîchir les KPI après création d'interlocuteur
  useEffect(() => {
    const handleRefresh = () => {
      loadKPIData()
    }
    window.addEventListener('interlocuteur-created', handleRefresh)
    return () => window.removeEventListener('interlocuteur-created', handleRefresh)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Chargement...
              </CardTitle>
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-300">-</div>
              <p className="text-xs text-slate-400 mt-1">Chargement...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total contacts */}
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Total contacts
          </CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{kpiData.totalContacts}</div>
          <p className="text-xs text-slate-500 mt-1">
            Contacts actifs
          </p>
        </CardContent>
      </Card>

      {/* Contacts techniques */}
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Contacts techniques
          </CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{kpiData.contactsTechniques}</div>
          <p className="text-xs text-slate-500 mt-1">
            Type technique
          </p>
        </CardContent>
      </Card>

      {/* Interactions 7j */}
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Interactions (7j)
          </CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
            <Mail className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{kpiData.interactions7j}</div>
          <p className="text-xs text-slate-500 mt-1">
            Échanges récents
          </p>
        </CardContent>
      </Card>

      {/* Clients actifs */}
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Clients actifs
          </CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
            <Phone className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{kpiData.clientsActifs}</div>
          <p className="text-xs text-slate-500 mt-1">
            Avec contacts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
