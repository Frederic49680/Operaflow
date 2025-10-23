"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  RefreshCw
} from "lucide-react"
import { useState } from "react"

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

  const handleSave = () => {
    // Logique de sauvegarde
    console.log("Sauvegarde des paramètres:", settings)
  }

  const handleReset = () => {
    // Logique de réinitialisation
    console.log("Réinitialisation des paramètres")
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
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                  <Switch 
                    id="notificationsEmail"
                    checked={settings.notificationsEmail}
                    onCheckedChange={(checked) => setSettings({...settings, notificationsEmail: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationsPush">Notifications push</Label>
                    <p className="text-sm text-gray-500">Alertes en temps réel</p>
                  </div>
                  <Switch 
                    id="notificationsPush"
                    checked={settings.notificationsPush}
                    onCheckedChange={(checked) => setSettings({...settings, notificationsPush: checked})}
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
                  <Switch 
                    id="motDePasseComplexe"
                    checked={settings.motDePasseComplexe}
                    onCheckedChange={(checked) => setSettings({...settings, motDePasseComplexe: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="doubleAuthentification">Double authentification</Label>
                    <p className="text-sm text-gray-500">Activer la 2FA</p>
                  </div>
                  <Switch 
                    id="doubleAuthentification"
                    checked={settings.doubleAuthentification}
                    onCheckedChange={(checked) => setSettings({...settings, doubleAuthentification: checked})}
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
                  <Switch 
                    id="sauvegardeAuto"
                    checked={settings.sauvegardeAuto}
                    onCheckedChange={(checked) => setSettings({...settings, sauvegardeAuto: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                    <p className="text-sm text-gray-500">Désactiver l'accès utilisateur</p>
                  </div>
                  <Switch 
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
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
    </div>
  )
}
