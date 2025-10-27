-- Migration 071: Ajouter les nouveaux statuts pour le cycle de vie des activités
-- Date: 2025-01-27
-- Description: Ajouter les statuts "Suspendu", "Reporté", "Prolongé" à la contrainte CHECK de planning_taches

-- 1. Supprimer l'ancienne contrainte CHECK
ALTER TABLE planning_taches DROP CONSTRAINT IF EXISTS planning_taches_statut_check;

-- 2. Recréer la contrainte CHECK avec tous les statuts valides
ALTER TABLE planning_taches ADD CONSTRAINT planning_taches_statut_check 
CHECK (statut IN (
  'Non lancé',
  'En cours', 
  'Terminé',
  'Bloqué',
  'Suspendu',
  'Reporté',
  'Prolongé'
));

-- 3. Mettre à jour la contrainte CHECK de remontee_site pour être cohérente
ALTER TABLE remontee_site DROP CONSTRAINT IF EXISTS remontee_site_statut_reel_check;

ALTER TABLE remontee_site ADD CONSTRAINT remontee_site_statut_reel_check 
CHECK (statut_reel IN (
  'Non lancée',
  'En cours',
  'Terminée', 
  'Bloquée',
  'Suspendue',
  'Reportée',
  'Prolongée'
));

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 071 terminée avec succès !';
  RAISE NOTICE 'Nouveaux statuts ajoutés : Suspendu, Reporté, Prolongé (masculins pour planning_taches)';
  RAISE NOTICE 'Nouveaux statuts ajoutés : Suspendue, Reportée, Prolongée (féminins pour remontee_site)';
  RAISE NOTICE 'Contraintes CHECK mises à jour pour les deux tables';
END $$;
