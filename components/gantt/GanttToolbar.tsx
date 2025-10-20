"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Download,
  Upload,
  Filter,
  Settings,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react"

interface GanttToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onReset?: () => void
  onSave?: () => void
  onExport?: () => void
  onImport?: () => void
  onFilter?: () => void
  onSettings?: () => void
  zoomLevel?: number
  taskCount?: number
  alertCount?: number
  activeFiltersCount?: number
}

export default function GanttToolbar({
  onZoomIn,
  onZoomOut,
  onReset,
  onSave,
  onExport,
  onImport,
  onFilter,
  onSettings,
  zoomLevel = 1,
  taskCount = 0,
  alertCount = 0,
  activeFiltersCount = 0,
}: GanttToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Actions principales */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Badge variant="secondary" className="px-3 py-1 min-w-[60px] text-center">
          {Math.round(zoomLevel * 100)}%
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Statistiques */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">
            {taskCount} tâche{taskCount > 1 ? "s" : ""}
          </span>
        </div>
        {alertCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600">
              {alertCount} alerte{alertCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Actions secondaires */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importer
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}

