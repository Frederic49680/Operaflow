"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye, X } from "lucide-react"
import { Loader2 } from "lucide-react"
import { OrganismeFormModal } from "./OrganismeFormModal"
import { SuccessToast, ErrorToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Organisme {
  id: string
  nom: string
  siret?: string
  contact?: string
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  domaines?: string[]
  agrement?: string
  actif: boolean
}

interface OrganismesTableProps {
  searchTerm?: string
  showInactiveOrganismes?: boolean
}

export function OrganismesTable({ 
  searchTerm = "", 
  showInactiveOrganismes = false 
}: OrganismesTableProps) {
  const [organismes, setOrganismes] = useState<Organisme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOrganisme, setEditingOrganisme] = useState<Organisme | null>(null)
  const [viewingOrganisme, setViewingOrganisme] = useState<Organisme | null>(null)
  const [deactivatingOrganisme, setDeactivatingOrganisme] = useState<Organisme | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadOrganismes()
  }, [])

  const loadOrganismes = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('organismes_formation')
        .select('*')
        .order('nom')
      
      if (error) throw error
      setOrganismes(data || [])
    } catch (err: any) {
      console.error('Erreur chargement organismes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingOrganisme) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('organismes_formation')
        .update({ actif: false })
        .eq('id', deactivatingOrganisme.id)
      
      if (error) throw error

      setToast({ 
        type: 'success', 
        message: `L'organisme "${deactivatingOrganisme.nom}" a été désactivé avec succès.` 
      })
      
      // Recharger la liste
      await loadOrganismes()
      setDeactivatingOrganisme(null)
    } catch (err: any) {
      console.error('Erreur désactivation organisme:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la désactivation : ${err.message}` 
      })
    }
  }

  const getFilteredOrganismes = () => {
    return organismes.filter(org => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!(
          org.nom?.toLowerCase().includes(searchLower) ||
          org.siret?.toLowerCase().includes(searchLower) ||
          org.contact?.toLowerCase().includes(searchLower) ||
          org.email?.toLowerCase().includes(searchLower)
        )) return false
      }
      
      // Filtre : masquer les inactifs si non coché
      if (!showInactiveOrganismes && !org.actif) return false
      
      return true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Compteur de résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {getFilteredOrganismes().length} organisme(s) trouvé(s)
          {searchTerm && (
            <span className="text-blue-600 ml-2">
              (sur {organismes.length} au total)
            </span>
          )}
          {!showInactiveOrganismes && organismes.filter(o => !o.actif).length > 0 && (
            <span className="text-slate-500 ml-2">
              ({organismes.filter(o => !o.actif).length} organisme(s) inactif(s) masqué(s))
            </span>
          )}
        </p>
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Nom</TableHead>
              <TableHead className="font-semibold text-slate-700">SIRET</TableHead>
              <TableHead className="font-semibold text-slate-700">Contact</TableHead>
              <TableHead className="font-semibold text-slate-700">Email</TableHead>
              <TableHead className="font-semibold text-slate-700">Domaines</TableHead>
              <TableHead className="font-semibold text-slate-700">Statut</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredOrganismes().map((organisme) => (
              <TableRow key={organisme.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">{organisme.nom}</TableCell>
                <TableCell className="font-mono text-sm text-slate-600">
                  {organisme.siret || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {organisme.contact || '-'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {organisme.email || '-'}
                </TableCell>
                <TableCell>
                  {organisme.domaines && organisme.domaines.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {organisme.domaines.slice(0, 2).map((domaine, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {domaine}
                        </Badge>
                      ))}
                      {organisme.domaines.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{organisme.domaines.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {organisme.actif ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => setViewingOrganisme(organisme)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditingOrganisme(organisme)}
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-red-600 cursor-pointer"
                        onClick={() => setDeactivatingOrganisme(organisme)}
                        disabled={!organisme.actif}
                      >
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

      {/* Modals */}
      {editingOrganisme && (
        <OrganismeFormModal
          organisme={editingOrganisme}
          onClose={() => setEditingOrganisme(null)}
          onSuccess={() => {
            loadOrganismes()
            setEditingOrganisme(null)
          }}
        />
      )}

      {/* Modal Voir détails */}
      {viewingOrganisme && (
        <Dialog open={!!viewingOrganisme} onOpenChange={() => setViewingOrganisme(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Détails de l'organisme</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingOrganisme(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Informations complètes de l'organisme de formation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Informations principales */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Nom</p>
                    <p className="text-slate-900">{viewingOrganisme.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">SIRET</p>
                    <p className="text-slate-900 font-mono text-sm">
                      {viewingOrganisme.siret || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Statut</p>
                    {viewingOrganisme.actif ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Agrément</p>
                    <p className="text-slate-900">{viewingOrganisme.agrement || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Contact</p>
                    <p className="text-slate-900">{viewingOrganisme.contact || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Email</p>
                    <p className="text-slate-900">{viewingOrganisme.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Téléphone</p>
                    <p className="text-slate-900">{viewingOrganisme.telephone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                  Adresse
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-600">Adresse</p>
                    <p className="text-slate-900">{viewingOrganisme.adresse || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Code postal</p>
                    <p className="text-slate-900">{viewingOrganisme.code_postal || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Ville</p>
                    <p className="text-slate-900">{viewingOrganisme.ville || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Domaines */}
              {viewingOrganisme.domaines && viewingOrganisme.domaines.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
                    Domaines de formation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingOrganisme.domaines.map((domaine, idx) => (
                      <Badge key={idx} variant="secondary">
                        {domaine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Confirmation désactivation */}
      {deactivatingOrganisme && (
        <Dialog open={!!deactivatingOrganisme} onOpenChange={() => setDeactivatingOrganisme(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Désactiver l'organisme
              </DialogTitle>
              <DialogDescription>
                Cette action masquera l'organisme par défaut
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-slate-700">
                Êtes-vous sûr de vouloir désactiver l'organisme <strong>{deactivatingOrganisme.nom}</strong> ?
              </p>
              <p className="text-sm text-slate-600">
                L'organisme sera masqué par défaut mais pourra être réactivé ultérieurement.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeactivatingOrganisme(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeactivate}
                >
                  Désactiver
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Toast notifications */}
      {toast && (
        <>
          {toast.type === 'success' ? (
            <SuccessToast 
              message={toast.message}
              onClose={() => setToast(null)}
            />
          ) : (
            <ErrorToast 
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
    </>
  )
}

