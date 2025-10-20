"use client"

import { AlertTriangle, X, Clock, Users, FileWarning } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  type: "conflit" | "absence" | "claim" | "dependance"
  message: string
  task_id?: string
  task_name?: string
  severity: "low" | "medium" | "high"
}

interface GanttAlertProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
}

export default function GanttAlert({ alerts, onDismiss }: GanttAlertProps) {
  if (alerts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "conflit":
        return <AlertTriangle className="h-5 w-5" />
      case "absence":
        return <Users className="h-5 w-5" />
      case "claim":
        return <FileWarning className="h-5 w-5" />
      case "dependance":
        return <Clock className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-900"
      case "medium":
        return "bg-orange-50 border-orange-200 text-orange-900"
      case "low":
        return "bg-yellow-50 border-yellow-200 text-yellow-900"
      default:
        return "bg-slate-50 border-slate-200 text-slate-900"
    }
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h4 className="font-semibold text-red-900">
            Alertes Gantt ({alerts.length})
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alerts.forEach((alert) => onDismiss?.(alert.id))}
          className="text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          Tout masquer
        </Button>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getColor(alert.severity)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(alert.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{alert.message}</p>
              {alert.task_name && (
                <p className="text-xs opacity-75 mt-1">Tâche : {alert.task_name}</p>
              )}
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

