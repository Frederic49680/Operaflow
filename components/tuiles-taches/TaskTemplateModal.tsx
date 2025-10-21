"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  GripVertical,
  Calendar,
  Link as LinkIcon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface TemplateItem {
  id: string
  title: string
  level: number
  duration_days: number
  offset_days: number
  link_from_prev?: string
}

interface TaskTemplate {
  id?: string
  name: string
  description: string
  max_level: number
  structure: {
    items: TemplateItem[]
  }
  defaults: {
    status: string
    work_days_only: boolean
  }
}

interface TaskTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: TaskTemplate | null
  onSave: (template: TaskTemplate) => void
}

export default function TaskTemplateModal({ 
  isOpen, 
  onClose, 
  template = null, 
  onSave 
}: TaskTemplateModalProps) {
  const [formData, setFormData] = useState<TaskTemplate>({
    name: "",
    description: "",
    max_level: 3,
    structure: { items: [] },
    defaults: { status: "Non lancé", work_days_only: true }
  })
  const [items, setItems] = useState<TemplateItem[]>([])
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null)

  useEffect(() => {
    if (template) {
      setFormData(template)
      setItems(template.structure.items)
    } else {
      setFormData({
        name: "",
        description: "",
        max_level: 3,
        structure: { items: [] },
        defaults: { status: "Non lancé", work_days_only: true }
      })
      setItems([])
    }
  }, [template, isOpen])

  const addItem = () => {
    const newItem: TemplateItem = {
      id: Date.now().toString(),
      title: "",
      level: 0,
      duration_days: 1,
      offset_days: 0,
    }
    setItems([...items, newItem])
    setEditingItem(newItem)
  }

  const updateItem = (updatedItem: TemplateItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ))
    setEditingItem(null)
  }

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === itemId)
    if (index === -1) return

    const newItems = [...items]
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    }
    setItems(newItems)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Le nom du template est obligatoire")
      return
    }

    if (items.length === 0) {
      toast.error("Le template doit contenir au moins un élément")
      return
    }

    const templateData: TaskTemplate = {
      ...formData,
      structure: { items }
    }

    onSave(templateData)
    onClose()
  }

  const renderItemEditor = (item: TemplateItem) => (
    <Card key={item.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Élément {items.indexOf(item) + 1}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveItem(item.id, 'up')}
              disabled={items.indexOf(item) === 0}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveItem(item.id, 'down')}
              disabled={items.indexOf(item) === items.length - 1}
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteItem(item.id)}
              className="text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`title-${item.id}`}>Titre</Label>
            <Input
              id={`title-${item.id}`}
              value={item.title}
              onChange={(e) => updateItem({ ...item, title: e.target.value })}
              placeholder="Nom de l'élément"
            />
          </div>
          <div>
            <Label htmlFor={`level-${item.id}`}>Niveau</Label>
            <select
              id={`level-${item.id}`}
              value={item.level}
              onChange={(e) => updateItem({ ...item, level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="0">0 - Projet</option>
              <option value="1">1 - Phase</option>
              <option value="2">2 - Tâche</option>
              <option value="3">3 - Sous-tâche</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`duration-${item.id}`}>Durée (jours)</Label>
            <Input
              id={`duration-${item.id}`}
              type="number"
              min="0"
              step="0.5"
              value={item.duration_days}
              onChange={(e) => updateItem({ ...item, duration_days: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor={`offset-${item.id}`}>Décalage (jours)</Label>
            <Input
              id={`offset-${item.id}`}
              type="number"
              min="0"
              step="0.5"
              value={item.offset_days}
              onChange={(e) => updateItem({ ...item, offset_days: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor={`link-${item.id}`}>Lien avec précédent</Label>
            <select
              id={`link-${item.id}`}
              value={item.link_from_prev || ""}
              onChange={(e) => updateItem({ ...item, link_from_prev: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Aucun</option>
              <option value="FS">FS - Fin-Début</option>
              <option value="SS">SS - Début-Début</option>
              <option value="FF">FF - Fin-Fin</option>
              <option value="SF">SF - Début-Fin</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Modifier le template" : "Nouveau template de tâches"}
          </DialogTitle>
          <DialogDescription>
            Créez un template personnalisé pour générer automatiquement des tâches hiérarchiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Projet Standard, Maintenance..."
              />
            </div>
            <div>
              <Label htmlFor="max_level">Niveau maximum</Label>
              <select
                id="max_level"
                value={formData.max_level}
                onChange={(e) => setFormData({ ...formData, max_level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1">1 niveau</option>
                <option value="2">2 niveaux</option>
                <option value="3">3 niveaux</option>
                <option value="4">4 niveaux</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du template..."
              rows={3}
            />
          </div>

          {/* Paramètres par défaut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_status">Statut par défaut</Label>
              <select
                id="default_status"
                value={formData.defaults.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  defaults: { ...formData.defaults, status: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Non lancé">Non lancé</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Bloqué">Bloqué</option>
                <option value="Reporté">Reporté</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="work_days_only"
                checked={formData.defaults.work_days_only}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  defaults: { ...formData.defaults, work_days_only: e.target.checked }
                })}
                className="rounded"
              />
              <Label htmlFor="work_days_only">Jours ouvrés uniquement</Label>
            </div>
          </div>

          {/* Éléments du template */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Éléments du template</h3>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>

            {items.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucun élément dans ce template</p>
                  <Button onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le premier élément
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {item.level === 0 ? "Projet" :
                         item.level === 1 ? "Phase" :
                         item.level === 2 ? "Tâche" : "Sous-tâche"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {item.duration_days}j + {item.offset_days}j décalage
                      </span>
                      {item.link_from_prev && (
                        <Badge variant="secondary">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {item.link_from_prev}
                        </Badge>
                      )}
                    </div>
                    {renderItemEditor(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {template ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
