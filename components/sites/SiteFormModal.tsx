"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { SuccessToast } from "@/components/ui/success-toast"
import { ErrorToast } from "@/components/ui/error-toast"

interface SiteFormModalProps {
  children: React.ReactNode
  siteId?: string
  onClose?: () => void
}

interface Ressource {
  id: string
  nom: string
  prenom: string
}

export function SiteFormModal({ children, siteId, onClose }: SiteFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [siteData, setSiteData] = useState<any>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [selectedResponsable, setSelectedResponsable] = useState<string>("")
  const [selectedRemplaçant, setSelectedRemplaçant] = useState<string>("")

  // Charger les ressources
  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      setLoadingData(true)
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('ressources')
          .select('id, nom, prenom')
          .eq('actif', true)
          .order('nom')

        if (error) throw error
        setRessources(data || [])

        // Si en mode édition, charger les données du site
        if (siteId) {
          const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('*')
            .eq('id', siteId)
            .single()

          if (siteError) {
            console.error('Erreur chargement site:', siteError)
          } else {
            setSiteData(site)
            // Mettre à jour les sélections quand les données sont chargées
            setSelectedResponsable(site?.responsable_id || "")
            setSelectedRemplaçant(site?.remplaçant_id || "")
          }
        }
      } catch (error) {
        console.error('Erreur chargement données:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [open, siteId])

  // Ouvrir automatiquement le modal si siteId est fourni
  useEffect(() => {
    if (siteId) {
      setOpen(true)
    }
  }, [siteId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        code_site: formData.get("code_site"),
        nom: formData.get("nom"),
        responsable_id: formData.get("responsable"),
        remplaçant_id: formData.get("remplaçant") || null,
        statut: formData.get("statut") || "Actif",
        commentaires: formData.get("commentaires") || null,
      }

      const url = siteId ? `/api/sites/${siteId}` : "/api/sites"
      const method = siteId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        setToast({ type: 'error', message: "Erreur lors de la création du site : " + (error.error || "Erreur inconnue") })
        return
      }

      const result = await response.json()
      setToast({ type: 'success', message: `Site ${siteId ? 'modifié' : 'créé'} avec succès !` })

      setOpen(false)
      setSiteData(null)
      setSelectedResponsable("")
      setSelectedRemplaçant("")
      if (onClose) {
        onClose()
      }
      window.dispatchEvent(new Event('site-created'))
    } catch (error) {
      console.error("Erreur:", error)
      setToast({ type: 'error', message: "Erreur lors de la création du site" })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Réinitialiser les états quand le modal se ferme
      setSiteData(null)
      setSelectedResponsable("")
      setSelectedRemplaçant("")
      if (onClose) {
        onClose()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {siteId ? "Modifier le site" : "Nouveau site"}
          </DialogTitle>
          <DialogDescription>
            {siteId
              ? "Modifiez les informations du site"
              : "Créez un nouveau site opérationnel"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Code site */}
            <div className="grid gap-2">
              <Label htmlFor="code_site" className="text-slate-700 font-medium">
                Code site <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code_site"
                name="code_site"
                placeholder="Ex: E-03A"
                required
                defaultValue={siteData?.code_site}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500">
                Code unique identifiant le site
              </p>
            </div>

            {/* Nom */}
            <div className="grid gap-2">
              <Label htmlFor="nom" className="text-slate-700 font-medium">
                Nom du site <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                name="nom"
                placeholder="Ex: Site Est - Zone 03A"
                required
                defaultValue={siteData?.nom}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Responsable */}
            <div className="grid gap-2">
              <Label htmlFor="responsable" className="text-slate-700 font-medium">
                Responsable <span className="text-red-500">*</span>
              </Label>
              <Select 
                name="responsable" 
                required 
                disabled={loadingData} 
                value={selectedResponsable}
                onValueChange={setSelectedResponsable}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner un responsable"} />
                </SelectTrigger>
                <SelectContent>
                  {ressources.map((ressource) => (
                    <SelectItem key={ressource.id} value={ressource.id}>
                      {ressource.prenom} {ressource.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remplaçant */}
            <div className="grid gap-2">
              <Label htmlFor="remplaçant" className="text-slate-700 font-medium">
                Remplaçant
              </Label>
              <Select 
                name="remplaçant" 
                disabled={loadingData} 
                value={selectedRemplaçant}
                onValueChange={setSelectedRemplaçant}
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner un remplaçant (optionnel)"} />
                </SelectTrigger>
                <SelectContent>
                  {ressources.map((ressource) => (
                    <SelectItem key={ressource.id} value={ressource.id}>
                      {ressource.prenom} {ressource.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statut */}
            <div className="grid gap-2">
              <Label htmlFor="statut" className="text-slate-700 font-medium">
                Statut <span className="text-red-500">*</span>
              </Label>
              <Select name="statut" required defaultValue={siteData?.statut || "Actif"}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="En pause">En pause</SelectItem>
                  <SelectItem value="Fermé">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commentaires */}
            <div className="grid gap-2">
              <Label htmlFor="commentaires" className="text-slate-700 font-medium">
                Commentaires
              </Label>
              <Textarea
                id="commentaires"
                name="commentaires"
                placeholder="Notes internes sur le site..."
                defaultValue={siteData?.commentaires}
                rows={3}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setSiteData(null)
                setSelectedResponsable("")
                setSelectedRemplaçant("")
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : siteId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Toast notifications */}
      {toast && toast.type === 'success' && (
        <SuccessToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {toast && toast.type === 'error' && (
        <ErrorToast 
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </Dialog>
  )
}

