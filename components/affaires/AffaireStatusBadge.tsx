"use client"

import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Send, 
  GanttChart, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react"

interface AffaireStatusBadgeProps {
  statut: string
  size?: "sm" | "md" | "lg"
}

export default function AffaireStatusBadge({ 
  statut, 
  size = "md" 
}: AffaireStatusBadgeProps) {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "Brouillon":
        return {
          label: "Brouillon",
          icon: FileText,
          variant: "secondary" as const,
          className: "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100",
        }
      case "Soumise":
      case "Soumise à planif":
        return {
          label: "Soumise à planif",
          icon: Send,
          variant: "outline" as const,
          className: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
        }
      case "Planifiée":
        return {
          label: "Planifiée",
          icon: GanttChart,
          variant: "default" as const,
          className: "bg-green-50 text-green-700 border-green-300 hover:bg-green-100",
        }
      case "En suivi":
        return {
          label: "En suivi",
          icon: TrendingUp,
          variant: "default" as const,
          className: "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100",
        }
      case "Clôturée":
        return {
          label: "Clôturée",
          icon: CheckCircle2,
          variant: "secondary" as const,
          className: "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
        }
      default:
        return {
          label: statut,
          icon: FileText,
          variant: "outline" as const,
          className: "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
        }
    }
  }

  const config = getStatusConfig(statut)
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5 font-medium`}
    >
      <Icon className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"}`} />
      {config.label}
    </Badge>
  )
}

