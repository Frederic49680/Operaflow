-- Migration 026 : Ajout des politiques RLS pour la table alerts
-- Date : 2025-01-20
-- Description : Ajout des politiques INSERT, UPDATE, DELETE pour la table alerts

-- Activer RLS sur la table alerts si ce n'est pas déjà fait
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Politique INSERT : Permettre l'insertion d'alertes pour tous les utilisateurs authentifiés
CREATE POLICY "Insertion alerte par utilisateur authentifié"
    ON alerts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique SELECT : Permettre la lecture des alertes pour tous les utilisateurs authentifiés
CREATE POLICY "Lecture alertes par utilisateur authentifié"
    ON alerts FOR SELECT
    TO authenticated
    USING (true);

-- Politique UPDATE : Permettre la mise à jour des alertes pour tous les utilisateurs authentifiés
CREATE POLICY "Modification alertes par utilisateur authentifié"
    ON alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique DELETE : Permettre la suppression des alertes pour tous les utilisateurs authentifiés
CREATE POLICY "Suppression alertes par utilisateur authentifié"
    ON alerts FOR DELETE
    TO authenticated
    USING (true);

-- Commentaires
COMMENT ON POLICY "Insertion alerte par utilisateur authentifié" ON alerts IS 
    'Permet à tout utilisateur authentifié de créer des alertes (pour les notifications automatiques)';

COMMENT ON POLICY "Lecture alertes par utilisateur authentifié" ON alerts IS 
    'Permet à tout utilisateur authentifié de lire les alertes';

COMMENT ON POLICY "Modification alertes par utilisateur authentifié" ON alerts IS 
    'Permet à tout utilisateur authentifié de modifier les alertes (ex: marquer comme lu)';

COMMENT ON POLICY "Suppression alertes par utilisateur authentifié" ON alerts IS 
    'Permet à tout utilisateur authentifié de supprimer les alertes';

