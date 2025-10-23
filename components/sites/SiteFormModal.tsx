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
import { Trash2, Loader2 } from "lucide-react"

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteSite = async () => {
    if (!siteId) return

    try {
      setDeleting(true)
      const supabase = createClient()
      
      // Essayer d'abord la fonction RPC de suppression en cascade
      try {
        const { data, error } = await supabase
          .rpc('delete_site_cascade', { site_id_to_delete: siteId })
        
        if (error) throw error
        
        // Vérifier le résultat de la fonction
        if (data && data.success) {
          setToast({ 
            type: 'success', 
            message: data.message || `Site "${siteData?.nom || 'sélectionné'}" supprimé avec succès !` 
          })
          
          // Fermer le modal et recharger
          setOpen(false)
          setSiteData(null)
          setSelectedResponsable("")
          setSelectedRemplaçant("")
          setShowDeleteModal(false)
          
          if (onClose) {
            onClose()
          }
          window.dispatchEvent(new Event('site-created'))
          return
        } else {
          throw new Error(data?.message || 'Erreur lors de la suppression')
        }
      } catch (rpcError) {
        // Si la fonction RPC n'existe pas ou échoue, essayer la suppression directe
        console.warn('Fonction RPC non disponible, tentative de suppression directe:', rpcError)
        
        const { error } = await supabase
          .from('sites')
          .delete()
          .eq('id', siteId)
        
        if (error) {
          if (error.code === '23503') {
            throw new Error('Impossible de supprimer ce site car il contient des données liées. Veuillez d\'abord supprimer toutes les tâches, affaires et ressources associées.')
          }
          throw error
        }
        
        setToast({ 
          type: 'success', 
          message: `Site "${siteData?.nom || 'sélectionné'}" supprimé avec succès !` 
        })
        
        // Fermer le modal et recharger
        setOpen(false)
        setSiteData(null)
        setSelectedResponsable("")
        setSelectedRemplaçant("")
        setShowDeleteModal(false)
        
        if (onClose) {
          onClose()
        }
        window.dispatchEvent(new Event('site-created'))
      }
    } catch (err) {
      console.error('Erreur suppression site:', err)
      setToast({ 
        type: 'error', 
        message: `Erreur lors de la suppression du site: ${err instanceof Error ? err.message : 'Erreur inconnue'}` 
      })
    } finally {
      setDeleting(false)
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
            <div className="flex justify-between w-full">
              <div>
                {siteId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading || deleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
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
              </div>
            </div>
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

      {/* Modal de confirmation de suppression */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirmer la suppression du site
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible et supprimera définitivement le site.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">
                  Site : <span className="font-bold">{siteData?.nom || 'sélectionné'}</span>
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement ce site ?
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Cette action supprimera toutes les données associées à ce site.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleDeleteSite}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

