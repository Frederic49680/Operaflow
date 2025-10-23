-- Script de test pour le module Plan de Formation
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

-- 3. Tester la fonction de génération du plan prévisionnel
SELECT 'Test génération plan prévisionnel 2025:' as test;
SELECT generate_plan_previsionnel(2025) as result;

-- 4. Vérifier les lignes créées
SELECT 'Lignes du plan prévisionnel 2025:' as test;
SELECT 
    pf.annee,
    pf.mois_cible,
    pf.category,
    pf.phase,
    pf.statut,
    r.nom,
    r.prenom,
    cf.intitule
FROM plan_formations pf
JOIN ressources r ON pf.resource_id = r.id
JOIN catalogue_formations cf ON pf.formation_id = cf.formation_id
WHERE pf.annee = 2025
ORDER BY pf.mois_cible;

-- 5. Tester la fonction de validation du plan
SELECT 'Test validation du plan:' as test;
SELECT commit_plan_formation(2025) as result;

-- 6. Vérifier les KPIs
SELECT 'KPIs du plan 2025:' as test;
SELECT get_plan_kpis(2025) as kpis;

-- 7. Vérifier les snapshots créés
SELECT 'Snapshots créés:' as test;
SELECT annee, version, tot_count, tot_cost, committed_at
FROM plan_snapshots
ORDER BY annee DESC, version DESC;

-- 8. Test création d'une session de formation
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

-- 9. Test des RLS policies
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

-- 10. Nettoyage des données de test
DELETE FROM formation_sessions WHERE intitule = 'Session test SST';
DELETE FROM plan_formations WHERE annee = 2025;
DELETE FROM plan_snapshots WHERE annee = 2025;

SELECT 'Données de test nettoyées' as result;
