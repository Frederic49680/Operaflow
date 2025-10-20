-- ============================================================================
-- Script de correction des policies RLS pour TOUTES les tables du module Formations
-- Version 2 : Suppression complète avant recréation
-- ============================================================================

-- ============================================================================
-- TABLE : organismes_formation
-- ============================================================================

-- Supprimer TOUTES les policies existantes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'organismes_formation') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON organismes_formation';
    END LOOP;
END $$;

-- Recréer les policies
CREATE POLICY "Lecture publique des organismes"
    ON organismes_formation FOR SELECT
    USING (true);

CREATE POLICY "Insertion organismes par tous"
    ON organismes_formation FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification organismes par tous"
    ON organismes_formation FOR UPDATE
    USING (true);

CREATE POLICY "Suppression organismes par tous"
    ON organismes_formation FOR DELETE
    USING (true);

-- ============================================================================
-- TABLE : formations_catalogue
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'formations_catalogue') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON formations_catalogue';
    END LOOP;
END $$;

CREATE POLICY "Lecture publique du catalogue"
    ON formations_catalogue FOR SELECT
    USING (true);

CREATE POLICY "Insertion catalogue par tous"
    ON formations_catalogue FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification catalogue par tous"
    ON formations_catalogue FOR UPDATE
    USING (true);

CREATE POLICY "Suppression catalogue par tous"
    ON formations_catalogue FOR DELETE
    USING (true);

-- ============================================================================
-- TABLE : formations_tarifs
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'formations_tarifs') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON formations_tarifs';
    END LOOP;
END $$;

CREATE POLICY "Lecture publique des tarifs"
    ON formations_tarifs FOR SELECT
    USING (true);

CREATE POLICY "Insertion tarifs par tous"
    ON formations_tarifs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification tarifs par tous"
    ON formations_tarifs FOR UPDATE
    USING (true);

CREATE POLICY "Suppression tarifs par tous"
    ON formations_tarifs FOR DELETE
    USING (true);

-- ============================================================================
-- TABLE : formations_sessions
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'formations_sessions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON formations_sessions';
    END LOOP;
END $$;

CREATE POLICY "Lecture publique des sessions"
    ON formations_sessions FOR SELECT
    USING (true);

CREATE POLICY "Insertion sessions par tous"
    ON formations_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification sessions par tous"
    ON formations_sessions FOR UPDATE
    USING (true);

CREATE POLICY "Suppression sessions par tous"
    ON formations_sessions FOR DELETE
    USING (true);

-- ============================================================================
-- TABLE : plan_formation_ressource
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'plan_formation_ressource') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON plan_formation_ressource';
    END LOOP;
END $$;

CREATE POLICY "Lecture publique du plan"
    ON plan_formation_ressource FOR SELECT
    USING (true);

CREATE POLICY "Insertion plan par tous"
    ON plan_formation_ressource FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification plan par tous"
    ON plan_formation_ressource FOR UPDATE
    USING (true);

CREATE POLICY "Suppression plan par tous"
    ON plan_formation_ressource FOR DELETE
    USING (true);

-- ============================================================================
-- TABLE : formations (habilitations)
-- ============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'formations') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON formations';
    END LOOP;
END $$;

CREATE POLICY "Lecture publique des formations"
    ON formations FOR SELECT
    USING (true);

CREATE POLICY "Insertion formations par tous"
    ON formations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification formations par tous"
    ON formations FOR UPDATE
    USING (true);

CREATE POLICY "Suppression formations par tous"
    ON formations FOR DELETE
    USING (true);

-- ============================================================================
-- Vérifier que RLS est activé sur toutes les tables
-- ============================================================================

ALTER TABLE organismes_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_formation_ressource ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Commentaires
-- ============================================================================

COMMENT ON TABLE organismes_formation IS 'Référentiel des organismes de formation - RLS activé avec policies ouvertes';
COMMENT ON TABLE formations_catalogue IS 'Catalogue des formations - RLS activé avec policies ouvertes';
COMMENT ON TABLE formations_tarifs IS 'Tarifs des formations - RLS activé avec policies ouvertes';
COMMENT ON TABLE formations_sessions IS 'Sessions de formation - RLS activé avec policies ouvertes';
COMMENT ON TABLE plan_formation_ressource IS 'Plan prévisionnel - RLS activé avec policies ouvertes';
COMMENT ON TABLE formations IS 'Habilitations - RLS activé avec policies ouvertes';

