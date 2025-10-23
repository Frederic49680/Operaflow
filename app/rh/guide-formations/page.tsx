"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import Link from "next/link"

export default function GuideFormationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Guide d'utilisation</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Guide complet pour utiliser le module Formations
          </p>
        </div>

        {/* Table des matières */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table des matières</CardTitle>
            <CardDescription>
              Navigation rapide vers les sections du guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Link href="#organismes" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Building2 className="h-4 w-4" />
                  <span>1. Organismes de formation</span>
                </Link>
                <Link href="#catalogue" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <BookOpen className="h-4 w-4" />
                  <span>2. Catalogue des formations</span>
                </Link>
                <Link href="#plan" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Calendar className="h-4 w-4" />
                  <span>3. Plan prévisionnel</span>
                </Link>
              </div>
              <div className="space-y-2">
                <Link href="#tarifs" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <DollarSign className="h-4 w-4" />
                  <span>4. Tarifs formations</span>
                </Link>
                <Link href="#sessions" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Users className="h-4 w-4" />
                  <span>5. Sessions de formation</span>
                </Link>
                <Link href="#workflow" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <ArrowRight className="h-4 w-4" />
                  <span>6. Workflow complet</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Organismes */}
        <Card id="organismes" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>1. Organismes de formation</CardTitle>
                <CardDescription>Gérer les organismes partenaires</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Objectif</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Centraliser les informations des organismes de formation partenaires pour faciliter la planification et la gestion des formations.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités principales :</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Ajout et modification des organismes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Gestion des contacts et spécialités</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Recherche et filtrage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Statut actif/inactif</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Conseil</h4>
                  <p className="text-yellow-800 text-sm mt-1">
                    Assurez-vous de renseigner tous les champs obligatoires (nom, SIRET, contact) pour une gestion efficace.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Catalogue */}
        <Card id="catalogue" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>2. Catalogue des formations</CardTitle>
                <CardDescription>Référentiel des formations disponibles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Objectif</h4>
                  <p className="text-green-800 text-sm mt-1">
                    Créer un référentiel centralisé de toutes les formations disponibles avec leurs caractéristiques et prérequis.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Informations à renseigner :</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Intitulé et description de la formation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Catégorie (Sécurité, Technique, Management, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Durée et modalités</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Prérequis et compétences visées</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Plan prévisionnel */}
        <Card id="plan" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>3. Plan prévisionnel</CardTitle>
                <CardDescription>Planifier les formations par ressource</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Objectif</h4>
                  <p className="text-purple-800 text-sm mt-1">
                    Planifier les formations pour chaque collaborateur en fonction de ses besoins et de la stratégie de l'entreprise.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Étapes de planification :</h4>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Sélectionner le collaborateur</li>
                <li>Choisir la formation dans le catalogue</li>
                <li>Définir la période souhaitée</li>
                <li>Valider le plan prévisionnel</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Tarifs */}
        <Card id="tarifs" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>4. Tarifs formations</CardTitle>
                <CardDescription>Gérer les tarifs unitaires et de groupe</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Objectif</h4>
                  <p className="text-orange-800 text-sm mt-1">
                    Définir les tarifs pour chaque formation selon les modalités et organismes, permettant un suivi budgétaire précis.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Types de tarifs :</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span><strong>Tarif unitaire :</strong> Coût par participant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span><strong>Tarif groupe :</strong> Coût forfaitaire pour une session</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span><strong>Période de validité :</strong> Dates d'application des tarifs</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Sessions */}
        <Card id="sessions" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>5. Sessions de formation</CardTitle>
                <CardDescription>Créer et gérer les sessions collectives</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-pink-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-pink-900">Objectif</h4>
                  <p className="text-pink-800 text-sm mt-1">
                    Organiser les sessions de formation en regroupant les participants et en gérant les aspects logistiques.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Gestion des sessions :</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Planification des dates et lieux</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Inscription des participants</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Suivi de l'avancement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Gestion des présences</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Workflow */}
        <Card id="workflow" className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>6. Workflow complet</CardTitle>
                <CardDescription>Processus de A à Z</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Processus recommandé</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Suivez ces étapes pour une gestion optimale des formations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-600 text-white">1</Badge>
                <div>
                  <h4 className="font-medium">Enregistrer les organismes</h4>
                  <p className="text-sm text-gray-600">Ajoutez vos organismes partenaires avec leurs informations complètes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-green-600 text-white">2</Badge>
                <div>
                  <h4 className="font-medium">Créer le catalogue</h4>
                  <p className="text-sm text-gray-600">Définissez toutes les formations disponibles avec leurs caractéristiques.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-600 text-white">3</Badge>
                <div>
                  <h4 className="font-medium">Planifier les formations</h4>
                  <p className="text-sm text-gray-600">Associez les formations aux collaborateurs selon leurs besoins.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-orange-600 text-white">4</Badge>
                <div>
                  <h4 className="font-medium">Définir les tarifs</h4>
                  <p className="text-sm text-gray-600">Configurez les tarifs pour chaque formation et organisme.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-pink-600 text-white">5</Badge>
                <div>
                  <h4 className="font-medium">Organiser les sessions</h4>
                  <p className="text-sm text-gray-600">Créez et gérez les sessions de formation collectives.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/rh/formations">
              Retour aux formations
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/rh">
              Module RH
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
