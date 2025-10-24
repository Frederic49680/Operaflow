"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface FilterData {
  searchTerm: string
  typeInterlocuteur: string
  clientId: string
  siteId: string
  actif: string
}

interface InterlocuteursFiltersProps {
  onFiltersChange: (filters: FilterData) => void
  onSearch: (searchTerm: string) => void
}

export function InterlocuteursFilters({ onFiltersChange, onSearch }: InterlocuteursFiltersProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterData>({
    searchTerm: "",
    typeInterlocuteur: "",
    clientId: "",
    siteId: "",
    actif: ""
  })
  const [clients, setClients] = useState<Array<{id: string, nom_client: string}>>([])
  const [sites, setSites] = useState<Array<{id: string, nom: string}>>([])
  const [loading, setLoading] = useState(false)

  const loadClients = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('clients')
        .select('id, nom_client')
        .eq('actif', true)
        .order('nom_client')
      setClients(data || [])
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    }
  }

  const loadSites = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('sites')
        .select('id, nom')
        .in('statut', ['Actif', 'En pause'])
        .order('nom')
      setSites(data || [])
    } catch (error) {
      console.error('Erreur chargement sites:', error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterData, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      typeInterlocuteur: "",
      clientId: "",
      siteId: "",
      actif: ""
    }
    setFilters(clearedFilters)
    setSearchTerm("")
    onFiltersChange(clearedFilters)
    onSearch("")
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== "") || searchTerm !== ""

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 pl-10 border-slate-300"
        />
      </div>

      {/* Bouton Filtres */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                !
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Filtres avancés
            </DialogTitle>
            <DialogDescription>
              Affinez votre recherche avec des critères spécifiques
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Type d'interlocuteur */}
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-slate-700 font-medium">
                Type d'interlocuteur
              </Label>
              <Select 
                value={filters.typeInterlocuteur}
                onValueChange={(value) => handleFilterChange('typeInterlocuteur', value)}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="Technique">Technique</SelectItem>
                  <SelectItem value="Administratif">Administratif</SelectItem>
                  <SelectItem value="Facturation">Facturation</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            <div className="grid gap-2">
              <Label htmlFor="client" className="text-slate-700 font-medium">
                Client
              </Label>
              <Select 
                value={filters.clientId}
                onValueChange={(value) => handleFilterChange('clientId', value)}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Tous les clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom_client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site */}
            <div className="grid gap-2">
              <Label htmlFor="site" className="text-slate-700 font-medium">
                Site
              </Label>
              <Select 
                value={filters.siteId}
                onValueChange={(value) => handleFilterChange('siteId', value)}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Tous les sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statut */}
            <div className="grid gap-2">
              <Label htmlFor="statut" className="text-slate-700 font-medium">
                Statut
              </Label>
              <Select 
                value={filters.actif}
                onValueChange={(value) => handleFilterChange('actif', value)}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Appliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
