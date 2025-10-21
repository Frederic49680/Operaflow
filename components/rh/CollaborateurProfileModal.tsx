"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Award,
  Loader2,
  Building2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CollaborateurProfileModalProps {
  collaborateurId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CollaborateurData {
  id: string
  nom: string
  prenom: string
  site?: {
    code_site: string
    nom: string
  } | null
  type_contrat: string
  email_pro?: string
  email_perso?: string
  telephone?: string
  adresse_postale?: string
  competences?: string[]
  actif: boolean
  date_entree?: string
  date_sortie?: string
  date_creation?: string
}

export function CollaborateurProfileModal({ 
  collaborateurId, 
  open, 
  onOpenChange 
}: CollaborateurProfileModalProps) {
  const [loading, setLoading] = useState(true)
  const [collaborateur, setCollaborateur] = useState<CollaborateurData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCollaborateurProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('ressources')
        .select(`
          *,
          site_id:sites (
            code_site,
            nom
          )
        `)
        .eq('id', collaborateurId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setCollaborateur({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          site: data.site_id || null,
          type_contrat: data.type_contrat,
          email_pro: data.email_pro,
          email_perso: data.email_perso,
          telephone: data.telephone,
          adresse_postale: data.adresse_postale,
          competences: data.competences || [],
          actif: data.actif,
          date_entree: data.date_entree,
          date_sortie: data.date_sortie,
          date_creation: data.date_creation,
        })
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err)
      setError('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }, [collaborateurId])

  useEffect(() => {
    if (open && collaborateurId) {
      loadCollaborateurProfile()
    }
  }, [open, collaborateurId, loadCollaborateurProfile])

  const getContratBadge = (contrat: string) => {
    switch (contrat) {
      case "CDI":
        return <Badge className="bg-green-500 hover:bg-green-600">CDI</Badge>
      case "CDD":
        return <Badge className="bg-blue-500 hover:bg-blue-600">CDD</Badge>
      case "Intérim":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Intérim</Badge>
      case "Apprenti":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Apprenti</Badge>
      default:
        return <Badge>{contrat}</Badge>
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Profil Collaborateur
          </DialogTitle>
          <DialogDescription>
            Informations détaillées du collaborateur
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Chargement du profil...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
          </div>
        )}

        {!loading && !error && collaborateur && (
          <div className="space-y-6">
            {/* En-tête avec nom et statut */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {collaborateur.prenom[0]}{collaborateur.nom[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {collaborateur.prenom} {collaborateur.nom}
                  </h3>
                  <p className="text-slate-600">{collaborateur.type_contrat}</p>
                </div>
              </div>
              <div>
                {collaborateur.actif ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>
                ) : (
                  <Badge className="bg-slate-500 hover:bg-slate-600">Inactif</Badge>
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Nom</p>
                  <p className="font-medium text-slate-900">{collaborateur.nom}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Prénom</p>
                  <p className="font-medium text-slate-900">{collaborateur.prenom}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Type de contrat</p>
                  <div>{getContratBadge(collaborateur.type_contrat)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Site</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    {collaborateur.site ? `${collaborateur.site.code_site} - ${collaborateur.site.nom}` : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Coordonnées
              </h4>
              <div className="space-y-3">
                {collaborateur.email_pro && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Email professionnel</p>
                      <a 
                        href={`mailto:${collaborateur.email_pro}`}
                        className="text-blue-600 hover:underline"
                      >
                        {collaborateur.email_pro}
                      </a>
                    </div>
                  </div>
                )}
                {collaborateur.email_perso && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Email personnel</p>
                      <a 
                        href={`mailto:${collaborateur.email_perso}`}
                        className="text-blue-600 hover:underline"
                      >
                        {collaborateur.email_perso}
                      </a>
                    </div>
                  </div>
                )}
                {collaborateur.telephone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <a 
                        href={`tel:${collaborateur.telephone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {collaborateur.telephone}
                      </a>
                    </div>
                  </div>
                )}
                {collaborateur.adresse_postale && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Adresse</p>
                      <p className="text-slate-900">{collaborateur.adresse_postale}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compétences */}
            {collaborateur.competences && collaborateur.competences.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Compétences
                </h4>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-md">
                  {collaborateur.competences.map((comp, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dates importantes */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Dates importantes
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {collaborateur.date_entree && (
                  <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-xs text-slate-500 mb-1">Date d'entrée</p>
                    <p className="font-medium text-slate-900">{formatDate(collaborateur.date_entree)}</p>
                  </div>
                )}
                {collaborateur.date_sortie && (
                  <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-xs text-slate-500 mb-1">Date de sortie</p>
                    <p className="font-medium text-slate-900">{formatDate(collaborateur.date_sortie)}</p>
                  </div>
                )}
                {collaborateur.date_creation && (
                  <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-xs text-slate-500 mb-1">Date de création</p>
                    <p className="font-medium text-slate-900">{formatDate(collaborateur.date_creation)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

