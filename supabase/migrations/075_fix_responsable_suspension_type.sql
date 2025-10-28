-- Migration 075: Modifier responsable_suspension pour accepter du texte au lieu d'UUID
-- Date: 2025-01-27
-- Description: Permettre l'utilisation de chaînes de caractères pour responsable_suspension

-- Supprimer la contrainte de clé étrangère
ALTER TABLE planning_taches DROP CONSTRAINT IF EXISTS planning_taches_responsable_suspension_fkey;

-- Modifier le type de la colonne pour accepter du texte
ALTER TABLE planning_taches ALTER COLUMN responsable_suspension TYPE TEXT;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 075 terminée avec succès !';
  RAISE NOTICE 'Champ responsable_suspension modifié pour accepter du texte au lieu d''UUID';
END $$;
