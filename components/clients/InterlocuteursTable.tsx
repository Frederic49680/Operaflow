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
import { MoreHorizontal, Edit, Trash2, Users, Mail, Phone, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InterlocuteurFormModal } from "./InterlocuteurFormModal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Interlocuteur {
  id: string
  nom: string
  prenom: string
  nom_client: string
  fonction?: string
  type_interlocuteur: string
  email?: string
  telephone?: string
  site_nom?: string
  actif: boolean
}

export function InterlocuteursTable() {
  const [interlocuteurs, setInterlocuteurs] = useState<Interlocuteur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInterlocuteurs()
  }, [])

  const loadInterlocuteurs = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('interlocuteurs')
        .select(`
          id,
          nom,
          prenom,
          fonction,
          type_interlocuteur,
          email,
          telephone,
          actif,
          clients!inner(nom_client),
          sites(nom)
        `)
        .eq('actif', true)
        .order('nom')

      if (error) {
        console.error('Erreur chargement interlocuteurs:', error)
        setError('Erreur lors du chargement des contacts')
        return
      }

      // Transformer les données pour correspondre à l'interface
      const formattedData = data?.map(item => ({
        id: item.id,
        nom: item.nom,
        prenom: item.prenom,
        nom_client: item.clients?.nom_client || 'Client inconnu',
        fonction: item.fonction || '',
        type_interlocuteur: item.type_interlocuteur || '',
        email: item.email || '',
        telephone: item.telephone || '',
        site_nom: item.sites?.nom || '',
        actif: item.actif
      })) || []

      setInterlocuteurs(formattedData)
    } catch (err) {
      console.error('Erreur chargement interlocuteurs:', err)
      setError('Erreur lors du chargement des contacts')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadInterlocuteurs()
    }
    window.addEventListener('interlocuteur-created', handleRefresh)
    return () => window.removeEventListener('interlocuteur-created', handleRefresh)
  }, [])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Technique":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Technique</Badge>
      case "Administratif":
        return <Badge className="bg-green-500 hover:bg-green-600">Administratif</Badge>
      case "Facturation":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Facturation</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des contacts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadInterlocuteurs} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (interlocuteurs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun contact pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par ajouter vos premiers contacts clients
        </p>
        <InterlocuteurFormModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Ajouter un contact
          </Button>
        </InterlocuteurFormModal>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
            <TableHead className="font-semibold text-slate-700">Client</TableHead>
            <TableHead className="font-semibold text-slate-700">Fonction</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="font-semibold text-slate-700">Téléphone</TableHead>
            <TableHead className="font-semibold text-slate-700">Site</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interlocuteurs.map((interlocuteur) => (
            <TableRow key={interlocuteur.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">
                {interlocuteur.prenom} {interlocuteur.nom}
              </TableCell>
              <TableCell className="text-slate-600">{interlocuteur.nom_client}</TableCell>
              <TableCell className="text-slate-600">{interlocuteur.fonction || "-"}</TableCell>
              <TableCell>{getTypeBadge(interlocuteur.type_interlocuteur)}</TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.email ? (
                  <a href={`mailto:${interlocuteur.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Mail className="h-3 w-3" />
                    {interlocuteur.email}
                  </a>
                ) : "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.telephone ? (
                  <a href={`tel:${interlocuteur.telephone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {interlocuteur.telephone}
                  </a>
                ) : "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                {interlocuteur.site_nom || "-"}
              </TableCell>
              <TableCell>
                {interlocuteur.actif ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>
                ) : (
                  <Badge className="bg-slate-500 hover:bg-slate-600">Inactif</Badge>
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
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" />
                      Contacter
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                      Désactiver
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

