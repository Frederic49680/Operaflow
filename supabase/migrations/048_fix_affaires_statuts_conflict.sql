-- ============================================================================
-- Migration 048 : Correction du conflit de statuts des affaires
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-20
-- Description : Résoudre le conflit entre les migrations 017 et 033 pour les statuts
-- ============================================================================

-- ============================================================================
-- SUPPRIMER LA CONTRAINTE CONFLICTUELLE DE LA MIGRATION 017
-- ============================================================================
ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;

-- ============================================================================
-- RÉTABLIR LA CONTRAINTE CORRECTE AVEC TOUS LES STATUTS
-- ============================================================================
ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
CHECK (statut IN ('Brouillon', 'A_planifier', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'));

-- ============================================================================
-- MISE À JOUR DES COMMENTAIRES
-- ============================================================================
COMMENT ON COLUMN affaires.statut IS 'Statut de l''affaire : Brouillon, A_planifier, Validée, Planifiée, En suivi, Clôturée';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Contrainte CHECK corrigée avec succès !';
  RAISE NOTICE 'Statuts disponibles : Brouillon, A_planifier, Validée, Planifiée, En suivi, Clôturée';
END $$;
