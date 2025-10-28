"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Users, CheckCircle, XCircle, Clock, Mail, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AccessRequest {
  id: string
  email: string
  prenom: string
  nom: string
  message?: string
  statut: 'pending' | 'approved' | 'rejected'
  role_id?: string
  sites_scope?: string[]
  processed_by?: string
  processed_at?: string
  rejection_reason?: string
  created_at: string
}

interface Role {
  id: string
  code: string
  label: string
}

export default function AccessRequestsManager() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const loadRequests = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erreur chargement demandes:", error)
        return
      }

      setRequests(data || [])
      
      // Calculer les statistiques
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.statut === 'pending').length || 0,
        approved: data?.filter(r => r.statut === 'approved').length || 0,
        rejected: data?.filter(r => r.statut === 'rejected').length || 0
      }
      setStats(stats)
    } catch (error) {
      console.error("Erreur chargement demandes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("roles")
        .select("id, code, label")
        .eq("system", false)
        .order("label")

      if (error) {
        console.error("Erreur chargement rôles:", error)
        return
      }

      setRoles(data || [])
    } catch (error) {
      console.error("Erreur chargement rôles:", error)
    }
  }

  useEffect(() => {
    loadRequests()
    loadRoles()
  }, [])

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch("/api/admin/approve-access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          roleId: selectedRole || null
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Demande approuvée avec succès")
        setShowApproveDialog(false)
        setSelectedRequest(null)
        loadRequests()
      } else {
        toast.error(data.message || "Erreur lors de l'approbation")
      }
    } catch (error) {
      console.error("Erreur approbation:", error)
      toast.error("Erreur lors de l'approbation")
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return

    try {
      const response = await fetch("/api/admin/reject-access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          rejectionReason
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Demande rejetée avec succès")
        setShowRejectDialog(false)
        setSelectedRequest(null)
        setRejectionReason("")
        loadRequests()
      } else {
        toast.error(data.message || "Erreur lors du rejet")
      }
    } catch (error) {
      console.error("Erreur rejet:", error)
      toast.error("Erreur lors du rejet")
    }
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approuvée</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Demandes d'accès
          </h2>
          <p className="text-muted-foreground">Gérer les demandes d'accès à l'application</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejetées</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune demande d'accès</h3>
              <p className="text-muted-foreground">Les nouvelles demandes apparaîtront ici.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {request.prenom} {request.nom}
                      </h3>
                      {getStatusBadge(request.statut)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {request.email}
                      </div>
                      <div>
                        <strong>Demandé le:</strong> {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {request.message && (
                        <div>
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}
                      {request.rejection_reason && (
                        <div>
                          <strong>Raison du rejet:</strong> {request.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {request.statut === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowApproveDialog(true)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowRejectDialog(true)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog d'approbation */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande d'accès</DialogTitle>
            <DialogDescription>
              Créer un compte pour {selectedRequest?.prenom} {selectedRequest?.nom}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle à assigner</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-1" />
                Approuver et créer le compte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande d'accès</DialogTitle>
            <DialogDescription>
              Rejeter la demande de {selectedRequest?.prenom} {selectedRequest?.nom}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleReject} 
                variant="destructive"
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
