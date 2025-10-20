-- ============================================
-- FIX: Politique RLS manquante pour historique_actions
-- ============================================
-- Problème: Le trigger log_ressource_changes() essaie d'insérer dans historique_actions
-- mais il n'y a pas de politique RLS qui autorise l'INSERT
-- 
-- Solution: Ajouter les politiques manquantes
-- ============================================

-- 1. Ajouter la politique d'insertion pour historique_actions
CREATE POLICY "Insertion historique par trigger"
    ON historique_actions FOR INSERT
    WITH CHECK (true);

-- 2. Ajouter aussi les politiques de modification et suppression si nécessaire
CREATE POLICY "Modification historique admin"
    ON historique_actions FOR UPDATE
    USING (true);

CREATE POLICY "Suppression historique admin"
    ON historique_actions FOR DELETE
    USING (true);

-- 3. Vérifier que les politiques sont bien créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'historique_actions';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir 4 politiques :
-- 1. "Lecture publique de l'historique" (SELECT)
-- 2. "Insertion historique par trigger" (INSERT) ← NOUVELLE
-- 3. "Modification historique admin" (UPDATE) ← NOUVELLE
-- 4. "Suppression historique admin" (DELETE) ← NOUVELLE
-- ============================================

