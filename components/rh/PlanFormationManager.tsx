"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Calendar, 
  Users, 
  Euro, 
  TrendingUp, 
  FileText, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  BarChart3
} from 'lucide-react';

interface PlanFormation {
  id: string;
  annee: number;
  resource_id: string;
  formation_id: string;
  mois_cible: number;
  trimestre_cible: number;
  category: string;
  source: string;
  phase: string;
  statut: string;
  cost_planned: number;
  cout_estime: number;
  baseline_version: number;
  validated_at: string;
  created_at: string;
  // Relations
  ressource?: {
    nom: string;
    prenom: string;
    site: string;
  };
  formation?: {
    intitule: string;
    category: string;
  };
}

interface KPIData {
  annee: number;
  version: number;
  baseline_count: number;
  baseline_cost: number;
  total_count: number;
  planifie_count: number;
  realise_count: number;
  taux_avancement: number;
  taux_couverture: number;
  budget_engage: number;
  budget_consomme: number;
  ecart_budget: number;
}

interface CatalogueFormation {
  formation_id: string;
  intitule: string;
  validite_mois: number;
  duree_jours: number;
  category: string;
  tarif_unitaire: number;
  tarif_groupe: number;
  min_participants: number;
  max_participants: number;
  actif: boolean;
}

export default function PlanFormationManager() {
  const [planFormations, setPlanFormations] = useState<PlanFormation[]>([]);
  const [catalogueFormations, setCatalogueFormations] = useState<CatalogueFormation[]>([]);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear() + 1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCatalogueModal, setShowCatalogueModal] = useState(false);
  const [selectedFormations, setSelectedFormations] = useState<string[]>([]);
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  const supabase = createClient();

  const loadPlanFormations = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('plan_formations')
        .select(`
          *,
          ressource:ressources(nom, prenom, site),
          formation:catalogue_formations(intitule, category)
        `)
        .eq('annee', selectedAnnee)
        .order('mois_cible', { ascending: true });

      if (filterPhase !== 'all') {
        query = query.eq('phase', filterPhase);
      }

      if (filterStatut !== 'all') {
        query = query.eq('statut', filterStatut);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlanFormations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement du plan de formation');
    } finally {
      setLoading(false);
    }
  }, [selectedAnnee, filterPhase, filterStatut, supabase]);

  const loadCatalogueFormations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('catalogue_formations')
        .select('*')
        .eq('actif', true)
        .order('intitule');

      if (error) throw error;
      setCatalogueFormations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement du catalogue:', error);
    }
  }, [supabase]);

  const loadKPIs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_plan_kpis', { target_annee: selectedAnnee });

      if (error) throw error;
      setKpiData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
    }
  }, [selectedAnnee, supabase]);

  useEffect(() => {
    loadPlanFormations();
    loadCatalogueFormations();
    loadKPIs();
  }, [loadPlanFormations, loadCatalogueFormations, loadKPIs]);

  const handleGeneratePrevisionnel = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_plan_previsionnel', { target_annee: selectedAnnee });

      if (error) throw error;
      
      toast.success(`Plan prévisionnel généré: ${data.count_inserted} formations`);
      setShowGenerateModal(false);
      loadPlanFormations();
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération du plan prévisionnel');
    }
  };

  const handleValidateFormations = async (formationIds: string[], action: 'validate' | 'reject') => {
    try {
      const statut = action === 'validate' ? 'VALIDE' : 'REJETE';
      
      const { error } = await supabase
        .from('plan_formations')
        .update({ 
          statut,
          validated_at: action === 'validate' ? new Date().toISOString() : null
        })
        .in('id', formationIds);

      if (error) throw error;
      
      toast.success(`${formationIds.length} formations ${action === 'validate' ? 'validées' : 'rejetées'}`);
      loadPlanFormations();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  const handleCommitPlan = async () => {
    try {
      const { data, error } = await supabase
        .rpc('commit_plan_formation', { target_annee: selectedAnnee });

      if (error) throw error;
      
      toast.success(`Plan de formation validé: ${data.total_count} formations, ${data.total_cost}€`);
      loadPlanFormations();
      loadKPIs();
    } catch (error) {
      console.error('Erreur lors de la validation du plan:', error);
      toast.error('Erreur lors de la validation du plan');
    }
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      'EN_ATTENTE_VALIDATION': 'secondary',
      'VALIDE': 'default',
      'REJETE': 'destructive',
      'PLANIFIE': 'outline',
      'REALISE': 'default',
      'ANNULE': 'destructive'
    } as const;

    const labels = {
      'EN_ATTENTE_VALIDATION': 'En attente',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté',
      'PLANIFIE': 'Planifié',
      'REALISE': 'Réalisé',
      'ANNULE': 'Annulé'
    };

    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {labels[statut as keyof typeof labels] || statut}
      </Badge>
    );
  };

  const getPhaseBadge = (phase: string) => {
    return (
      <Badge variant={phase === 'PLAN' ? 'default' : 'outline'}>
        {phase === 'PREVISIONNEL' ? 'Prévisionnel' : 'Plan'}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'SECURITE': 'bg-red-100 text-red-800',
      'QUALITE': 'bg-blue-100 text-blue-800',
      'AUTO': 'bg-green-100 text-green-800',
      'TECHNIQUE': 'bg-purple-100 text-purple-800',
      'MANAGEMENT': 'bg-orange-100 text-orange-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header avec KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations prévues</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.baseline_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget prévu</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.baseline_cost?.toLocaleString() || 0}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'avancement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.taux_avancement?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de couverture</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.taux_couverture?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions principales */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Générer prévisionnel {selectedAnnee}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer le plan prévisionnel {selectedAnnee}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Cette action va analyser toutes les formations expirant en {selectedAnnee} et créer le plan prévisionnel.</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleGeneratePrevisionnel}>
                  Générer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          onClick={() => handleCommitPlan()}
          disabled={planFormations.filter(p => p.phase === 'PREVISIONNEL' && p.statut === 'VALIDE').length === 0}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Valider le plan
        </Button>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>

        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Statistiques
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="annee">Année:</Label>
          <Select value={selectedAnnee.toString()} onValueChange={(value) => setSelectedAnnee(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="phase">Phase:</Label>
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="PREVISIONNEL">Prévisionnel</SelectItem>
              <SelectItem value="PLAN">Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="statut">Statut:</Label>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="EN_ATTENTE_VALIDATION">En attente</SelectItem>
              <SelectItem value="VALIDE">Validé</SelectItem>
              <SelectItem value="REJETE">Rejeté</SelectItem>
              <SelectItem value="PLANIFIE">Planifié</SelectItem>
              <SelectItem value="REALISE">Réalisé</SelectItem>
              <SelectItem value="ANNULE">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tableau des formations */}
      <Card>
        <CardHeader>
          <CardTitle>Plan de Formation {selectedAnnee}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ressource</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Mois</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planFormations.map((formation) => (
                <TableRow key={formation.id}>
                  <TableCell>
                    {formation.ressource?.prenom} {formation.ressource?.nom}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {formation.ressource?.site}
                    </span>
                  </TableCell>
                  <TableCell>{formation.formation?.intitule}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(formation.category)}>
                      {formation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formation.mois_cible ? `Mois ${formation.mois_cible}` : '-'}
                  </TableCell>
                  <TableCell>{getPhaseBadge(formation.phase)}</TableCell>
                  <TableCell>{getStatutBadge(formation.statut)}</TableCell>
                  <TableCell>
                    {formation.cost_planned ? `${formation.cost_planned}€` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {formation.phase === 'PREVISIONNEL' && formation.statut === 'EN_ATTENTE_VALIDATION' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleValidateFormations([formation.id], 'validate')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleValidateFormations([formation.id], 'reject')}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
