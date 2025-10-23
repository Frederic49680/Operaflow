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
import { Plus, Edit, Trash2, Users, Calendar, MapPin, User } from 'lucide-react';

interface SessionFormation {
  id: string;
  formation_id: string;
  intitule: string;
  date_debut: string;
  date_fin: string;
  lieu?: string;
  formateur?: string;
  statut: string;
  nb_participants: number;
  cout_session?: number;
  created_at: string;
  // Relations
  formation?: {
    intitule: string;
    category: string;
    duree_jours: number;
  };
}

interface CatalogueFormation {
  formation_id: string;
  intitule: string;
  category: string;
  duree_jours: number;
}

export default function SessionsFormationManager() {
  const [sessions, setSessions] = useState<SessionFormation[]>([]);
  const [catalogueFormations, setCatalogueFormations] = useState<CatalogueFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionFormation | null>(null);
  const [formData, setFormData] = useState<Partial<SessionFormation>>({});

  const supabase = createClient();

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:catalogue_formations(intitule, category, duree_jours)
        `)
        .order('date_debut', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadCatalogueFormations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('catalogue_formations')
        .select('formation_id, intitule, category, duree_jours')
        .eq('actif', true)
        .order('intitule');

      if (error) throw error;
      setCatalogueFormations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement du catalogue:', error);
    }
  }, [supabase]);

  useEffect(() => {
    loadSessions();
    loadCatalogueFormations();
  }, [loadSessions, loadCatalogueFormations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSession) {
        const { error } = await supabase
          .from('formation_sessions')
          .update(formData)
          .eq('id', editingSession.id);

        if (error) throw error;
        toast.success('Session mise à jour');
      } else {
        const { error } = await supabase
          .from('formation_sessions')
          .insert([formData]);

        if (error) throw error;
        toast.success('Session créée');
      }

      setShowForm(false);
      setEditingSession(null);
      setFormData({});
      loadSessions();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (session: SessionFormation) => {
    setEditingSession(session);
    setFormData(session);
    setShowForm(true);
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

    try {
      const { error } = await supabase
        .from('formation_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Session supprimée');
      loadSessions();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (sessionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PLANIFIEE' ? 'EN_COURS' : 
                     currentStatus === 'EN_COURS' ? 'TERMINEE' : 
                     currentStatus === 'TERMINEE' ? 'ANNULEE' : 'PLANIFIEE';

    try {
      const { error } = await supabase
        .from('formation_sessions')
        .update({ statut: newStatus })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Statut mis à jour');
      loadSessions();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      'PLANIFIEE': 'secondary',
      'EN_COURS': 'default',
      'TERMINEE': 'outline',
      'ANNULEE': 'destructive'
    } as const;

    const labels = {
      'PLANIFIEE': 'Planifiée',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée'
    };

    return (
      <Badge variant={variants[statut as keyof typeof variants] || 'secondary'}>
        {labels[statut as keyof typeof labels] || statut}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sessions de Formation</h2>
          <p className="text-muted-foreground">
            Gestion des sessions de formation planifiées
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? 'Modifier la session' : 'Nouvelle session'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formation_id">Formation *</Label>
                  <Select
                    value={formData.formation_id || ''}
                    onValueChange={(value) => setFormData({ ...formData, formation_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogueFormations.map((formation) => (
                        <SelectItem key={formation.formation_id} value={formation.formation_id}>
                          {formation.intitule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intitule">Intitulé de la session *</Label>
                  <Input
                    id="intitule"
                    value={formData.intitule || ''}
                    onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_debut">Date de début *</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={formData.date_debut || ''}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_fin">Date de fin *</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={formData.date_fin || ''}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lieu">Lieu</Label>
                  <Input
                    id="lieu"
                    value={formData.lieu || ''}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="formateur">Formateur</Label>
                  <Input
                    id="formateur"
                    value={formData.formateur || ''}
                    onChange={(e) => setFormData({ ...formData, formateur: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nb_participants">Nombre de participants</Label>
                  <Input
                    id="nb_participants"
                    type="number"
                    value={formData.nb_participants || 0}
                    onChange={(e) => setFormData({ ...formData, nb_participants: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="cout_session">Coût de la session (€)</Label>
                  <Input
                    id="cout_session"
                    type="number"
                    step="0.01"
                    value={formData.cout_session || ''}
                    onChange={(e) => setFormData({ ...formData, cout_session: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingSession ? 'Mettre à jour' : 'Créer'}
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
            <Calendar className="h-5 w-5 mr-2" />
            Sessions planifiées ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.intitule}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.formation?.intitule}</div>
                      <Badge className={getCategoryColor(session.formation?.category || 'AUTRE')}>
                        {session.formation?.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Début: {new Date(session.date_debut).toLocaleDateString()}</div>
                      <div>Fin: {new Date(session.date_fin).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {session.lieu || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {session.formateur || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {session.nb_participants}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.cout_session ? `${session.cout_session}€` : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(session.id, session.statut)}
                    >
                      {getStatutBadge(session.statut)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(session)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(session.id)}
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
