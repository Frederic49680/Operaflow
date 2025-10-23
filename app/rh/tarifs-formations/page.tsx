"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Euro,
  Users,
  Calendar,
  Building2
} from "lucide-react"
import { useState } from "react"

interface Tarif {
  id: string
  formation: string
  organisme: string
  modalite: 'presentiel' | 'distanciel' | 'mixte'
  tarif_unitaire: number
  tarif_groupe: number
  nb_participants_min: number
  nb_participants_max: number
  duree_jours: number
  validite_debut: string
  validite_fin: string
  statut: 'actif' | 'inactif'
  created_at: string
}

export default function TarifsFormationsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([
    {
      id: "1",
      formation: "SST - Sauveteur Secouriste du Travail",
      organisme: "AFNOR Formation",
      modalite: 'presentiel',
      tarif_unitaire: 250,
      tarif_groupe: 2000,
      nb_participants_min: 8,
      nb_participants_max: 12,
      duree_jours: 2,
      validite_debut: "2024-01-01",
      validite_fin: "2024-12-31",
      statut: 'actif',
      created_at: "2024-01-15"
    },
    {
      id: "2",
      formation: "Habilitation électrique B0",
      organisme: "CNAM",
      modalite: 'presentiel',
      tarif_unitaire: 180,
      tarif_groupe: 1500,
      nb_participants_min: 6,
      nb_participants_max: 10,
      duree_jours: 1,
      validite_debut: "2024-01-01",
      validite_fin: "2024-12-31",
      statut: 'actif',
      created_at: "2024-01-10"
    },
    {
      id: "3",
      formation: "Management d'équipe",
      organisme: "AFNOR Formation",
      modalite: 'mixte',
      tarif_unitaire: 400,
      tarif_groupe: 3200,
      nb_participants_min: 6,
      nb_participants_max: 8,
      duree_jours: 3,
      validite_debut: "2024-01-01",
      validite_fin: "2024-12-31",
      statut: 'actif',
      created_at: "2024-01-20"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null)

  const filteredTarifs = tarifs.filter(tarif =>
    tarif.formation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarif.organisme.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getModaliteIcon = (modalite: string) => {
    switch (modalite) {
      case 'presentiel':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'distanciel':
        return <Calendar className="h-4 w-4 text-green-600" />
      case 'mixte':
        return <Building2 className="h-4 w-4 text-purple-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getModaliteLabel = (modalite: string) => {
    switch (modalite) {
      case 'presentiel':
        return 'Présentiel'
      case 'distanciel':
        return 'Distanciel'
      case 'mixte':
        return 'Mixte'
      default:
        return modalite
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tarifs formations</h1>
              <p className="text-gray-600 mt-2">
                Gérer les tarifs unitaires et de groupe
              </p>
            </div>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau tarif
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un tarif de formation</DialogTitle>
                  <DialogDescription>
                    Définissez les tarifs pour une formation
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formation">Formation</Label>
                    <Input id="formation" placeholder="Nom de la formation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisme">Organisme</Label>
                    <Input id="organisme" placeholder="Nom de l'organisme" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalite">Modalité</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presentiel">Présentiel</SelectItem>
                        <SelectItem value="distanciel">Distanciel</SelectItem>
                        <SelectItem value="mixte">Mixte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duree">Durée (jours)</Label>
                    <Input id="duree" type="number" placeholder="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarif_unitaire">Tarif unitaire (€)</Label>
                    <Input id="tarif_unitaire" type="number" placeholder="250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarif_groupe">Tarif groupe (€)</Label>
                    <Input id="tarif_groupe" type="number" placeholder="2000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants_min">Participants min</Label>
                    <Input id="participants_min" type="number" placeholder="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants_max">Participants max</Label>
                    <Input id="participants_max" type="number" placeholder="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validite_debut">Validité début</Label>
                    <Input id="validite_debut" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validite_fin">Validité fin</Label>
                    <Input id="validite_fin" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setShowAddModal(false)}>
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par formation ou organisme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tableau des tarifs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des tarifs ({filteredTarifs.length})</CardTitle>
            <CardDescription>
              Tarifs des formations par organisme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Organisme</TableHead>
                  <TableHead>Modalité</TableHead>
                  <TableHead>Tarifs</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTarifs.map((tarif) => (
                  <TableRow key={tarif.id}>
                    <TableCell>
                      <div className="font-medium">{tarif.formation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{tarif.organisme}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getModaliteIcon(tarif.modalite)}
                        <span className="text-sm">{getModaliteLabel(tarif.modalite)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          <span className="font-medium">{tarif.tarif_unitaire}€</span>
                          <span className="text-gray-500">unitaire</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Euro className="h-3 w-3" />
                          <span>{tarif.tarif_groupe}€</span>
                          <span className="text-gray-500">groupe</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {tarif.nb_participants_min} - {tarif.nb_participants_max}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {tarif.duree_jours} jour{tarif.duree_jours > 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tarif.validite_debut}</div>
                        <div className="text-gray-500">au {tarif.validite_fin}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTarif(tarif)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
