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
import { MoreHorizontal, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClaimFormModal } from "./ClaimFormModal"
import { Plus } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Claim {
  id: string
  titre: string
  nom_client: string
  code_affaire: string
  type: string
  responsable: string
  montant_estime: number
  montant_final?: number
  statut: string
  date_detection: string
}

export function ClaimsTable() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          affaire_id:affaires (
            code_affaire,
            client_id:clients (
              nom_client
            )
          )
        `)
        .order('date_detection', { ascending: false })

      if (error) throw error

      const formattedData = data?.map((claim: any) => ({
        id: claim.id,
        titre: claim.titre,
        nom_client: claim.affaire_id?.[0]?.client_id?.[0]?.nom_client || 'N/A',
        code_affaire: claim.affaire_id?.[0]?.code_affaire || 'N/A',
        type: claim.type,
        responsable: claim.responsable,
        montant_estime: claim.montant_estime,
        montant_final: claim.montant_final,
        statut: claim.statut,
        date_detection: claim.date_detection,
      })) || []

      setClaims(formattedData)
    } catch (err) {
      console.error('Erreur chargement claims:', err)
      setError('Erreur lors du chargement des réclamations')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadClaims()
    }
    window.addEventListener('claim-created', handleRefresh)
    return () => window.removeEventListener('claim-created', handleRefresh)
  }, [])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Interne":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Interne</Badge>
      case "Client":
        return <Badge className="bg-red-500 hover:bg-red-600">Client</Badge>
      case "Sous-traitant":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Sous-traitant</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Ouvert":
        return <Badge className="bg-red-500 hover:bg-red-600">Ouvert</Badge>
      case "En analyse":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En analyse</Badge>
      case "Validé":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Validé</Badge>
      case "Transmis":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Transmis</Badge>
      case "Clos":
        return <Badge className="bg-green-500 hover:bg-green-600">Clos</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des réclamations...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadClaims} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucune réclamation pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par déclarer une réclamation
        </p>
        <ClaimFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Déclarer une réclamation
          </Button>
        </ClaimFormModal>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Titre</TableHead>
            <TableHead className="font-semibold text-slate-700">Client</TableHead>
            <TableHead className="font-semibold text-slate-700">Affaire</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Responsable</TableHead>
            <TableHead className="font-semibold text-slate-700">Montant estimé</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="font-semibold text-slate-700">Date détection</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">{claim.titre}</TableCell>
              <TableCell className="text-slate-600">{claim.nom_client}</TableCell>
              <TableCell className="font-mono text-sm text-blue-600">
                {claim.code_affaire}
              </TableCell>
              <TableCell>{getTypeBadge(claim.type)}</TableCell>
              <TableCell className="text-slate-600">{claim.responsable}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(claim.montant_estime)}
              </TableCell>
              <TableCell>{getStatutBadge(claim.statut)}</TableCell>
              <TableCell className="text-slate-600">
                {formatDate(claim.date_detection)}
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

