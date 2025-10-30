-- Migration 090: Corriger les références de roles vers job_functions
-- Objectif: Mettre à jour les FK pour pointer vers job_functions au lieu de roles

-- 1. Pour assignment.role_expected : changer de roles(code) vers job_functions(code)
DO $$
BEGIN
    -- Vérifier si la FK existe et la supprimer
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assignments_role_expected_fkey'
        AND table_name = 'assignments'
    ) THEN
        ALTER TABLE assignments DROP CONSTRAINT assignments_role_expected_fkey;
        RAISE NOTICE 'FK assignments.role_expected -> roles(code) supprimée';
    END IF;
    
    -- Créer la nouvelle FK vers job_functions
    ALTER TABLE assignments 
    ADD CONSTRAINT assignments_role_expected_fkey 
    FOREIGN KEY (role_expected) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK assignments.role_expected -> job_functions(code) créée';
END $$;

-- 2. Pour provisional_assignments.acting_as_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'provisional_assignments_acting_as_role_fkey'
        AND table_name = 'provisional_assignments'
    ) THEN
        ALTER TABLE provisional_assignments DROP CONSTRAINT provisional_assignments_acting_as_role_fkey;
        RAISE NOTICE 'FK provisional_assignments.acting_as_role -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE provisional_assignments 
    ADD CONSTRAINT provisional_assignments_acting_as_role_fkey 
    FOREIGN KEY (acting_as_role) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK provisional_assignments.acting_as_role -> job_functions(code) créée';
END $$;

-- 3. Pour provisional_assignments.user_primary_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'provisional_assignments_user_primary_role_fkey'
        AND table_name = 'provisional_assignments'
    ) THEN
        ALTER TABLE provisional_assignments DROP CONSTRAINT provisional_assignments_user_primary_role_fkey;
        RAISE NOTICE 'FK provisional_assignments.user_primary_role -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE provisional_assignments 
    ADD CONSTRAINT provisional_assignments_user_primary_role_fkey 
    FOREIGN KEY (user_primary_role) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK provisional_assignments.user_primary_role -> job_functions(code) créée';
END $$;

-- 4. Pour substitution_rules.when_missing_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'substitution_rules_when_missing_role_fkey'
        AND table_name = 'substitution_rules'
    ) THEN
        ALTER TABLE substitution_rules DROP CONSTRAINT substitution_rules_when_missing_role_fkey;
        RAISE NOTICE 'FK substitution_rules.when_missing_role -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE substitution_rules 
    ADD CONSTRAINT substitution_rules_when_missing_role_fkey 
    FOREIGN KEY (when_missing_role) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK substitution_rules.when_missing_role -> job_functions(code) créée';
END $$;

-- 5. Pour substitution_rules.can_play_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'substitution_rules_can_play_role_fkey'
        AND table_name = 'substitution_rules'
    ) THEN
        ALTER TABLE substitution_rules DROP CONSTRAINT substitution_rules_can_play_role_fkey;
        RAISE NOTICE 'FK substitution_rules.can_play_role -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE substitution_rules 
    ADD CONSTRAINT substitution_rules_can_play_role_fkey 
    FOREIGN KEY (can_play_role) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK substitution_rules.can_play_role -> job_functions(code) créée';
END $$;

-- 6. Pour substitution_rules.requires_approval_level
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'substitution_rules_requires_approval_level_fkey'
        AND table_name = 'substitution_rules'
    ) THEN
        ALTER TABLE substitution_rules DROP CONSTRAINT substitution_rules_requires_approval_level_fkey;
        RAISE NOTICE 'FK substitution_rules.requires_approval_level -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE substitution_rules 
    ADD CONSTRAINT substitution_rules_requires_approval_level_fkey 
    FOREIGN KEY (requires_approval_level) REFERENCES job_functions(code) ON DELETE SET NULL;
    
    RAISE NOTICE 'FK substitution_rules.requires_approval_level -> job_functions(code) créée';
END $$;

-- 7. Pour resource_roles.role_code
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'resource_roles_role_code_fkey'
        AND table_name = 'resource_roles'
    ) THEN
        ALTER TABLE resource_roles DROP CONSTRAINT resource_roles_role_code_fkey;
        RAISE NOTICE 'FK resource_roles.role_code -> roles(code) supprimée';
    END IF;
    
    ALTER TABLE resource_roles 
    ADD CONSTRAINT resource_roles_role_code_fkey 
    FOREIGN KEY (role_code) REFERENCES job_functions(code) ON DELETE CASCADE;
    
    RAISE NOTICE 'FK resource_roles.role_code -> job_functions(code) créée';
END $$;

-- COMMENTAIRES : Clarifier que roles = app, job_functions = métier
COMMENT ON TABLE roles IS 'Rôles applicatifs (droits d''accès) - Dossier utilisateur dans l''app';
COMMENT ON TABLE job_functions IS 'Fonctions métier (hiérarchie) - Fonction dans l''entreprise';

COMMENT ON COLUMN assignments.role_expected IS 'Fonction métier attendue (job_functions)';
COMMENT ON COLUMN provisional_assignments.acting_as_role IS 'Fonction métier jouée provisoirement (job_functions)';
COMMENT ON COLUMN provisional_assignments.user_primary_role IS 'Fonction métier principale du user (job_functions)';
COMMENT ON COLUMN substitution_rules.when_missing_role IS 'Fonction métier manquante (job_functions)';
COMMENT ON COLUMN substitution_rules.can_play_role IS 'Fonction métier qui peut remplacer (job_functions)';
COMMENT ON COLUMN substitution_rules.requires_approval_level IS 'Niveau de fonction métier requis pour approbation (job_functions)';
COMMENT ON COLUMN resource_roles.role_code IS 'Fonction métier de la ressource (job_functions)';

-- RÉSUMÉ
-- ✅ roles = Rôles applicatifs (droits) -> pour user_roles, role_permissions, page_access_rules, component_flags
-- ✅ job_functions = Fonctions métier (hiérarchie) -> pour resource_job_functions, assignments, provisional_assignments, substitution_rules, resource_roles
