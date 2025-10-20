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
import { Input } from "@/components/ui/input"
import { Edit, Trash2, GanttChart, Loader2, Plus, Search, Download, Filter, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TacheFormModal } from "./TacheFormModal"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Tache {
  id: string
  libelle_tache: string
  code_affaire: string
  libelle_lot?: string
  site_nom: string
  type_tache: string
  date_debut_plan: string
  date_fin_plan: string
  avancement_pct: number
  statut: string
  ressource_ids?: string[]
}

export function GanttTable() {
  const [taches, setTaches] = useState<Tache[]>([])
  const [filteredTaches, setFilteredTaches] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatut, setSelectedStatut] = useState<string>("all")
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    loadTaches()
  }, [])

  // Écouter l'événement de création d'affaire pour rafraîchir les tâches
  useEffect(() => {
    const handleAffaireCreated = () => {
      console.log('🔄 GanttTable: Événement affaire-created détecté, rafraîchissement...')
      loadTaches()
    }

    window.addEventListener('affaire-created', handleAffaireCreated)
    
    return () => {
      window.removeEventListener('affaire-created', handleAffaireCreated)
    }
  }, [])

  const loadTaches = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('planning_taches')
        .select(`
          *,
          affaires!inner (
            code_affaire
          ),
          affaires_lots (
            libelle_lot
          ),
          sites!inner (
            nom
          )
        `)
        .order('date_debut_plan')

      if (error) throw error

      const formattedData = data?.map((tache: any) => ({
        id: tache.id,
        libelle_tache: tache.libelle_tache,
        code_affaire: tache.affaires?.code_affaire || 'N/A',
        libelle_lot: tache.affaires_lots?.libelle_lot || '-',
        site_nom: tache.sites?.nom || 'N/A',
        type_tache: tache.type_tache,
        date_debut_plan: tache.date_debut_plan,
        date_fin_plan: tache.date_fin_plan,
        avancement_pct: tache.avancement_pct || 0,
        statut: tache.statut,
        ressource_ids: tache.ressource_ids,
      })) || []

      setTaches(formattedData)
    } catch (err) {
      console.error('Erreur chargement tâches:', err)
      setError('Erreur lors du chargement des tâches')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les tâches
  useEffect(() => {
    let filtered = taches

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter((tache) =>
        tache.libelle_tache.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tache.code_affaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tache.site_nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par statut
    if (selectedStatut !== "all") {
      filtered = filtered.filter((tache) => tache.statut === selectedStatut)
    }

    setFilteredTaches(filtered)
  }, [taches, searchTerm, selectedStatut])

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadTaches()
    }
    window.addEventListener('tache-created', handleRefresh)
    return () => window.removeEventListener('tache-created', handleRefresh)
  }, [])

  const handleDelete = async (tacheId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('planning_taches')
        .delete()
        .eq('id', tacheId)

      if (error) throw error

      toast.success("Tâche supprimée avec succès")
      loadTaches()
    } catch (err) {
      console.error('Erreur suppression:', err)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleExport = () => {
    const csv = [
      ['Tâche', 'Affaire', 'Lot', 'Site', 'Type', 'Début', 'Fin', 'Avancement', 'Statut'],
      ...filteredTaches.map((t) => [
        t.libelle_tache,
        t.code_affaire,
        t.libelle_lot || '',
        t.site_nom,
        t.type_tache,
        t.date_debut_plan,
        t.date_fin_plan,
        t.avancement_pct + '%',
        t.statut,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taches-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Export réussi")
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Non lancé":
        return <Badge className="bg-slate-500 hover:bg-slate-600">Non lancé</Badge>
      case "En cours":
        return <Badge className="bg-blue-500 hover:bg-blue-600">En cours</Badge>
      case "Terminé":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>
      case "Bloqué":
        return <Badge className="bg-red-500 hover:bg-red-600">Bloqué</Badge>
      case "Reporté":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reporté</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des tâches...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GanttChart className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadTaches} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (taches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GanttChart className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune tâche planifiée
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par créer vos premières tâches
        </p>
        <TacheFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Créer une tâche
          </Button>
        </TacheFormModal>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher une tâche, affaire ou site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="Non lancé">Non lancé</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Bloqué">Bloqué</option>
            <option value="Reporté">Reporté</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTaches}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
               <TacheFormModal onSuccess={loadTaches}>
                 <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                   <Plus className="h-4 w-4" />
                   Nouvelle tâche
                 </Button>
               </TacheFormModal>
        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="text-sm text-slate-600">
        {filteredTaches.length} tâche{filteredTaches.length > 1 ? 's' : ''} sur {taches.length} total
      </div>

      {/* Tableau */}
      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Tâche</TableHead>
              <TableHead className="font-semibold text-slate-700">Affaire</TableHead>
              <TableHead className="font-semibold text-slate-700">Lot</TableHead>
              <TableHead className="font-semibold text-slate-700">Site</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Début</TableHead>
              <TableHead className="font-semibold text-slate-700">Fin</TableHead>
            <TableHead className="font-semibold text-slate-700">Avancement</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
          </TableRow>
        </TableHeader>
          <TableBody>
            {filteredTaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                  Aucune tâche trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredTaches.map((tache) => (
            <TableRow 
              key={tache.id} 
              className="hover:bg-slate-50/50 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
                setOpenDropdownId(openDropdownId === tache.id ? null : tache.id)
              }}
            >
              <TableCell className="font-medium">{tache.libelle_tache}</TableCell>
              <TableCell className="font-mono text-sm text-blue-600">
                {tache.code_affaire}
              </TableCell>
              <TableCell className="text-slate-600">
                {tache.libelle_lot || "-"}
              </TableCell>
              <TableCell className="text-blue-600">{tache.site_nom}</TableCell>
              <TableCell className="text-slate-600">{tache.type_tache}</TableCell>
              <TableCell className="text-slate-600">
                {formatDate(tache.date_debut_plan)}
              </TableCell>
              <TableCell className="text-slate-600">
                {formatDate(tache.date_fin_plan)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${tache.avancement_pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {tache.avancement_pct}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatutBadge(tache.statut)}</TableCell>
            </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Menu d'actions invisible */}
      {filteredTaches.map((tache) => (
        <DropdownMenu 
          key={`menu-${tache.id}`}
          open={openDropdownId === tache.id} 
          onOpenChange={(open) => setOpenDropdownId(open ? tache.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <div className="hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48"
            style={{
              position: 'fixed',
              left: menuPosition?.x ? `${menuPosition.x}px` : 'auto',
              top: menuPosition?.y ? `${menuPosition.y}px` : 'auto',
            }}
          >
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => {
                toast.info("Modification de la tâche")
                setOpenDropdownId(null)
              }}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-red-600 cursor-pointer"
              onClick={() => {
                handleDelete(tache.id)
                setOpenDropdownId(null)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  )
}

