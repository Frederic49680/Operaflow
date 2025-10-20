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
import { MoreHorizontal, Edit, Trash2, Layers, Eye, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormBuilderModal } from "./FormBuilderModal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Form {
  id: string
  name: string
  description?: string
  version: number
  published: boolean
  created_at: string
}

export function FormsTable() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setForms(data || [])
    } catch (err) {
      console.error('Erreur chargement forms:', err)
      setError('Erreur lors du chargement des masques')
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir la liste après création
  useEffect(() => {
    const handleRefresh = () => {
      loadForms()
    }
    window.addEventListener('form-created', handleRefresh)
    return () => window.removeEventListener('form-created', handleRefresh)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement des masques...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={loadForms} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun masque pour le moment
        </h3>
        <p className="text-slate-600 mb-6">
          Commencez par créer votre premier masque de saisie
        </p>
        <FormBuilderModal>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            Créer un masque
          </Button>
        </FormBuilderModal>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Nom du masque</TableHead>
            <TableHead className="font-semibold text-slate-700">Description</TableHead>
            <TableHead className="font-semibold text-slate-700">Version</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="font-semibold text-slate-700">Créé le</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">{form.name}</TableCell>
              <TableCell className="text-slate-600">
                {form.description || "-"}
              </TableCell>
              <TableCell className="text-slate-600">
                v{form.version}
              </TableCell>
              <TableCell>
                {form.published ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Publié</Badge>
                ) : (
                  <Badge className="bg-slate-500 hover:bg-slate-600">Brouillon</Badge>
                )}
              </TableCell>
              <TableCell className="text-slate-600">
                {new Date(form.created_at).toLocaleDateString('fr-FR')}
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
                      <Eye className="h-4 w-4" />
                      Prévisualiser
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

