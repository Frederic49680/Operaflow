'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Euro, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface FacturationAlertProps {
  affaireId: string
  lotId: string
  lotLibelle: string
  affaireCode: string
  montant: number
  dateEcheance: string
  responsableEmail?: string
}

export function FacturationAlert({
  affaireId,
  lotId,
  lotLibelle,
  affaireCode,
  montant,
  dateEcheance,
  responsableEmail
}: FacturationAlertProps) {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">Facturation possible</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Lot terminé
          </Badge>
          <span className="font-medium">{lotLibelle}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Affaire :</span>
            <p className="font-medium">{affaireCode}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Montant :</span>
            <p className="font-medium">
              {montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Échéance :</span>
            <p className="font-medium">
              {format(new Date(dateEcheance), 'dd/MM/yyyy', { locale: fr })}
            </p>
          </div>
          {responsableEmail && (
            <div>
              <span className="text-muted-foreground">Contact :</span>
              <p className="font-medium text-xs">{responsableEmail}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="default">
            <Euro className="h-3 w-3 mr-2" />
            Créer la facture
          </Button>
          <Button size="sm" variant="outline">
            Voir les détails
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

