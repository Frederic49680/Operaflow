-- Migration: Fix RLS policy pour historique_actions
-- Description: Ajouter la politique d'insertion manquante pour permettre aux triggers d'insérer dans historique_actions
-- Date: 2025-01-20

-- Ajouter la politique d'insertion pour historique_actions
CREATE POLICY "Insertion historique par trigger"
    ON historique_actions FOR INSERT
    WITH CHECK (true);

-- Ajouter aussi les politiques de modification et suppression si nécessaire
CREATE POLICY "Modification historique admin"
    ON historique_actions FOR UPDATE
    USING (true);

CREATE POLICY "Suppression historique admin"
    ON historique_actions FOR DELETE
    USING (true);

-- Commentaire
COMMENT ON POLICY "Insertion historique par trigger" ON historique_actions 
    IS 'Permet aux triggers d''insérer dans l''historique des actions';

