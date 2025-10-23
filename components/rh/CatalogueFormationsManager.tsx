"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

interface CatalogueFormation {
  formation_id: string;
  intitule: string;
  validite_mois: number;
  duree_jours: number;
  category: string;
  organisme_id?: string;
  tarif_unitaire: number;
  tarif_groupe: number;
  min_participants: number;
  max_participants: number;
  actif: boolean;
}

export default function CatalogueFormationsManager() {
  const [formations, setFormations] = useState<CatalogueFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<CatalogueFormation | null>(null);
  const [formData, setFormData] = useState<Partial<CatalogueFormation>>({});

  const supabase = createClient();

  const loadFormations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catalogue_formations')
        .select('*')
        .order('intitule');

      if (error) throw error;
      setFormations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadFormations();
  }, [loadFormations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFormation) {
        const { error } = await supabase
          .from('catalogue_formations')
          .update(formData)
          .eq('formation_id', editingFormation.formation_id);

        if (error) throw error;
        toast.success('Formation mise à jour');
      } else {
        const { error } = await supabase
          .from('catalogue_formations')
          .insert([formData]);

        if (error) throw error;
        toast.success('Formation créée');
      }

      setShowForm(false);
      setEditingFormation(null);
      setFormData({});
      loadFormations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (formation: CatalogueFormation) => {
    setEditingFormation(formation);
    setFormData(formation);
    setShowForm(true);
  };

  const handleDelete = async (formationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    try {
      const { error } = await supabase
        .from('catalogue_formations')
        .delete()
        .eq('formation_id', formationId);

      if (error) throw error;
      toast.success('Formation supprimée');
      loadFormations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (formationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('catalogue_formations')
        .update({ actif: !currentStatus })
        .eq('formation_id', formationId);

      if (error) throw error;
      toast.success('Statut mis à jour');
      loadFormations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Catalogue des Formations</h2>
          <p className="text-muted-foreground">
            Gestion du catalogue des formations disponibles
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFormation ? 'Modifier la formation' : 'Nouvelle formation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intitule">Intitulé *</Label>
                  <Input
                    id="intitule"
                    value={formData.intitule || ''}
                    onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category || ''}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECURITE">Sécurité</SelectItem>
                      <SelectItem value="QUALITE">Qualité</SelectItem>
                      <SelectItem value="AUTO">Auto</SelectItem>
                      <SelectItem value="TECHNIQUE">Technique</SelectItem>
                      <SelectItem value="MANAGEMENT">Management</SelectItem>
                      <SelectItem value="AUTRE">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="validite_mois">Validité (mois)</Label>
                  <Input
                    id="validite_mois"
                    type="number"
                    value={formData.validite_mois || ''}
                    onChange={(e) => setFormData({ ...formData, validite_mois: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="duree_jours">Durée (jours)</Label>
                  <Input
                    id="duree_jours"
                    type="number"
                    value={formData.duree_jours || ''}
                    onChange={(e) => setFormData({ ...formData, duree_jours: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="min_participants">Min participants</Label>
                  <Input
                    id="min_participants"
                    type="number"
                    value={formData.min_participants || 1}
                    onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_participants">Max participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants || 20}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 20 })}
                  />
                </div>
                <div>
                  <Label htmlFor="tarif_unitaire">Tarif unitaire (€)</Label>
                  <Input
                    id="tarif_unitaire"
                    type="number"
                    step="0.01"
                    value={formData.tarif_unitaire || ''}
                    onChange={(e) => setFormData({ ...formData, tarif_unitaire: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="tarif_groupe">Tarif groupe (€)</Label>
                  <Input
                    id="tarif_groupe"
                    type="number"
                    step="0.01"
                    value={formData.tarif_groupe || ''}
                    onChange={(e) => setFormData({ ...formData, tarif_groupe: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingFormation ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Formations disponibles ({formations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intitulé</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Tarifs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formations.map((formation) => (
                <TableRow key={formation.formation_id}>
                  <TableCell className="font-medium">{formation.intitule}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(formation.category)}>
                      {formation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{formation.duree_jours} jour(s)</TableCell>
                  <TableCell>{formation.validite_mois} mois</TableCell>
                  <TableCell>
                    {formation.min_participants}-{formation.max_participants}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Unité: {formation.tarif_unitaire}€</div>
                      <div>Groupe: {formation.tarif_groupe}€</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={formation.actif ? "default" : "outline"}
                      onClick={() => handleToggleStatus(formation.formation_id, formation.actif)}
                    >
                      {formation.actif ? 'Actif' : 'Inactif'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(formation)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(formation.formation_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
