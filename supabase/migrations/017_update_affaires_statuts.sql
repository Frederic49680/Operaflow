-- ============================================================================
-- Migration 017 : Mise à jour des statuts des affaires
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Mise à jour de la contrainte CHECK pour inclure les nouveaux statuts du cycle de vie
-- ============================================================================

-- ============================================================================
-- SUPPRIMER L'ANCIENNE CONTRAINTE
-- ============================================================================
ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;

-- ============================================================================
-- AJOUTER LA NOUVELLE CONTRAINTE AVEC TOUS LES STATUTS
-- ============================================================================
ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
CHECK (statut IN ('Brouillon', 'Soumise', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'));

-- ============================================================================
-- MISE À JOUR DES COMMENTAIRES
-- ============================================================================
COMMENT ON COLUMN affaires.statut IS 'Statut de l''affaire : Brouillon, Soumise, Validée, Planifiée, En suivi, Clôturée';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Contrainte CHECK mise à jour avec succès !';
  RAISE NOTICE 'Nouveaux statuts disponibles : Brouillon, Soumise, Validée, Planifiée, En suivi, Clôturée';
END $$;

