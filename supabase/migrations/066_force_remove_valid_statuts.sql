-- Migration 066: Forcer la suppression des statuts "Validée" et "En suivi"
-- Date: 2025-01-27
-- Description: Force la suppression des statuts "Validée" et "En suivi" et met à jour la contrainte CHECK

-- 1. Migrer les statuts existants AVANT de recréer la contrainte
-- "En suivi" → "Planifiée"
UPDATE affaires 
SET statut = 'Planifiée' 
WHERE statut = 'En suivi';

-- "Validée" → "Planifiée" si l'affaire a des tâches planifiées
UPDATE affaires a
SET statut = 'Planifiée'
WHERE a.statut = 'Validée'
AND EXISTS (
  SELECT 1 FROM planning_taches pt 
  WHERE pt.affaire_id = a.id 
  AND pt.date_debut_plan IS NOT NULL
);

-- "Validée" → "A_planifier" si l'affaire n'a pas encore de tâches planifiées
UPDATE affaires a
SET statut = 'A_planifier'
WHERE a.statut = 'Validée'
AND NOT EXISTS (
  SELECT 1 FROM planning_taches pt 
  WHERE pt.affaire_id = a.id 
  AND pt.date_debut_plan IS NOT NULL
);

-- 2. Supprimer l'ancienne contrainte CHECK
ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;

-- 3. Recréer la contrainte CHECK sans "Validée" et "En suivi"
ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
CHECK (statut IN ('Brouillon', 'A_planifier', 'Planifiée', 'Clôturée'));

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 066 terminée avec succès !';
  RAISE NOTICE 'Statuts disponibles : Brouillon, A_planifier, Planifiée, Clôturée';
  RAISE NOTICE 'Les statuts "Validée" et "En suivi" ont été supprimés';
END $$;
