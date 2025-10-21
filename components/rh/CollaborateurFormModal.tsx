"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CollaborateurFormModalProps {
  children?: React.ReactNode
  collaborateurId?: string
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

interface Site {
  id: string
  code_site: string
  nom: string
}

const COMPETENCES_DISPONIBLES = [
  "Électricité",
  "Automatisme",
  "CVC",
  "IEG",
  "Plomberie",
  "Chauffage",
  "Climatisation",
  "Maintenance",
  "Planification",
  "Conduite de travaux",
  "Sécurité",
  "Qualité",
  "HSE",
]

export function CollaborateurFormModal({ children, collaborateurId, onClose, open: openProp, onOpenChange, onSuccess, onError }: CollaborateurFormModalProps) {
  const [openInternal, setOpenInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Utiliser la prop open si fournie, sinon l'état interne
  const open = openProp !== undefined ? openProp : openInternal
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setOpenInternal(value)
    }
  }
  const [sites, setSites] = useState<Site[]>([])
  const [loadingSites, setLoadingSites] = useState(false)
  const [competencesSelectionnees, setCompetencesSelectionnees] = useState<string[]>([])
  const [nouvelleCompetence, setNouvelleCompetence] = useState("")
  
  // États pour tous les champs du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    site: "",
    type_contrat: "",
    email_pro: "",
    email_perso: "",
    telephone: "",
    adresse: "",
    date_entree: "",
    date_sortie: "",
    actif: "true"
  })

  const loadSites = useCallback(async () => {
    setLoadingSites(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('sites')
      .select('id, code_site, nom')
      .in('statut', ['Actif', 'En pause'])
      .order('nom')
    setSites(data || [])
    setLoadingSites(false)
  }, [])

  const loadCollaborateurData = useCallback(async () => {
    if (!collaborateurId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ressources')
        .select('*')
        .eq('id', collaborateurId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          nom: data.nom || "",
          prenom: data.prenom || "",
          site: data.site_id || "",
          type_contrat: data.type_contrat || "",
          email_pro: data.email_pro || "",
          email_perso: data.email_perso || "",
          telephone: data.telephone || "",
          adresse: data.adresse_postale || "",
          date_entree: data.date_entree || "",
          date_sortie: data.date_sortie || "",
          actif: data.actif ? "true" : "false"
        })
        setCompetencesSelectionnees(data.competences || [])
      }
    } catch (error) {
      console.error('Erreur chargement collaborateur:', error)
      if (onError) onError('Erreur lors du chargement du collaborateur')
    }
  }, [collaborateurId, onError])

  useEffect(() => {
    if (open) {
      loadSites()
      if (collaborateurId) {
        loadCollaborateurData()
      }
    }
  }, [open, collaborateurId, loadCollaborateurData, loadSites])

  const toggleCompetence = (competence: string) => {
    setCompetencesSelectionnees(prev => 
      prev.includes(competence)
        ? prev.filter(c => c !== competence)
        : [...prev, competence]
    )
  }

  const ajouterNouvelleCompetence = () => {
    if (nouvelleCompetence.trim() && !competencesSelectionnees.includes(nouvelleCompetence.trim())) {
      setCompetencesSelectionnees(prev => [...prev, nouvelleCompetence.trim()])
      setNouvelleCompetence("")
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Vérification: au moins un email doit être rempli
      const emailPro = formData.email_pro.trim() || null
      const emailPerso = formData.email_perso.trim() || null
      
      if (!emailPro && !emailPerso) {
        if (onError) onError('Au moins un email (professionnel ou personnel) est obligatoire')
        setLoading(false)
        return
      }

      // Vérification: le site est obligatoire
      if (!formData.site) {
        if (onError) onError('Le site est obligatoire')
        setLoading(false)
        return
      }

      const data = {
        nom: formData.nom,
        prenom: formData.prenom,
        site_id: formData.site || null,
        type_contrat: formData.type_contrat,
        email_pro: emailPro,
        email_perso: emailPerso,
        telephone: formData.telephone || null,
        adresse_postale: formData.adresse || null,
        competences: competencesSelectionnees,
        date_entree: formData.date_entree || null,
        date_sortie: formData.date_sortie || null,
        actif: formData.actif === "true",
      }

      console.log('Données à envoyer:', data)
      console.log('Site ID:', formData.site)

      let error
      if (collaborateurId) {
        // Mode édition : UPDATE
        const { error: updateError } = await supabase
          .from('ressources')
          .update(data)
          .eq('id', collaborateurId)
        error = updateError
      } else {
        // Mode création : INSERT
        const { error: insertError } = await supabase
          .from('ressources')
          .insert([data])
        error = insertError
      }

      if (error) throw error

      // Afficher le message de succès via le callback
      if (onSuccess) {
        onSuccess(`Collaborateur ${collaborateurId ? 'modifié' : 'créé'} avec succès !`)
      }
      
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        site: "",
        type_contrat: "",
        email_pro: "",
        email_perso: "",
        telephone: "",
        adresse: "",
        date_entree: "",
        date_sortie: "",
        actif: "true"
      })
      setCompetencesSelectionnees([])
      
      // Fermer le modal et notifier
      setOpen(false)
      window.dispatchEvent(new Event('collaborateur-created'))
      if (onClose) onClose()
    } catch (error) {
      console.error('Erreur création collaborateur:', error)
      if (onError) onError('Erreur lors de la création du collaborateur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {collaborateurId ? "Modifier le collaborateur" : "Nouveau collaborateur"}
          </DialogTitle>
          <DialogDescription>
            {collaborateurId
              ? "Modifiez les informations du collaborateur"
              : "Ajoutez un nouveau collaborateur à votre équipe"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="informations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informations">Informations</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="rh">RH</TabsTrigger>
            </TabsList>

            {/* Onglet Informations */}
            <TabsContent value="informations" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom" className="text-slate-700 font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    placeholder="Dupont"
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prenom" className="text-slate-700 font-medium">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleChange("prenom", e.target.value)}
                    placeholder="Jean"
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="site" className="text-slate-700 font-medium">
                    Site <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.site} onValueChange={(value) => handleChange("site", value)} required disabled={loadingSites}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingSites ? "Chargement..." : "Sélectionner un site"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.code_site} - {site.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type_contrat" className="text-slate-700 font-medium">
                    Type de contrat <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.type_contrat} onValueChange={(value) => handleChange("type_contrat", value)} required>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Intérim">Intérim</SelectItem>
                      <SelectItem value="Apprenti">Apprenti</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700 font-medium">
                  Compétences
                </Label>
                
                {/* Compétences sélectionnées */}
                {competencesSelectionnees.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                    {competencesSelectionnees.map((comp) => (
                      <Badge
                        key={comp}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer flex items-center gap-1"
                        onClick={() => toggleCompetence(comp)}
                      >
                        {comp}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Liste des compétences disponibles */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                  {COMPETENCES_DISPONIBLES.map((comp) => (
                    <Badge
                      key={comp}
                      variant={competencesSelectionnees.includes(comp) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        competencesSelectionnees.includes(comp)
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-blue-100"
                      }`}
                      onClick={() => toggleCompetence(comp)}
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>

                {/* Ajouter une nouvelle compétence */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter une compétence..."
                    value={nouvelleCompetence}
                    onChange={(e) => setNouvelleCompetence(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        ajouterNouvelleCompetence()
                      }
                    }}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={ajouterNouvelleCompetence}
                    disabled={!nouvelleCompetence.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Cliquez sur une compétence pour la sélectionner/désélectionner
                </p>
              </div>
            </TabsContent>

            {/* Onglet Contact */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Information:</span> Au moins un email (professionnel ou personnel) est obligatoire
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email_pro" className="text-slate-700 font-medium">
                  Email professionnel
                </Label>
                <Input
                  id="email_pro"
                  name="email_pro"
                  type="email"
                  value={formData.email_pro}
                  onChange={(e) => handleChange("email_pro", e.target.value)}
                  placeholder="jean.dupont@example.com"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email_perso" className="text-slate-700 font-medium">
                  Email personnel
                </Label>
                <Input
                  id="email_perso"
                  name="email_perso"
                  type="email"
                  value={formData.email_perso}
                  onChange={(e) => handleChange("email_perso", e.target.value)}
                  placeholder="jean.dupont.perso@gmail.com"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telephone" className="text-slate-700 font-medium">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adresse" className="text-slate-700 font-medium">
                  Adresse
                </Label>
                <Textarea
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  placeholder="123 rue de la République, 75001 Paris"
                  rows={2}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </TabsContent>

            {/* Onglet RH */}
            <TabsContent value="rh" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date_entree" className="text-slate-700 font-medium">
                    Date d'entrée
                  </Label>
                  <Input
                    id="date_entree"
                    name="date_entree"
                    type="date"
                    value={formData.date_entree}
                    onChange={(e) => handleChange("date_entree", e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_sortie" className="text-slate-700 font-medium">
                    Date de sortie
                  </Label>
                  <Input
                    id="date_sortie"
                    name="date_sortie"
                    type="date"
                    value={formData.date_sortie}
                    onChange={(e) => handleChange("date_sortie", e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actif" className="text-slate-700 font-medium">
                  Statut
                </Label>
                <Select value={formData.actif} onValueChange={(value) => handleChange("actif", value)}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : collaborateurId ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

