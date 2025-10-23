"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, CheckCircle } from "lucide-react";

export default function TuilesTaches() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planning</h2>
          <p className="text-muted-foreground">
            Planification et suivi des tâches
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches actives</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              En cours de réalisation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Affectées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Moyenne globale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Interface en développement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Module Planning
            </h3>
            <p className="text-slate-600 mb-6">
              Cette interface sera bientôt disponible pour la planification et la gestion des tâches.
            </p>
            <Button variant="outline">
              En savoir plus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
