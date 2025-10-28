"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Users, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  UserPlus,
  UserX,
  Eye
} from "lucide-react"

interface AccessRequest {
  id: string
  email: string
  prenom: string
  nom: string
  message: string
  statut: "pending" | "approved" | "rejected"
  created_at: string
  processed_at?: string
  processed_by?: string
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [rejectReason, setRejectReason] = useState("")

  // Charger les demandes d'accès
  const loadRequests = async () => {
    try {
      const response = await fetch("/api/admin/access-requests")
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests)
        setFilteredRequests(data.requests)
      } else {
        toast.error("Erreur lors du chargement des demandes")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du chargement des demandes")
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les demandes
  useEffect(() => {
    let filtered = requests

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.statut === statusFilter)
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }, [requests, statusFilter, searchTerm])

  useEffect(() => {
    loadRequests()
  }, [])

  // Approuver une demande
  const handleApprove = async () => {
    if (!selectedRequest || !selectedRole) return

    try {
      const response = await fetch("/api/admin/approve-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          roleId: selectedRole
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Demande approuvée et compte créé")
        setShowApproveModal(false)
        setSelectedRequest(null)
        loadRequests()
      } else {
        toast.error(data.message || "Erreur lors de l'approbation")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de l'approbation")
    }
  }

  // Rejeter une demande
  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch("/api/admin/reject-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          reason: rejectReason
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Demande rejetée")
        setShowRejectModal(false)
        setSelectedRequest(null)
        setRejectReason("")
        loadRequests()
      } else {
        toast.error(data.message || "Erreur lors du rejet")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors du rejet")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approuvée</Badge>
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.statut === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des demandes d'accès...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Demandes d'Accès
              </h1>
              <p className="text-slate-600">Approuver ou rejeter les demandes d'accès</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">En attente</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{getStatusCount("pending")}</div>
              <p className="text-xs text-slate-500 mt-1">Demandes à traiter</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Approuvées</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{getStatusCount("approved")}</div>
              <p className="text-xs text-slate-500 mt-1">Comptes créés</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Rejetées</CardTitle>
              <XCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{getStatusCount("rejected")}</div>
              <p className="text-xs text-slate-500 mt-1">Demandes refusées</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Email, prénom, nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Aucune demande d'accès trouvée</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.prenom} {request.nom}</h3>
                        {getStatusBadge(request.statut)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      {request.message && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded">
                          {request.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {request.statut === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowApproveModal(true)
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowRejectModal(true)
                            }}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modale d'approbation */}
        <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approuver la demande d'accès</DialogTitle>
              <DialogDescription>
                Créer un compte pour {selectedRequest?.prenom} {selectedRequest?.nom}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Rôle à assigner</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="planificateur">Planificateur</SelectItem>
                    <SelectItem value="ca">Chargé d'Affaires</SelectItem>
                    <SelectItem value="resp_site">Responsable de Site</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                    <SelectItem value="direction">Direction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={!selectedRole}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Créer le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modale de rejet */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la demande d'accès</DialogTitle>
              <DialogDescription>
                Rejeter la demande de {selectedRequest?.prenom} {selectedRequest?.nom}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Motif du rejet</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <UserX className="h-4 w-4 mr-1" />
                Rejeter la demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}