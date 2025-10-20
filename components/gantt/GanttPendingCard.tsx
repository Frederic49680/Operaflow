'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, User, Euro, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DeclarePlanificationModal } from '../affaires/DeclarePlanificationModal'
import { useState } from 'react'

interface AffaireAPlanifier {
  id: string
  code_affaire: string
  nom: string
  site_nom: string
  responsable_nom: string
  type_contrat: string
  montant_total_ht: number
  statut: string
  nb_lots_financiers: number
  montant_lots_ht: number
}

interface GanttPendingCardProps {
  affaire: AffaireAPlanifier
  onDeclared: () => void
}

export function GanttPendingCard({ affaire, onDeclared }: GanttPendingCardProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{affaire.nom}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{affaire.code_affaire}</p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              À planifier
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{affaire.site_nom}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{affaire.responsable_nom}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span>
                {affaire.montant_total_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{affaire.type_contrat}</Badge>
              <span className="text-muted-foreground">
                {affaire.nb_lots_financiers} lot(s) financier(s)
              </span>
            </div>

            {affaire.nb_lots_financiers === 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Aucun lot financier défini</span>
              </div>
            )}

            <Button
              onClick={() => setShowModal(true)}
              className="w-full"
              disabled={affaire.nb_lots_financiers === 0}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Déclarer la planification
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeclarePlanificationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onDeclared}
        affaire={affaire}
      />
    </>
  )
}

