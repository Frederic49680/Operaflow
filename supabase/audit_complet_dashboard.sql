-- ============================================================================
-- AUDIT COMPLET - Système de Planification & Pilotage
-- ============================================================================
-- Date : 2025-01-18
-- Description : Audit complet de la base de données, migrations, fonctions, triggers
-- Version : Compatible Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFICATION DES TABLES
-- ============================================================================

-- Liste des tables attendues
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'sites',
        'ressources',
        'absences',
        'clients',
        'interlocuteurs',
        'affaires',
        'affaires_lots',
        'planning_taches',
        'taches_ressources',
        'remontee_site',
        'remontee_site_reporting',
        'tache_suspensions',
        'site_blocages',
        'confirmation_queue',
        'maintenance_batteries',
        'maintenance_journal',
        'maintenance_monthly_digest',
        'affaires_interlocuteurs',
        'interactions_client',
        'claims',
        'claim_history',
        'claim_comments',
        'historique_actions',
        'alerts',
        'roles',
        'permissions',
        'role_permissions',
        'user_roles',
        'page_access_rules',
        'component_flags',
        'user_tokens',
        'audit_log',
        'app_users'
    ];
    table_name TEXT;
    missing_tables TEXT[] := '{}';
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) IS NULL THEN
        RAISE NOTICE '✓ Toutes les tables sont présentes';
    ELSE
        RAISE WARNING '✗ Tables manquantes : %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- ============================================================================
-- 2. VÉRIFICATION DES COLONNES CRITIQUES
-- ============================================================================

-- Vérifier maintenance_journal (v1.2.4)
DO $$
DECLARE
    has_tranche BOOLEAN;
    has_systeme_elementaire BOOLEAN;
    has_etat_confirme BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_journal' 
        AND column_name = 'tranche'
    ) INTO has_tranche;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_journal' 
        AND column_name = 'systeme_elementaire'
    ) INTO has_systeme_elementaire;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'maintenance_journal' 
        AND column_name = 'etat_confirme'
    ) INTO has_etat_confirme;
    
    IF has_tranche THEN
        RAISE NOTICE '✓ maintenance_journal.tranche existe';
    ELSE
        RAISE WARNING '✗ maintenance_journal.tranche manquante';
    END IF;
    
    IF has_systeme_elementaire THEN
        RAISE NOTICE '✓ maintenance_journal.systeme_elementaire existe';
    ELSE
        RAISE WARNING '✗ maintenance_journal.systeme_elementaire manquante';
    END IF;
    
    IF NOT has_etat_confirme THEN
        RAISE NOTICE '✓ maintenance_journal.etat_confirme correctement supprimée';
    ELSE
        RAISE WARNING '✗ maintenance_journal.etat_confirme devrait être supprimée';
    END IF;
END $$;

-- ============================================================================
-- 3. VÉRIFICATION DES CONTRAINTES
-- ============================================================================

-- Vérifier les contraintes CHECK
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('maintenance_journal', 'remontee_site', 'planning_taches')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 4. VÉRIFICATION DES INDEX
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('maintenance_journal', 'remontee_site', 'planning_taches')
ORDER BY tablename, indexname;

-- ============================================================================
-- 5. VÉRIFICATION DES FONCTIONS
-- ============================================================================

-- Liste des fonctions attendues
DO $$
DECLARE
    expected_functions TEXT[] := ARRAY[
        'fn_auto_descente_realisation',
        'fn_confirm_en_cours',
        'fn_apply_site_blocage',
        'fn_resume_from_report',
        'fn_auto_close_suspension',
        'fn_recalc_tache_effort',
        'fn_update_affaire_dates',
        'fn_validate_dependencies',
        'fn_recalc_lot_avancement',
        'fn_generate_maintenance_monthly_summary',
        'fn_export_maintenance_monthly_csv',
        'fn_send_maintenance_monthly_digest',
        'calculate_heures_metal',
        'fn_aggregate_affaire_avancement',
        'fn_aggregate_lot_avancement'
    ];
    func_name TEXT;
    missing_funcs TEXT[] := '{}';
BEGIN
    FOREACH func_name IN ARRAY expected_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = func_name
        ) THEN
            missing_funcs := array_append(missing_funcs, func_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_funcs, 1) IS NULL THEN
        RAISE NOTICE '✓ Toutes les fonctions sont présentes';
    ELSE
        RAISE WARNING '✗ Fonctions manquantes : %', array_to_string(missing_funcs, ', ');
    END IF;
END $$;

-- ============================================================================
-- 6. VÉRIFICATION DES TRIGGERS
-- ============================================================================

SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 7. VÉRIFICATION DES VUES
-- ============================================================================

SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name LIKE 'V_%'
ORDER BY table_name;

-- ============================================================================
-- 8. TEST DES FONCTIONS MAINTENANCE
-- ============================================================================

-- Test fn_generate_maintenance_monthly_summary
DO $$
DECLARE
    test_site_id UUID;
    test_result JSONB;
BEGIN
    -- Récupérer un site de test
    SELECT id INTO test_site_id FROM sites LIMIT 1;
    
    IF test_site_id IS NOT NULL THEN
        -- Tester la fonction
        SELECT fn_generate_maintenance_monthly_summary(
            test_site_id,
            CURRENT_DATE
        ) INTO test_result;
        
        RAISE NOTICE '✓ fn_generate_maintenance_monthly_summary fonctionne';
        RAISE NOTICE '  Résultat : %', test_result;
    ELSE
        RAISE WARNING '✗ Aucun site disponible pour tester fn_generate_maintenance_monthly_summary';
    END IF;
END $$;

-- Test fn_export_maintenance_monthly_csv
DO $$
DECLARE
    test_site_id UUID;
    test_csv TEXT;
BEGIN
    SELECT id INTO test_site_id FROM sites LIMIT 1;
    
    IF test_site_id IS NOT NULL THEN
        SELECT fn_export_maintenance_monthly_csv(
            test_site_id,
            CURRENT_DATE
        ) INTO test_csv;
        
        RAISE NOTICE '✓ fn_export_maintenance_monthly_csv fonctionne';
        RAISE NOTICE '  CSV généré : % caractères', length(test_csv);
    ELSE
        RAISE WARNING '✗ Aucun site disponible pour tester fn_export_maintenance_monthly_csv';
    END IF;
END $$;

-- ============================================================================
-- 9. TEST DU TRIGGER CALCUL HEURES METAL
-- ============================================================================

DO $$
DECLARE
    test_site_id UUID;
    test_journal_id UUID;
    test_heures_metal NUMERIC;
BEGIN
    SELECT id INTO test_site_id FROM sites LIMIT 1;
    
    IF test_site_id IS NOT NULL THEN
        -- Insérer une intervention de test
        INSERT INTO maintenance_journal (
            site_id,
            date_jour,
            tranche,
            systeme_elementaire,
            systeme,
            type_maintenance,
            etat_reel,
            heures_presence,
            heures_suspension,
            created_by
        ) VALUES (
            test_site_id,
            CURRENT_DATE,
            0,
            'TEST001',
            'Test',
            'Test',
            'En_cours',
            4.0,
            0.5,
            NULL
        ) RETURNING id INTO test_journal_id;
        
        -- Vérifier que le trigger a calculé les heures métal
        SELECT heures_metal INTO test_heures_metal
        FROM maintenance_journal
        WHERE id = test_journal_id;
        
        IF test_heures_metal = 3.5 THEN
            RAISE NOTICE '✓ Trigger calculate_heures_metal fonctionne correctement';
            RAISE NOTICE '  Heures métal calculées : %', test_heures_metal;
        ELSE
            RAISE WARNING '✗ Trigger calculate_heures_metal incorrect (attendu: 3.5, obtenu: %)', test_heures_metal;
        END IF;
        
        -- Nettoyer
        DELETE FROM maintenance_journal WHERE id = test_journal_id;
    ELSE
        RAISE WARNING '✗ Aucun site disponible pour tester le trigger';
    END IF;
END $$;

-- ============================================================================
-- 10. VÉRIFICATION DES DONNÉES DE TEST
-- ============================================================================

SELECT 
    'Sites' as table_name,
    COUNT(*) as nb_rows
FROM sites
UNION ALL
SELECT 
    'Ressources',
    COUNT(*)
FROM ressources
UNION ALL
SELECT 
    'Absences',
    COUNT(*)
FROM absences
UNION ALL
SELECT 
    'Affaires',
    COUNT(*)
FROM affaires
UNION ALL
SELECT 
    'Planning Tâches',
    COUNT(*)
FROM planning_taches
UNION ALL
SELECT 
    'Remontées Site',
    COUNT(*)
FROM remontee_site
UNION ALL
SELECT 
    'Maintenance Journal',
    COUNT(*)
FROM maintenance_journal
ORDER BY table_name;

-- ============================================================================
-- 11. VÉRIFICATION DES VUES DASHBOARD
-- ============================================================================

-- Tester V_Dashboard_Maintenance
SELECT * FROM V_Dashboard_Maintenance;

-- Tester V_Dashboard_RH
SELECT * FROM V_Dashboard_RH;

-- Tester V_Dashboard_Affaires
SELECT * FROM V_Dashboard_Affaires;

-- ============================================================================
-- 12. VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 13. RÉSUMÉ DE L'AUDIT
-- ============================================================================

DO $$
DECLARE
    nb_tables INTEGER;
    nb_functions INTEGER;
    nb_triggers INTEGER;
    nb_views INTEGER;
    nb_policies INTEGER;
BEGIN
    -- Compter les tables
    SELECT COUNT(*) INTO nb_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- Compter les fonctions
    SELECT COUNT(*) INTO nb_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    -- Compter les triggers
    SELECT COUNT(*) INTO nb_triggers
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    -- Compter les vues
    SELECT COUNT(*) INTO nb_views
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name LIKE 'V_%';
    
    -- Compter les politiques RLS
    SELECT COUNT(*) INTO nb_policies
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'RÉSUMÉ DE L''AUDIT';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Tables : %', nb_tables;
    RAISE NOTICE 'Fonctions : %', nb_functions;
    RAISE NOTICE 'Triggers : %', nb_triggers;
    RAISE NOTICE 'Vues Dashboard : %', nb_views;
    RAISE NOTICE 'Politiques RLS : %', nb_policies;
    RAISE NOTICE '';
    RAISE NOTICE 'Audit terminé avec succès !';
    RAISE NOTICE '==================================================';
END $$;

