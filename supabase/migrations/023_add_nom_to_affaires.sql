-- ============================================================================
-- Migration 023 : Ajout de la colonne nom dans affaires
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-21
-- Description : Ajout de la colonne nom manquante dans la table affaires
-- ============================================================================

-- Ajouter la colonne nom
ALTER TABLE affaires
  ADD COLUMN IF NOT EXISTS nom TEXT;

-- Commentaire
COMMENT ON COLUMN affaires.nom IS 'Nom complet de l''affaire';

