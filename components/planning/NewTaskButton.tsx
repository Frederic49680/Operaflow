"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { toast } from "sonner"

interface NewTaskButtonProps {
  onTaskCreated?: (task: any) => void
}

export default function NewTaskButton({ onTaskCreated }: NewTaskButtonProps) {
  const { createTask } = useTasks()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTask = async () => {
    const taskName = prompt("Nom de la nouvelle tâche :")
    if (!taskName) return

    try {
      setIsCreating(true)
      const newTask = await createTask({
        libelle_tache: taskName,
        statut: 'Non lancé',
        avancement_pct: 0,
        level: 0,
        order_index: 0
      })
      
      onTaskCreated?.(newTask)
      toast.success("Tâche créée avec succès")
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button 
      onClick={handleCreateTask}
      disabled={isCreating}
      className="w-full"
    >
      <Plus className="h-4 w-4 mr-2" />
      {isCreating ? "Création..." : "Nouvelle tâche"}
    </Button>
  )
}
