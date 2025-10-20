"use client"

import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface ValidationResult {
  valid: boolean
  conflicts?: Array<{
    type: string
    message: string
    [key: string]: any
  }>
  warnings?: Array<{
    type: string
    message: string
    [key: string]: any
  }>
}

interface GanttValidationProps {
  validation: ValidationResult | null
}

export default function GanttValidation({ validation }: GanttValidationProps) {
  if (!validation) return null

  const { valid, conflicts = [], warnings = [] } = validation

  return (
    <div className="space-y-3">
      {/* Statut global */}
      <Card className={`p-4 ${valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center gap-3">
          {valid ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Validation réussie</p>
                <p className="text-sm text-green-700">
                  Le déplacement est autorisé
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Validation échouée</p>
                <p className="text-sm text-red-700">
                  Le déplacement n'est pas autorisé
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Conflits */}
      {conflicts.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Conflits détectés</h4>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-white rounded border border-red-200"
              >
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-900">{conflict.message}</p>
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {conflict.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Avertissements */}
      {warnings.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900">Avertissements</h4>
          </div>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-white rounded border border-orange-200"
              >
                <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-orange-900">{warning.message}</p>
                  <Badge variant="outline" className="mt-1 text-xs border-orange-300 text-orange-700">
                    {warning.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

