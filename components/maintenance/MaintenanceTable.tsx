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
import { MoreHorizontal, Edit, Trash2, Wrench, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MaintenanceFormModal } from "./MaintenanceFormModal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Intervention {
  id: string
  tranche: number
  systeme_elementaire: string
  systeme?: string
  type_maintenance?: string
  etat_reel: string
  heures_presence: number
  heures_suspension: number
  heures_metal: number
  motif?: string
  description?: string
}

export function MaintenanceTable() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadInterventions()
  }, [])

  const loadInterventions = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('maintenance_journal')
        .select('*')
        .order('date_jour', { ascending: false })

      if (error) throw error

      setInterventions(data || [])
    } catch (err) {
      console.error('Erreur chargement interventions:', err)
      setError('Erreur lors du chargement des interventions')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadInterventions()
    }
    window.addEventListener('intervention-created', handleRefresh)
    return () => window.removeEventListener('intervention-created', handleRefresh)
  }, [])

  const handleEdit = (intervention: Intervention) => {
    setSelectedIntervention(intervention)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      // TODO: Implémenter la suppression
      console.log("Suppression de l'intervention:", id)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Préventive":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Préventive</Badge>
      case "Corrective":
        return <Badge className="bg-red-500 hover:bg-red-600">Corrective</Badge>
      case "Contrôle":
        return <Badge className="bg-green-500 hover:bg-green-600">Contrôle</Badge>
      case "Amélioration":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Amélioration</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Non_lancee":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Non lancée</Badge>
      case "En_cours":
        return <Badge className="bg-blue-500 hover:bg-blue-600">En cours</Badge>
      case "Termine":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminée</Badge>
      case "Prolongee":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Prolongée</Badge>
      case "Reportee":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reportée</Badge>
      case "Suspendue":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspendue</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des interventions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadInterventions} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (interventions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune intervention enregistrée
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par enregistrer vos interventions
        </p>
        <MaintenanceFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Enregistrer une intervention
          </Button>
        </MaintenanceFormModal>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Tranche</TableHead>
            <TableHead className="font-semibold text-slate-700">Système Élémentaire</TableHead>
            <TableHead className="font-semibold text-slate-700">Système</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">État</TableHead>
            <TableHead className="font-semibold text-slate-700">Présence</TableHead>
            <TableHead className="font-semibold text-slate-700">Suspension</TableHead>
            <TableHead className="font-semibold text-slate-700">Métal</TableHead>
            <TableHead className="font-semibold text-slate-700">Description</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interventions.map((intervention) => (
            <TableRow key={intervention.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">
                <Badge variant="outline" className="font-mono">
                  {intervention.tranche}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-slate-900">
                {intervention.systeme_elementaire}
              </TableCell>
              <TableCell className="text-slate-600">
                {intervention.systeme || "-"}
              </TableCell>
              <TableCell>
                {intervention.type_maintenance ? (
                  getTypeBadge(intervention.type_maintenance)
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{getStatutBadge(intervention.etat_reel)}</TableCell>
              <TableCell className="text-slate-600">
                {intervention.heures_presence}h
              </TableCell>
              <TableCell className="text-slate-600">
                {intervention.heures_suspension}h
              </TableCell>
              <TableCell className="font-semibold text-blue-600">
                {intervention.heures_metal}h
              </TableCell>
              <TableCell className="text-slate-600 max-w-xs truncate">
                {intervention.description || "-"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => handleEdit(intervention)}
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-red-600 cursor-pointer"
                      onClick={() => handleDelete(intervention.id)}
                    >
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

      {/* Modal de modification */}
      {selectedIntervention && (
        <MaintenanceFormModal 
          interventionId={selectedIntervention.id}
          interventionData={selectedIntervention}
          onClose={() => {
            setSelectedIntervention(null)
            setIsModalOpen(false)
          }}
        >
          <button 
            style={{ display: 'none' }}
            onClick={() => setIsModalOpen(true)}
          />
        </MaintenanceFormModal>
      )}
    </div>
  )
}

