-- Script de test simplifié pour le module Plan de Formation
-- À exécuter après l'application de la migration

-- 1. Vérifier que les tables existent
SELECT 'Vérification des tables:' as test;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'catalogue_formations',
    'ressource_formations', 
    'plan_formations',
    'plan_snapshots',
    'training_finance_ledger',
    'plan_change_orders',
    'formation_sessions',
    'session_participants'
)
ORDER BY table_name;

-- 2. Vérifier les données de test du catalogue
SELECT 'Catalogue des formations:' as test;
SELECT intitule, category, tarif_unitaire, actif 
FROM catalogue_formations 
ORDER BY category, intitule;

-- 3. Vérifier les fonctions existent
SELECT 'Vérification des fonctions:' as test;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'generate_plan_previsionnel',
    'commit_plan_formation',
    'get_plan_kpis'
)
ORDER BY routine_name;

-- 4. Test création d'une session de formation
INSERT INTO formation_sessions (
    formation_id, 
    intitule, 
    date_debut, 
    date_fin, 
    lieu, 
    formateur, 
    statut, 
    nb_participants, 
    cout_session
) VALUES (
    (SELECT formation_id FROM catalogue_formations LIMIT 1),
    'Session test SST',
    '2025-02-15',
    '2025-02-16',
    'Salle de formation',
    'Formateur SST',
    'PLANIFIEE',
    12,
    350.00
);

SELECT 'Session de formation créée:' as test;
SELECT intitule, date_debut, date_fin, lieu, formateur, statut
FROM formation_sessions
WHERE intitule = 'Session test SST';

-- 5. Test des RLS policies
SELECT 'Test des politiques RLS:' as test;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'catalogue_formations',
    'ressource_formations', 
    'plan_formations',
    'plan_snapshots',
    'training_finance_ledger',
    'plan_change_orders',
    'formation_sessions',
    'session_participants'
)
AND schemaname = 'public';

-- 6. Test de la fonction generate_plan_previsionnel (sans données)
SELECT 'Test génération plan prévisionnel 2025 (vide):' as test;
SELECT generate_plan_previsionnel(2025) as result;

-- 7. Vérifier qu'aucune ligne n'a été créée (normal car pas de données)
SELECT 'Lignes du plan prévisionnel 2025:' as test;
SELECT COUNT(*) as nb_lignes
FROM plan_formations 
WHERE annee = 2025;

-- 8. Nettoyage des données de test
DELETE FROM formation_sessions WHERE intitule = 'Session test SST';
DELETE FROM plan_formations WHERE annee = 2025;
DELETE FROM plan_snapshots WHERE annee = 2025;

SELECT 'Données de test nettoyées' as result;
