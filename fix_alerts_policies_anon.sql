-- ============================================
-- FIX : Politiques RLS pour table alerts (ANON + AUTHENTICATED)
-- ============================================
-- Date : 2025-01-20
-- Description : Autorise les utilisateurs anon ET authenticated
-- ============================================

-- Supprimer TOUTES les anciennes politiques
DROP POLICY IF EXISTS "Insertion alerte par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Lecture alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Modification alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Suppression alertes par utilisateur authentifié" ON alerts;

-- Créer les nouvelles politiques pour ANON ET AUTHENTICATED

-- Politique INSERT : ANON + AUTHENTICATED
CREATE POLICY "Insertion alerte par tous les utilisateurs"
    ON alerts FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Politique SELECT : ANON + AUTHENTICATED
CREATE POLICY "Lecture alertes par tous les utilisateurs"
    ON alerts FOR SELECT
    TO anon, authenticated
    USING (true);

-- Politique UPDATE : ANON + AUTHENTICATED
CREATE POLICY "Modification alertes par tous les utilisateurs"
    ON alerts FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Politique DELETE : ANON + AUTHENTICATED
CREATE POLICY "Suppression alertes par tous les utilisateurs"
    ON alerts FOR DELETE
    TO anon, authenticated
    USING (true);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Pour vérifier que les politiques sont bien créées :
-- SELECT * FROM pg_policies WHERE tablename = 'alerts';
-- ============================================

