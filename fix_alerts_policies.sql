-- ============================================
-- FIX : Politiques RLS pour la table alerts
-- ============================================
-- Date : 2025-01-20
-- Description : Permet la création d'alertes automatiques (visite médicale, etc.)
-- 
-- INSTRUCTIONS :
-- 1. Copie ce fichier dans le SQL Editor de Supabase
-- 2. Clique sur "Run"
-- 3. Tu devrais voir "Success. No rows returned"
-- ============================================

-- Activer RLS sur la table alerts si ce n'est pas déjà fait
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Insertion alerte par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Lecture alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Modification alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Suppression alertes par utilisateur authentifié" ON alerts;

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

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Vérification : Si tu vois "Success. No rows returned", c'est bon !
-- Tu peux maintenant créer des absences maladie > 30 jours
-- ============================================

