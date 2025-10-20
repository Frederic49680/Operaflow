-- ============================================================================
-- Script de correction RLS pour TOUTES les tables de formations
-- ============================================================================

-- S'assurer que RLS est activé sur toutes les tables
ALTER TABLE organismes_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_formation_ressource ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- organismes_formation
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique des organismes" ON organismes_formation;
DROP POLICY IF EXISTS "Insertion organismes par tous" ON organismes_formation;
DROP POLICY IF EXISTS "Modification organismes par tous" ON organismes_formation;
DROP POLICY IF EXISTS "Suppression organismes par tous" ON organismes_formation;

CREATE POLICY "Lecture publique des organismes"
    ON organismes_formation FOR SELECT
    USING (true);

CREATE POLICY "Insertion organismes par tous"
    ON organismes_formation FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification organismes par tous"
    ON organismes_formation FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression organismes par tous"
    ON organismes_formation FOR DELETE
    USING (true);

-- ============================================================================
-- formations_catalogue
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique du catalogue" ON formations_catalogue;
DROP POLICY IF EXISTS "Insertion catalogue par tous" ON formations_catalogue;
DROP POLICY IF EXISTS "Modification catalogue par tous" ON formations_catalogue;
DROP POLICY IF EXISTS "Suppression catalogue par tous" ON formations_catalogue;

CREATE POLICY "Lecture publique du catalogue"
    ON formations_catalogue FOR SELECT
    USING (true);

CREATE POLICY "Insertion catalogue par tous"
    ON formations_catalogue FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification catalogue par tous"
    ON formations_catalogue FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression catalogue par tous"
    ON formations_catalogue FOR DELETE
    USING (true);

-- ============================================================================
-- formations_tarifs
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique des tarifs" ON formations_tarifs;
DROP POLICY IF EXISTS "Insertion tarifs par tous" ON formations_tarifs;
DROP POLICY IF EXISTS "Modification tarifs par tous" ON formations_tarifs;
DROP POLICY IF EXISTS "Suppression tarifs par tous" ON formations_tarifs;

CREATE POLICY "Lecture publique des tarifs"
    ON formations_tarifs FOR SELECT
    USING (true);

CREATE POLICY "Insertion tarifs par tous"
    ON formations_tarifs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification tarifs par tous"
    ON formations_tarifs FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression tarifs par tous"
    ON formations_tarifs FOR DELETE
    USING (true);

-- ============================================================================
-- formations_sessions
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique des sessions" ON formations_sessions;
DROP POLICY IF EXISTS "Insertion sessions par tous" ON formations_sessions;
DROP POLICY IF EXISTS "Modification sessions par tous" ON formations_sessions;
DROP POLICY IF EXISTS "Suppression sessions par tous" ON formations_sessions;

CREATE POLICY "Lecture publique des sessions"
    ON formations_sessions FOR SELECT
    USING (true);

CREATE POLICY "Insertion sessions par tous"
    ON formations_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification sessions par tous"
    ON formations_sessions FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression sessions par tous"
    ON formations_sessions FOR DELETE
    USING (true);

-- ============================================================================
-- plan_formation_ressource
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique du plan" ON plan_formation_ressource;
DROP POLICY IF EXISTS "Insertion plan par tous" ON plan_formation_ressource;
DROP POLICY IF EXISTS "Modification plan par tous" ON plan_formation_ressource;
DROP POLICY IF EXISTS "Suppression plan par tous" ON plan_formation_ressource;

CREATE POLICY "Lecture publique du plan"
    ON plan_formation_ressource FOR SELECT
    USING (true);

CREATE POLICY "Insertion plan par tous"
    ON plan_formation_ressource FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification plan par tous"
    ON plan_formation_ressource FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression plan par tous"
    ON plan_formation_ressource FOR DELETE
    USING (true);

-- ============================================================================
-- formations (habilitations)
-- ============================================================================
DROP POLICY IF EXISTS "Lecture publique des formations" ON formations;
DROP POLICY IF EXISTS "Insertion formations par tous" ON formations;
DROP POLICY IF EXISTS "Modification formations par tous" ON formations;
DROP POLICY IF EXISTS "Suppression formations par tous" ON formations;

CREATE POLICY "Lecture publique des formations"
    ON formations FOR SELECT
    USING (true);

CREATE POLICY "Insertion formations par tous"
    ON formations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification formations par tous"
    ON formations FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Suppression formations par tous"
    ON formations FOR DELETE
    USING (true);

-- ============================================================================
-- Vérifications
-- ============================================================================

-- Vérifier les données
SELECT 'organismes_formation' as table_name, COUNT(*) as count FROM organismes_formation
UNION ALL
SELECT 'formations_catalogue', COUNT(*) FROM formations_catalogue
UNION ALL
SELECT 'formations_tarifs', COUNT(*) FROM formations_tarifs
UNION ALL
SELECT 'formations_sessions', COUNT(*) FROM formations_sessions
UNION ALL
SELECT 'plan_formation_ressource', COUNT(*) FROM plan_formation_ressource
UNION ALL
SELECT 'formations', COUNT(*) FROM formations;

