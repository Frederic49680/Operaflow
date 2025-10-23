"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Users,
  Building,
  Calendar,
  Mail,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Loader2
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ParametresPage() {
  const [settings, setSettings] = useState({
    // Paramètres généraux
    nomEntreprise: "OperaFlow",
    adresse: "123 Rue de l'Innovation, 75001 Paris",
    telephone: "01 23 45 67 89",
    email: "contact@operaflow.fr",
    siteWeb: "https://www.operaflow.fr",
    
    // Paramètres RH
    dureeContratEssai: 3,
    delaiPreavis: 1,
    tauxAbsenteismeMax: 5,
    dureeFormationMax: 40,
    
    // Paramètres notifications
    notificationsEmail: true,
    notificationsPush: true,
    rappelFormation: 7,
    alerteFinContrat: 30,
    
    // Paramètres sécurité
    dureeSession: 8,
    tentativesConnexion: 3,
    motDePasseComplexe: true,
    doubleAuthentification: false,
    
    // Paramètres système
    sauvegardeAuto: true,
    frequenceSauvegarde: "quotidienne",
    retentionDonnees: 5,
    maintenanceMode: false
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<typeof settings | null>(null)
  
  // États pour la gestion du premier utilisateur
  const [showFirstUserModal, setShowFirstUserModal] = useState(false)
  const [firstUserData, setFirstUserData] = useState({
    email: "",
    prenom: "",
    nom: ""
  })
  const [creatingFirstUser, setCreatingFirstUser] = useState(false)
  const [collaborateursCount, setCollaborateursCount] = useState(0)
  const [sitesCount, setSitesCount] = useState(0)
  
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category, setting_key')

      if (error) throw error

      // Conversion des données de la DB vers le format du state
      const loadedSettings = {
        // Paramètres généraux
        nomEntreprise: getSettingValue(data, 'general', 'nom_entreprise', 'OperaFlow'),
        adresse: getSettingValue(data, 'general', 'adresse', '123 Rue de l\'Innovation, 75001 Paris'),
        telephone: getSettingValue(data, 'general', 'telephone', '01 23 45 67 89'),
        email: getSettingValue(data, 'general', 'email', 'contact@operaflow.fr'),
        siteWeb: getSettingValue(data, 'general', 'site_web', 'https://www.operaflow.fr'),
        
        // Paramètres RH
        dureeContratEssai: parseInt(getSettingValue(data, 'rh', 'duree_contrat_essai', '3')),
        delaiPreavis: parseInt(getSettingValue(data, 'rh', 'delai_preavis', '1')),
        tauxAbsenteismeMax: parseInt(getSettingValue(data, 'rh', 'taux_absenteisme_max', '5')),
        dureeFormationMax: parseInt(getSettingValue(data, 'rh', 'duree_formation_max', '40')),
        
        // Paramètres notifications
        notificationsEmail: getSettingValue(data, 'notifications', 'notifications_email', 'true') === 'true',
        notificationsPush: getSettingValue(data, 'notifications', 'notifications_push', 'true') === 'true',
        rappelFormation: parseInt(getSettingValue(data, 'notifications', 'rappel_formation', '7')),
        alerteFinContrat: parseInt(getSettingValue(data, 'notifications', 'alerte_fin_contrat', '30')),
        
        // Paramètres sécurité
        dureeSession: parseInt(getSettingValue(data, 'security', 'duree_session', '8')),
        tentativesConnexion: parseInt(getSettingValue(data, 'security', 'tentatives_connexion', '3')),
        motDePasseComplexe: getSettingValue(data, 'security', 'mot_de_passe_complexe', 'true') === 'true',
        doubleAuthentification: getSettingValue(data, 'security', 'double_authentification', 'false') === 'true',
        
        // Paramètres système
        sauvegardeAuto: getSettingValue(data, 'system', 'sauvegarde_auto', 'true') === 'true',
        frequenceSauvegarde: getSettingValue(data, 'system', 'frequence_sauvegarde', 'quotidienne'),
        retentionDonnees: parseInt(getSettingValue(data, 'system', 'retention_donnees', '5')),
        maintenanceMode: getSettingValue(data, 'system', 'maintenance_mode', 'false') === 'true'
      }

      setSettings(loadedSettings)
      setOriginalSettings(loadedSettings)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fonction pour vérifier le nombre de collaborateurs
  const checkCollaborateursCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('ressources')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      setCollaborateursCount(count || 0)
    } catch (error) {
      console.error('Erreur lors de la vérification des collaborateurs:', error)
    }
  }, [supabase])

  // Fonction pour vérifier le nombre de sites
  const checkSitesCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      setSitesCount(count || 0)
    } catch (error) {
      console.error('Erreur lors de la vérification des sites:', error)
    }
  }, [supabase])

  // Chargement des paramètres au montage du composant
  useEffect(() => {
    loadSettings()
    checkCollaborateursCount()
    checkSitesCount()
  }, [loadSettings, checkCollaborateursCount, checkSitesCount])

  const getSettingValue = (data: any[], category: string, key: string, defaultValue: string) => {
    const setting = data?.find(s => s.category === category && s.setting_key === key)
    return setting?.setting_value || defaultValue
  }

  // Fonction pour créer le premier utilisateur
  const createFirstUser = async () => {
    if (!firstUserData.email || !firstUserData.prenom || !firstUserData.nom) {
      toast.error('Tous les champs sont obligatoires')
      return
    }

    setCreatingFirstUser(true)
    try {
      // Créer le collaborateur dans la table ressources
      const { data: collaborateur, error: collaborateurError } = await supabase
        .from('ressources')
        .insert({
          nom: firstUserData.nom,
          prenom: firstUserData.prenom,
          email_pro: firstUserData.email,
          type_contrat: 'CDI',
          actif: true,
          date_entree: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (collaborateurError) throw collaborateurError

      // Note: L'utilisateur devra se connecter via l'interface normale
      // L'API admin n'est pas accessible depuis le client

      toast.success('Premier collaborateur créé ! Vous pouvez maintenant vous connecter avec cet email.')
      setShowFirstUserModal(false)
      setFirstUserData({ email: "", prenom: "", nom: "" })
      checkCollaborateursCount()
      checkSitesCount()
    } catch (error) {
      console.error('Erreur lors de la création du premier utilisateur:', error)
      toast.error('Erreur lors de la création du premier utilisateur')
    } finally {
      setCreatingFirstUser(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validation des champs
      if (!settings.nomEntreprise.trim()) {
        toast.error('Le nom de l\'entreprise est obligatoire')
        return
      }
      
      if (!settings.email.trim() || !settings.email.includes('@')) {
        toast.error('L\'email doit être valide')
        return
      }

      // Préparation des données à sauvegarder
      const settingsToSave = [
        // Paramètres généraux
        { category: 'general', key: 'nom_entreprise', value: settings.nomEntreprise },
        { category: 'general', key: 'adresse', value: settings.adresse },
        { category: 'general', key: 'telephone', value: settings.telephone },
        { category: 'general', key: 'email', value: settings.email },
        { category: 'general', key: 'site_web', value: settings.siteWeb },
        
        // Paramètres RH
        { category: 'rh', key: 'duree_contrat_essai', value: settings.dureeContratEssai.toString() },
        { category: 'rh', key: 'delai_preavis', value: settings.delaiPreavis.toString() },
        { category: 'rh', key: 'taux_absenteisme_max', value: settings.tauxAbsenteismeMax.toString() },
        { category: 'rh', key: 'duree_formation_max', value: settings.dureeFormationMax.toString() },
        
        // Paramètres notifications
        { category: 'notifications', key: 'notifications_email', value: settings.notificationsEmail.toString() },
        { category: 'notifications', key: 'notifications_push', value: settings.notificationsPush.toString() },
        { category: 'notifications', key: 'rappel_formation', value: settings.rappelFormation.toString() },
        { category: 'notifications', key: 'alerte_fin_contrat', value: settings.alerteFinContrat.toString() },
        
        // Paramètres sécurité
        { category: 'security', key: 'duree_session', value: settings.dureeSession.toString() },
        { category: 'security', key: 'tentatives_connexion', value: settings.tentativesConnexion.toString() },
        { category: 'security', key: 'mot_de_passe_complexe', value: settings.motDePasseComplexe.toString() },
        { category: 'security', key: 'double_authentification', value: settings.doubleAuthentification.toString() },
        
        // Paramètres système
        { category: 'system', key: 'sauvegarde_auto', value: settings.sauvegardeAuto.toString() },
        { category: 'system', key: 'frequence_sauvegarde', value: settings.frequenceSauvegarde },
        { category: 'system', key: 'retention_donnees', value: settings.retentionDonnees.toString() },
        { category: 'system', key: 'maintenance_mode', value: settings.maintenanceMode.toString() }
      ]

      // Sauvegarde via la fonction RPC
      for (const setting of settingsToSave) {
        const { error } = await supabase.rpc('set_setting', {
          category_name: setting.category,
          key_name: setting.key,
          value: setting.value
        })
        
        if (error) throw error
      }

      setOriginalSettings({ ...settings })
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings as typeof settings)
      toast.info('Paramètres réinitialisés')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-2">
                Configuration du système et des préférences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={loading || saving}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button onClick={handleSave} disabled={loading || saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section Premier utilisateur */}
          {(collaborateursCount === 0 || sitesCount === 0) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-orange-800">Configuration initiale</CardTitle>
                    <CardDescription className="text-orange-600">
                      {collaborateursCount === 0 
                        ? "Aucun collaborateur trouvé. Créez le premier utilisateur administrateur."
                        : "Aucun site trouvé. Créez le premier site pour continuer."
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 mb-2">
                      {collaborateursCount === 0 
                        ? "Pour commencer à utiliser l'application, vous devez créer le premier utilisateur administrateur."
                        : "Pour continuer la configuration, vous devez créer le premier site."
                      }
                    </p>
                    <p className="text-xs text-orange-600">
                      {collaborateursCount === 0 
                        ? "Cet utilisateur aura tous les droits d'administration."
                        : "Le site permettra d'organiser vos collaborateurs et projets."
                      }
                    </p>
                  </div>
                  {collaborateursCount === 0 ? (
                    <Button 
                      onClick={() => setShowFirstUserModal(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Créer le premier utilisateur
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => window.location.href = '/sites'}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Créer le premier site
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Données de l'entreprise</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomEntreprise">Nom de l'entreprise</Label>
                  <Input 
                    id="nomEntreprise" 
                    value={settings.nomEntreprise}
                    onChange={(e) => setSettings({...settings, nomEntreprise: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input 
                    id="telephone" 
                    value={settings.telephone}
                    onChange={(e) => setSettings({...settings, telephone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteWeb">Site web</Label>
                  <Input 
                    id="siteWeb" 
                    value={settings.siteWeb}
                    onChange={(e) => setSettings({...settings, siteWeb: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea 
                    id="adresse" 
                    value={settings.adresse}
                    onChange={(e) => setSettings({...settings, adresse: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres RH */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Paramètres RH</CardTitle>
                  <CardDescription>Configuration des ressources humaines</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dureeContratEssai">Durée contrat d'essai (mois)</Label>
                  <Input 
                    id="dureeContratEssai" 
                    type="number"
                    value={settings.dureeContratEssai}
                    onChange={(e) => setSettings({...settings, dureeContratEssai: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delaiPreavis">Délai de préavis (mois)</Label>
                  <Input 
                    id="delaiPreavis" 
                    type="number"
                    value={settings.delaiPreavis}
                    onChange={(e) => setSettings({...settings, delaiPreavis: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tauxAbsenteismeMax">Taux d'absentéisme max (%)</Label>
                  <Input 
                    id="tauxAbsenteismeMax" 
                    type="number"
                    value={settings.tauxAbsenteismeMax}
                    onChange={(e) => setSettings({...settings, tauxAbsenteismeMax: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dureeFormationMax">Durée formation max (h/an)</Label>
                  <Input 
                    id="dureeFormationMax" 
                    type="number"
                    value={settings.dureeFormationMax}
                    onChange={(e) => setSettings({...settings, dureeFormationMax: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configuration des alertes et rappels</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsEmail">Notifications par email</Label>
                    <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
                  </div>
                  <Checkbox 
                    id="notificationsEmail"
                    checked={settings.notificationsEmail}
                    onCheckedChange={(checked) => setSettings({...settings, notificationsEmail: !!checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsPush">Notifications push</Label>
                    <p className="text-sm text-gray-500">Alertes en temps réel</p>
                  </div>
                  <Checkbox 
                    id="notificationsPush"
                    checked={settings.notificationsPush}
                    onCheckedChange={(checked) => setSettings({...settings, notificationsPush: !!checked})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rappelFormation">Rappel formation (jours avant)</Label>
                    <Input 
                      id="rappelFormation" 
                      type="number"
                      value={settings.rappelFormation}
                      onChange={(e) => setSettings({...settings, rappelFormation: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alerteFinContrat">Alerte fin contrat (jours avant)</Label>
                    <Input 
                      id="alerteFinContrat" 
                      type="number"
                      value={settings.alerteFinContrat}
                      onChange={(e) => setSettings({...settings, alerteFinContrat: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>Paramètres de sécurité et authentification</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="motDePasseComplexe">Mot de passe complexe</Label>
                    <p className="text-sm text-gray-500">Exiger des mots de passe complexes</p>
                  </div>
                  <Checkbox 
                    id="motDePasseComplexe"
                    checked={settings.motDePasseComplexe}
                    onCheckedChange={(checked) => setSettings({...settings, motDePasseComplexe: !!checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="doubleAuthentification">Double authentification</Label>
                    <p className="text-sm text-gray-500">Activer la 2FA</p>
                  </div>
                  <Checkbox 
                    id="doubleAuthentification"
                    checked={settings.doubleAuthentification}
                    onCheckedChange={(checked) => setSettings({...settings, doubleAuthentification: !!checked})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dureeSession">Durée session (heures)</Label>
                    <Input 
                      id="dureeSession" 
                      type="number"
                      value={settings.dureeSession}
                      onChange={(e) => setSettings({...settings, dureeSession: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tentativesConnexion">Tentatives max</Label>
                    <Input 
                      id="tentativesConnexion" 
                      type="number"
                      value={settings.tentativesConnexion}
                      onChange={(e) => setSettings({...settings, tentativesConnexion: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Système */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Système</CardTitle>
                  <CardDescription>Configuration technique</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sauvegardeAuto">Sauvegarde automatique</Label>
                    <p className="text-sm text-gray-500">Sauvegardes automatiques des données</p>
                  </div>
                  <Checkbox 
                    id="sauvegardeAuto"
                    checked={settings.sauvegardeAuto}
                    onCheckedChange={(checked) => setSettings({...settings, sauvegardeAuto: !!checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                    <p className="text-sm text-gray-500">Désactiver l'accès utilisateur</p>
                  </div>
                  <Checkbox 
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: !!checked})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequenceSauvegarde">Fréquence sauvegarde</Label>
                    <Select 
                      value={settings.frequenceSauvegarde}
                      onValueChange={(value) => setSettings({...settings, frequenceSauvegarde: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quotidienne">Quotidienne</SelectItem>
                        <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                        <SelectItem value="mensuelle">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionDonnees">Rétention données (années)</Label>
                    <Input 
                      id="retentionDonnees" 
                      type="number"
                      value={settings.retentionDonnees}
                      onChange={(e) => setSettings({...settings, retentionDonnees: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal pour créer le premier utilisateur */}
      <Dialog open={showFirstUserModal} onOpenChange={setShowFirstUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer le premier collaborateur</DialogTitle>
            <DialogDescription>
              Créez le premier collaborateur dans la base de données. Vous pourrez ensuite vous connecter avec cet email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={firstUserData.prenom}
                  onChange={(e) => setFirstUserData({...firstUserData, prenom: e.target.value})}
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={firstUserData.nom}
                  onChange={(e) => setFirstUserData({...firstUserData, nom: e.target.value})}
                  placeholder="Dupont"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="firstUserEmail">Email *</Label>
              <Input
                id="firstUserEmail"
                type="email"
                value={firstUserData.email}
                onChange={(e) => setFirstUserData({...firstUserData, email: e.target.value})}
                placeholder="jean.dupont@entreprise.com"
              />
            </div>
            
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFirstUserModal(false)}
              disabled={creatingFirstUser}
            >
              Annuler
            </Button>
            <Button 
              onClick={createFirstUser}
              disabled={creatingFirstUser}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {creatingFirstUser ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Créer l'utilisateur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
