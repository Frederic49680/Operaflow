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
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Target,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useState } from "react"

interface Competence {
  id: string
  code: string
  label: string
  description: string
  category: string
  niveau_requis: number
  actif: boolean
  created_at: string
}

export default function CompetencesPage() {
  const [competences, setCompetences] = useState<Competence[]>([
    {
      id: "1",
      code: "AUTO",
      label: "Automatisme",
      description: "Compétences en automatisme industriel et systèmes de contrôle",
      category: "TECHNIQUE",
      niveau_requis: 3,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "2",
      code: "IEG",
      label: "Installation Électrique Générale",
      description: "Installation et maintenance d'équipements électriques",
      category: "TECHNIQUE",
      niveau_requis: 4,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "3",
      code: "IES",
      label: "Installation Électrique Spécialisée",
      description: "Installations électriques haute tension et spécialisées",
      category: "TECHNIQUE",
      niveau_requis: 5,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "4",
      code: "CVC",
      label: "Chauffage Ventilation Climatisation",
      description: "Installation et maintenance de systèmes CVC",
      category: "TECHNIQUE",
      niveau_requis: 3,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "5",
      code: "SECU",
      label: "Sécurité",
      description: "Compétences en sécurité au travail et prévention",
      category: "SECURITE",
      niveau_requis: 2,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "6",
      code: "QUAL",
      label: "Qualité",
      description: "Gestion de la qualité et certification",
      category: "QUALITE",
      niveau_requis: 4,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "7",
      code: "MANAG",
      label: "Management",
      description: "Encadrement d'équipe et gestion de projet",
      category: "MANAGEMENT",
      niveau_requis: 6,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "8",
      code: "ADMIN",
      label: "Administratif",
      description: "Gestion administrative et comptable",
      category: "ADMINISTRATIF",
      niveau_requis: 2,
      actif: true,
      created_at: "2024-01-15"
    },
    {
      id: "9",
      code: "COMM",
      label: "Commercial",
      description: "Développement commercial et relation client",
      category: "COMMERCIAL",
      niveau_requis: 3,
      actif: true,
      created_at: "2024-01-15"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCompetence, setEditingCompetence] = useState<Competence | null>(null)

  const filteredCompetences = competences.filter(comp =>
    comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors = {
      'TECHNIQUE': 'bg-blue-100 text-blue-800',
      'SECURITE': 'bg-red-100 text-red-800',
      'QUALITE': 'bg-green-100 text-green-800',
      'MANAGEMENT': 'bg-purple-100 text-purple-800',
      'ADMINISTRATIF': 'bg-gray-100 text-gray-800',
      'COMMERCIAL': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  const getNiveauColor = (niveau: number) => {
    if (niveau <= 2) return 'bg-green-100 text-green-800'
    if (niveau <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compétences</h1>
              <p className="text-gray-600 mt-2">
                Gérer les compétences et leurs niveaux requis
              </p>
            </div>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle compétence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter une compétence</DialogTitle>
                  <DialogDescription>
                    Définissez une nouvelle compétence et ses caractéristiques
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" placeholder="Ex: AUTO" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Libellé</Label>
                    <Input id="label" placeholder="Ex: Automatisme" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Description de la compétence" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input id="category" placeholder="Ex: TECHNIQUE" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveau">Niveau requis (1-8)</Label>
                    <Input id="niveau" type="number" min="1" max="8" placeholder="3" />
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
              placeholder="Rechercher par compétence, code ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total compétences</p>
                  <p className="text-2xl font-bold">{competences.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actives</p>
                  <p className="text-2xl font-bold">{competences.filter(c => c.actif).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Catégories</p>
                  <p className="text-2xl font-bold">{new Set(competences.map(c => c.category)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Niveau moyen</p>
                  <p className="text-2xl font-bold">
                    {(competences.reduce((acc, c) => acc + c.niveau_requis, 0) / competences.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des compétences */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des compétences ({filteredCompetences.length})</CardTitle>
            <CardDescription>
              Gestion des compétences et de leurs niveaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Compétence</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Niveau requis</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetences.map((competence) => (
                  <TableRow key={competence.id}>
                    <TableCell>
                      <div className="font-mono font-medium">{competence.code}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{competence.label}</div>
                        <div className="text-sm text-gray-500">{competence.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(competence.category)}>
                        {competence.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getNiveauColor(competence.niveau_requis)}>
                        N{competence.niveau_requis}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={competence.actif ? 'default' : 'secondary'}>
                        {competence.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCompetence(competence)}
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
