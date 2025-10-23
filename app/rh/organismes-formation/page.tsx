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
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react"
import { useState } from "react"

interface Organisme {
  id: string
  nom: string
  siret: string
  adresse: string
  telephone: string
  email: string
  site_web: string
  contact_principal: string
  statut: 'actif' | 'inactif'
  specialites: string[]
  created_at: string
}

export default function OrganismesFormationPage() {
  const [organismes, setOrganismes] = useState<Organisme[]>([
    {
      id: "1",
      nom: "AFNOR Formation",
      siret: "12345678901234",
      adresse: "11 rue Francis de Pressensé, 93571 La Plaine Saint-Denis",
      telephone: "01 41 62 80 00",
      email: "formation@afnor.org",
      site_web: "https://formation.afnor.org",
      contact_principal: "Marie Dupont",
      statut: 'actif',
      specialites: ['Qualité', 'Sécurité', 'Environnement'],
      created_at: "2024-01-15"
    },
    {
      id: "2",
      nom: "CNAM",
      siret: "12345678901235",
      adresse: "292 rue Saint-Martin, 75003 Paris",
      telephone: "01 40 27 20 00",
      email: "contact@cnam.fr",
      site_web: "https://www.cnam.fr",
      contact_principal: "Jean Martin",
      statut: 'actif',
      specialites: ['Technique', 'Management', 'Digital'],
      created_at: "2024-01-10"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOrganisme, setEditingOrganisme] = useState<Organisme | null>(null)

  const filteredOrganismes = organismes.filter(org =>
    org.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.specialites.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organismes de formation</h1>
              <p className="text-gray-600 mt-2">
                Gérer les organismes de formation partenaires
              </p>
            </div>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel organisme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un organisme de formation</DialogTitle>
                  <DialogDescription>
                    Renseignez les informations de l'organisme partenaire
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom de l'organisme</Label>
                    <Input id="nom" placeholder="Ex: AFNOR Formation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input id="siret" placeholder="12345678901234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Textarea id="adresse" placeholder="Adresse complète" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" placeholder="01 23 45 67 89" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contact@organisme.fr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_web">Site web</Label>
                    <Input id="site_web" placeholder="https://www.organisme.fr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact principal</Label>
                    <Input id="contact" placeholder="Nom du contact" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialites">Spécialités</Label>
                    <Input id="specialites" placeholder="Qualité, Sécurité, Environnement" />
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
              placeholder="Rechercher par nom ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tableau des organismes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des organismes ({filteredOrganismes.length})</CardTitle>
            <CardDescription>
              Organismes de formation partenaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisme</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Spécialités</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganismes.map((organisme) => (
                  <TableRow key={organisme.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{organisme.nom}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {organisme.adresse}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {organisme.telephone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {organisme.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{organisme.contact_principal}</div>
                        {organisme.site_web && (
                          <a 
                            href={organisme.site_web} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Site web
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {organisme.specialites.map((specialite, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialite}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={organisme.statut === 'actif' ? 'default' : 'secondary'}>
                        {organisme.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingOrganisme(organisme)}
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
