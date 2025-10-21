"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Search,
  FileText,
  Calendar,
  Users,
  Target
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import TaskTemplateModal from "./TaskTemplateModal"

interface TemplateItem {
  id: string
  title: string
  level: number
  duration_days: number
  offset_days: number
  link_from_prev?: string
}

interface TaskTemplate {
  id: string
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
  created_at: string
  created_by: string
}

export default function TaskTemplateManager() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null | undefined>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredTemplates(
        templates.filter(template =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredTemplates(templates)
    }
  }, [templates, searchTerm])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // S'assurer que chaque item a un id
      const templatesWithIds = (data || []).map(template => ({
        ...template,
        structure: {
          ...template.structure,
          items: template.structure.items.map((item: any, index: number) => ({
            ...item,
            id: item.id || `item-${template.id}-${index}`
          }))
        }
      }))

      setTemplates(templatesWithIds)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
      toast.error("Erreur lors du chargement des templates")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setIsModalOpen(true)
  }

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      toast.success("Template supprimé")
      loadTemplates()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleDuplicateTemplate = async (template: TaskTemplate) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('task_templates')
        .insert({
          name: `${template.name} (Copie)`,
          description: template.description,
          max_level: template.max_level,
          structure: template.structure,
          defaults: template.defaults
        })

      if (error) throw error

      toast.success("Template dupliqué")
      loadTemplates()
    } catch (error) {
      console.error('Erreur lors de la duplication:', error)
      toast.error("Erreur lors de la duplication")
    }
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const supabase = createClient()
      
      if (editingTemplate) {
        // Mise à jour
        const { error } = await supabase
          .from('task_templates')
          .update(templateData)
          .eq('id', editingTemplate.id)

        if (error) throw error
        toast.success("Template modifié")
      } else {
        // Création
        const { error } = await supabase
          .from('task_templates')
          .insert(templateData)

        if (error) throw error
        toast.success("Template créé")
      }

      loadTemplates()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 0: return "Projet"
      case 1: return "Phase"
      case 2: return "Tâche"
      case 3: return "Sous-tâche"
      default: return "Autre"
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-blue-100 text-blue-800"
      case 1: return "bg-green-100 text-green-800"
      case 2: return "bg-orange-100 text-orange-800"
      case 3: return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestion des Templates
            </CardTitle>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Informations du template */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Max {template.max_level} niveau{template.max_level > 1 ? 'x' : ''}
                  </Badge>
                  <Badge variant="secondary">
                    {template.structure.items.length} élément{template.structure.items.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Aperçu des éléments */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Structure :</h4>
                  <div className="space-y-1">
                    {template.structure.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLevelColor(item.level)}`}
                        >
                          {getLevelName(item.level)}
                        </Badge>
                        <span className="text-gray-600">{item.title}</span>
                        <span className="text-xs text-gray-500">
                          ({item.duration_days}j)
                        </span>
                      </div>
                    ))}
                    {template.structure.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{template.structure.items.length - 3} autre{template.structure.items.length - 3 > 1 ? 's' : ''}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Paramètres par défaut */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-3 w-3" />
                    <span>Statut: {template.defaults.status}</span>
                  </div>
                  {template.defaults.work_days_only && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Jours ouvrés uniquement</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun template */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Aucun template trouvé" : "Aucun template créé"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de création/édition */}
      <TaskTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}
