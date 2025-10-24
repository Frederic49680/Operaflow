import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus } from "lucide-react"
import { InterlocuteursTable } from "@/components/clients/InterlocuteursTable"
import { InterlocuteurFormModal } from "@/components/clients/InterlocuteurFormModal"
import { InterlocuteursKPICards } from "@/components/clients/InterlocuteursKPICards"
import { InterlocuteursFilters } from "@/components/clients/InterlocuteursFilters"
import { InterlocuteursExportImport } from "@/components/clients/InterlocuteursExportImport"
import { useState } from "react"

export default function InterlocuteursPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    typeInterlocuteur: "",
    clientId: "",
    siteId: "",
    actif: ""
  })

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="container mx-auto py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Interlocuteurs Clients
              </h2>
              <p className="text-slate-600">Gestion des contacts clients</p>
            </div>
          </div>
        </div>

        {/* KPI Cards dynamiques */}
        <InterlocuteursKPICards />

        {/* Main Card */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-slate-800">Liste des interlocuteurs</CardTitle>
                <CardDescription>
                  Gérez vos contacts clients et leurs liaisons aux affaires
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <InterlocuteursFilters 
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                />
                <InterlocuteursExportImport />
                <InterlocuteurFormModal>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />
                    Nouveau contact
                  </Button>
                </InterlocuteurFormModal>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InterlocuteursTable 
              searchTerm={searchTerm}
              filters={filters}
            />
          </CardContent>
        </Card>
    </div>
  )
}

