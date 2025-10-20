"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, ClipboardList, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RemonteeFormModal } from "./RemonteeFormModal"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Remontee {
  id: string
  tache_libelle: string
  affaire_code: string
  site_nom: string
  statut_reel: string
  avancement_pct: number
  nb_present: number
  nb_planifie: number
  heures_metal: number
  motif?: string
  etat_confirme: boolean
}

export function RemonteesTable() {
  const [remontees, setRemontees] = useState<Remontee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRemontees()
  }, [])

  const loadRemontees = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('remontee_site')
        .select(`
          *,
          tache_id:planning_taches (
            libelle_tache
          ),
          affaire_id:affaires (
            code_affaire
          ),
          site_id:sites (
            nom
          )
        `)
        .order('date_saisie', { ascending: false })

      if (error) throw error

      const formattedData = data?.map((remontee: any) => ({
        id: remontee.id,
        tache_libelle: remontee.tache_id?.[0]?.libelle_tache || 'N/A',
        affaire_code: remontee.affaire_id?.[0]?.code_affaire || 'N/A',
        site_nom: remontee.site_id?.[0]?.nom || 'N/A',
        statut_reel: remontee.statut_reel,
        avancement_pct: remontee.avancement_pct,
        nb_present: remontee.nb_present,
        nb_planifie: remontee.nb_planifie,
        heures_metal: remontee.heures_metal,
        motif: remontee.motif,
        etat_confirme: remontee.etat_confirme,
      })) || []

      setRemontees(formattedData)
    } catch (err) {
      console.error('Erreur chargement remontées:', err)
      setError('Erreur lors du chargement des remontées')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadRemontees()
    }
    window.addEventListener('remontee-created', handleRefresh)
    return () => window.removeEventListener('remontee-created', handleRefresh)
  }, [])

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Non lancée":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Non lancée</Badge>
      case "En cours":
        return <Badge className="bg-blue-500 hover:bg-blue-600">En cours</Badge>
      case "Terminée":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminée</Badge>
      case "Bloquée":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloquée</Badge>
      case "Suspendue":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Suspendue</Badge>
      case "Reportée":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Reportée</Badge>
      case "Prolongée":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Prolongée</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des remontées...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadRemontees} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (remontees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune remontée pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par enregistrer les états réels des tâches
        </p>
        <RemonteeFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Enregistrer une remontée
          </Button>
        </RemonteeFormModal>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Tâche</TableHead>
            <TableHead className="font-semibold text-slate-700">Affaire</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">État réel</TableHead>
            <TableHead className="font-semibold text-slate-700">Avancement</TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">Présents</TableHead>
            <TableHead className="font-semibold text-slate-700">Temps métal</TableHead>
            <TableHead className="font-semibold text-slate-700">Motif</TableHead>
            <TableHead className="font-semibold text-slate-700">Confirmé</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {remontees.map((remontee) => (
            <TableRow key={remontee.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">{remontee.tache_libelle}</TableCell>
              <TableCell className="font-mono text-sm text-blue-600">
                {remontee.affaire_code}
              </TableCell>
              <TableCell className="text-slate-600">{remontee.site_nom}</TableCell>
              <TableCell>{getStatutBadge(remontee.statut_reel)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${remontee.avancement_pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {remontee.avancement_pct}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center text-slate-600">
                {remontee.nb_present} / {remontee.nb_planifie}
              </TableCell>
              <TableCell className="text-slate-600">
                {remontee.heures_metal}h
              </TableCell>
              <TableCell className="text-slate-600">
                {remontee.motif || "-"}
              </TableCell>
              <TableCell>
                {remontee.etat_confirme ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Oui</Badge>
                ) : (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">Non</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

